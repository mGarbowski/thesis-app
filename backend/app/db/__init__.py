"""Database initialization, session management and data model."""

from .model import FaceImage
from .session import get_db

__all__ = [
    "get_db",
    "FaceImage",
]
