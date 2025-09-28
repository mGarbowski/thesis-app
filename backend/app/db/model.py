import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, LargeBinary, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func

from .base import Base


class FaceImage(Base):
    __tablename__ = "face_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_data = Column(LargeBinary, nullable=False)
    feature_vector = mapped_column(Vector(512))
    filename = Column(String(255))
    label = Column(String(255))
    created_at = Column(DateTime, default=func.now())
