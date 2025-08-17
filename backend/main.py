import uuid
from datetime import datetime

import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, DateTime, LargeBinary
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import sessionmaker, declarative_base

app = FastAPI()

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/face_recognition"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession)
Base = declarative_base()


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
        # TODO use ML models to generate feature vector
        random_vector = [0.0] * 512

        async with async_session() as session:
            face_image = FaceImage(
                image_data=image_data,
                feature_vector=random_vector,
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


@app.get("/search-similar")
async def search_similar():
    try:
        search_vector = np.random.random(512).tolist()

        async with async_session() as session:
            result = await session.scalars(
                select(FaceImage)
                .order_by(FaceImage.feature_vector.cosine_distance(search_vector))
            )
            closest_face = result.first()

            if not closest_face:
                raise HTTPException(status_code=404, detail="No faces found in database")


            return {
                "cosine_similarity": 0,
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
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")