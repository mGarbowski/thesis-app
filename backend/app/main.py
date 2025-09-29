"""Main application entry point for the FastAPI server.

- FastAPI app object
- API router includes
- CORS middleware setup
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import faces_router
from app.config import settings
from app.logging import logger

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_allowed_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(faces_router, prefix="/api/faces")

logger.info(f"Application settings: {settings}")
