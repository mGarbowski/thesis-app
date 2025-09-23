from io import BytesIO

from PIL import Image
from app.db import FaceImage, get_db
from app.services.face_embedding import FaceEmbeddingService
from app.services.face_embedding import get_face_embedding_service
from fastapi import Depends, UploadFile
from sqlalchemy.ext.asyncio.session import AsyncSession


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


def get_face_recognition_service(
        face_embedding_service=Depends(get_face_embedding_service),
        db=Depends(get_db)
) -> FaceRecognitionService:
    return FaceRecognitionService(face_embedding_service, db)
