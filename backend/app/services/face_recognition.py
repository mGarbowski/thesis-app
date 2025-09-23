from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from uuid import UUID

from PIL import Image
from fastapi import Depends, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.db import FaceImage, get_db
from app.services.face_embedding import FaceEmbeddingService
from app.services.face_embedding import get_face_embedding_service


@dataclass
class RecognitionResult:
    face_image: FaceImage
    cosine_similarity: float
    cosine_distance: float
    search_vector: list[float]


class FaceRecognitionService:
    def __init__(self, face_embedding_service: FaceEmbeddingService, db: AsyncSession):
        self.face_embedding_service = face_embedding_service
        self.db = db

    def _to_pil_image(self, image_bytes: bytes) -> Image:
        return Image.open(BytesIO(image_bytes)).convert("RGB")

    async def add_face_image(self, file: UploadFile, label: str) -> FaceImage:
        image_data = await file.read()
        image = self._to_pil_image(image_data)
        cropped_img = self.face_embedding_service.get_cropped_image(image)
        feature_vector = self.face_embedding_service.compute_feature_vector(cropped_img)

        face_image = FaceImage(
            image_data=image_data,
            feature_vector=feature_vector,
            label=label,
            filename=file.filename
        )

        self.db.add(face_image)
        await self.db.commit()
        await self.db.refresh(face_image)

        return face_image

    async def get_all_faces(self):
        result = await self.db.execute(
            select(FaceImage)
        )
        return result.scalars().all()

    async def get_face_by_id(self, id: str) -> FaceImage:
        result = await self.db.execute(
            select(FaceImage).where(FaceImage.id == UUID(id))
        )
        return result.scalar_one_or_none()

    async def find_closest_face(self, file: UploadFile) -> RecognitionResult | None:
        image_data = await file.read()
        image = self._to_pil_image(image_data)
        cropped_img = self.face_embedding_service.get_cropped_image(image)
        search_vector = self.face_embedding_service.compute_feature_vector(cropped_img).tolist()

        result = await self.db.execute(
            select(
                FaceImage,
                FaceImage.feature_vector.cosine_distance(search_vector).label('cosine_distance')
            )
            .order_by(FaceImage.feature_vector.cosine_distance(search_vector))
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
            search_vector=search_vector
        )


def get_face_recognition_service(
        face_embedding_service=Depends(get_face_embedding_service),
        db=Depends(get_db)
) -> FaceRecognitionService:
    return FaceRecognitionService(face_embedding_service, db)
