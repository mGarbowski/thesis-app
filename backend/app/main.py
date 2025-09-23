import uuid
from datetime import datetime
from io import BytesIO

import numpy as np
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, DateTime, LargeBinary
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import sessionmaker, declarative_base
from torch import Tensor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/face_recognition"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession)
Base = declarative_base()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

detector = MTCNN(
    margin=32,
    select_largest=True,
    device=device,
).eval()

feature_extractor = InceptionResnetV1(
    pretrained="vggface2",
    device=device
).eval()


class FaceRecognitionSystem:
    def __init__(self, detector, feature_extractor):
        self.detector: MTCNN = detector
        self.feature_extractor: InceptionResnetV1 = feature_extractor

    def get_cropped_image(self, image: Image) -> Tensor:
        return self.detector(image)

    def compute_feature_vector(self, cropped_image: Tensor) -> np.ndarray:
        return self.feature_extractor(cropped_image.unsqueeze(0)).detach().cpu().numpy().flatten()


face_recognition_system = FaceRecognitionSystem(detector, feature_extractor)


def tensor_to_bytes(tensor: torch.Tensor) -> bytes:
    """Convert RGB tensor to JPEG bytes"""
    # Move to CPU and convert to numpy
    np_array = tensor.detach().cpu().numpy()

    # Convert from (C, H, W) to (H, W, C)
    np_array = np_array.transpose(1, 2, 0)

    # Check the range and normalize accordingly
    if np_array.min() >= -1 and np_array.max() <= 1:
        # Values are in [-1, 1] range, normalize to [0, 255]
        np_array = ((np_array + 1) * 127.5).astype(np.uint8)
    elif np_array.min() >= 0 and np_array.max() <= 1:
        # Values are in [0, 1] range, scale to [0, 255]
        np_array = (np_array * 255).astype(np.uint8)
    else:
        # Assume values are already in [0, 255] range
        np_array = np.clip(np_array, 0, 255).astype(np.uint8)

    # Convert to PIL Image and then to bytes
    pil_image = Image.fromarray(np_array)
    byte_io = BytesIO()
    pil_image.save(byte_io, format='JPEG')
    return byte_io.getvalue()


class FaceImage(Base):
    __tablename__ = "face_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_data = Column(LargeBinary, nullable=False)
    feature_vector = mapped_column(Vector(512))
    filename = Column(String(255))
    label = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)


@app.post("/upload-face")
async def upload_face(
        file: UploadFile = File(...),
        label: str = Form(...)
):
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")
        cropped_img = face_recognition_system.get_cropped_image(image)
        feature_vector = face_recognition_system.compute_feature_vector(cropped_img)

        async with async_session() as session:
            face_image = FaceImage(
                image_data=tensor_to_bytes(cropped_img),
                feature_vector=feature_vector,
                filename=file.filename,
                label=label
            )

            session.add(face_image)
            await session.commit()
            await session.refresh(face_image)

            return {
                "id": str(face_image.id),
                "filename": face_image.filename,
                "label": face_image.label,
                "message": "Face image uploaded successfully"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/faces")
async def get_faces():
    try:
        async with async_session() as session:
            result = await session.execute(select(FaceImage))
            faces = result.scalars().all()

            return {
                "faces": [
                    {
                        "id": str(face.id),
                        "filename": face.filename,
                        "label": face.label,
                        "created_at": face.created_at.isoformat()
                    }
                    for face in faces
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch faces: {str(e)}")


@app.get("/faces/{face_id}/image")
async def get_face_image(face_id: str):
    try:
        async with async_session() as session:
            result = await session.execute(
                select(FaceImage).where(FaceImage.id == uuid.UUID(face_id))
            )
            face = result.scalar_one_or_none()

            if not face:
                raise HTTPException(status_code=404, detail="Face image not found")

            return Response(
                content=face.image_data,
                media_type="image/jpeg"
            )

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid face ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch image: {str(e)}")


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")
        cropped_img = face_recognition_system.get_cropped_image(image)
        search_vector = face_recognition_system.compute_feature_vector(cropped_img).tolist()

        async with async_session() as session:
            result = await session.execute(
                select(
                    FaceImage,
                    FaceImage.feature_vector.cosine_distance(search_vector).label('cosine_distance')
                )
                .order_by(FaceImage.feature_vector.cosine_distance(search_vector))
            )
            row = result.first()

            if not row:
                raise HTTPException(status_code=404, detail="No faces found in database")

            closest_face = row[0]
            cosine_distance = row[1]
            cosine_similarity = 1 - cosine_distance

            return {
                "cosine_similarity": cosine_similarity,
                "cosine_distance": cosine_distance,
                "matched_record": {
                    "id": str(closest_face.id),
                    "filename": closest_face.filename,
                    "label": closest_face.label,
                    "created_at": closest_face.created_at.isoformat(),
                    "feature_vector": closest_face.feature_vector.tolist()
                },
                "search_vector": search_vector,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")
