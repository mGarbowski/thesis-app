"""Service for face recognition operations.

- Uses FaceEmbeddingService to process images.
- Handles database interactions.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import Sequence
from uuid import UUID

from fastapi import Depends, UploadFile
from PIL import Image
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.db import FaceImage, get_db
from app.services.face_embedding import FaceEmbeddingService, get_face_embedding_service


@dataclass
class RecognitionResult:
    """Result of face recognition search."""

    face_image: FaceImage
    cosine_similarity: float
    cosine_distance: float
    search_vector: list[float]


class FaceRecognitionService:
    """Application service for face recognition operations."""

    def __init__(self, face_embedding_service: FaceEmbeddingService, db: AsyncSession):
        self.face_embedding_service = face_embedding_service
        self.db = db

    def _to_pil_image(self, image_bytes: bytes) -> Image.Image:
        """Create PIL Image from raw image data."""
        return Image.open(BytesIO(image_bytes)).convert("RGB")

    async def add_face_image(self, file: UploadFile, label: str) -> FaceImage:
        """Add a new face image to the database."""
        image_data = await file.read()
        image = self._to_pil_image(image_data)
        cropped_img = self.face_embedding_service.get_cropped_image(image)
        feature_vector = self.face_embedding_service.compute_feature_vector(cropped_img)

        face_image = FaceImage(
            image_data=image_data,
            feature_vector=feature_vector,
            label=label,
            filename=file.filename,
        )

        self.db.add(face_image)
        await self.db.commit()
        await self.db.refresh(face_image)

        return face_image

    async def get_faces(self, page: int, page_size: int) -> Sequence[FaceImage]:
        """Retrieve paginated list of face images.

        Lightweight, no image data included.
        """
        offset = (page - 1) * page_size

        result = await self.db.execute(
            select(FaceImage)
            .order_by(FaceImage.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return result.scalars().all()

    async def get_all_faces_count(self) -> int:
        """Get total count of face images in the database.

        For pagination purposes.
        """
        result = await self.db.execute(select(text("COUNT(*)")).select_from(FaceImage))
        return result.scalar_one()

    async def get_face_by_id(self, id: str) -> FaceImage:
        """Retrieve a face image record by its ID."""
        result = await self.db.execute(
            select(FaceImage).where(FaceImage.id == UUID(id))
        )
        return result.scalar_one_or_none()

    async def find_closest_face(self, file: UploadFile) -> RecognitionResult | None:
        """Find the closest matching face in the database for the uploaded image.

        Returns the closest face in terms of cosine similarity.
        Search uses pgvector vector index for efficiency.
        According to pgvector docs, the results are approximate and may not be 100% accurate
        as a tradeoff for speed.

        https://github.com/pgvector/pgvector?tab=readme-ov-file#indexing
        """
        image_data = await file.read()
        image = self._to_pil_image(image_data)
        cropped_img = self.face_embedding_service.get_cropped_image(image)
        search_vector = self.face_embedding_service.compute_feature_vector(
            cropped_img
        ).tolist()

        result = await self.db.execute(
            select(
                FaceImage,
                FaceImage.feature_vector.cosine_distance(search_vector).label(
                    "cosine_distance"
                ),
            )
            .order_by(FaceImage.feature_vector.cosine_distance(search_vector))
            .limit(1)
        )
        row = result.first()

        if not row:
            return None

        closest_face = row[0]
        cosine_distance = row[1]
        cosine_similarity = 1 - cosine_distance

        return RecognitionResult(
            face_image=closest_face,
            cosine_similarity=cosine_similarity,
            cosine_distance=cosine_distance,
            search_vector=search_vector,
        )


def get_face_recognition_service(
    face_embedding_service=Depends(get_face_embedding_service), db=Depends(get_db)
) -> FaceRecognitionService:
    """Dependency injector for FaceRecognitionService."""
    return FaceRecognitionService(face_embedding_service, db)
