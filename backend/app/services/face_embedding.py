"""Service for extracting face embeddings using ML models.

- Interface and Torch implementation for FaceEmbeddingService.
- Initialization and loading weights for facenet-pytorch models.
- Dependency injection setup for FastAPI.
"""

from typing import Protocol

import numpy as np
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL.Image import Image
from torch import Tensor

from app.config import settings
from app.logging import logger


class FaceEmbeddingService(Protocol):
    """Interface for face embedding services."""

    def get_cropped_image(self, image: Image) -> Tensor:
        """Use face detection model to crop and align face from input image."""
        ...

    def compute_feature_vector(self, cropped_image: Tensor) -> np.ndarray:
        """Compute feature vector from cropped face image."""
        ...


class TorchFaceEmbeddingService(FaceEmbeddingService):
    """Implementation of FaceEmbeddingService using models from facenet-pytorch library."""

    def __init__(self, detector: MTCNN, feature_extractor: InceptionResnetV1):
        self.detector: MTCNN = detector
        self.feature_extractor: InceptionResnetV1 = feature_extractor

    def get_cropped_image(self, image: Image) -> Tensor:
        """Detect and crop face from input image using MTCNN detector."""
        return self.detector(image)

    def compute_feature_vector(self, cropped_image: Tensor) -> np.ndarray:
        """Compute feature vector from cropped face image using InceptionResnetV1 model."""
        return (
            self.feature_extractor(cropped_image.unsqueeze(0))
            .detach()
            .cpu()
            .numpy()
            .flatten()
        )


def get_device() -> torch.device:
    """Get available device for PyTorch (prefer GPU, fallback to CPU)."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_feature_extractor(
    weights_path: str | None, weights_key: str, device: torch.device
) -> InceptionResnetV1:
    """Load InceptionResnetV1 model with pretrained or custom weights.

    If no file with model weights is provided, use pretrained weights from facenet-pytorch library.
    """
    model = InceptionResnetV1(pretrained="vggface2")
    if weights_path is not None:
        logger.info(f"Loading facenet weights from: {weights_path}")
        state_dict = torch.load(weights_path, weights_only=True)
        if weights_key in state_dict:
            state_dict = state_dict[weights_key]

        model.load_state_dict(state_dict)

    model.to(device)
    model.eval()
    return model


def load_face_detector(device: torch.device) -> MTCNN:
    """Load MTCNN face detection model."""
    return MTCNN(
        margin=32,
        select_largest=True,
        device=device,
    ).eval()


device = get_device()
logger.info(f"Using device: {device}")

_detector = load_face_detector(device)

_feature_extractor = load_feature_extractor(
    settings.facenet_weights_path, settings.facenet_weights_key, device
)

_face_embedding_service = TorchFaceEmbeddingService(_detector, _feature_extractor)


def get_face_embedding_service() -> FaceEmbeddingService:
    """Dependency injector for FastAPI to provide FaceEmbeddingService instance.

    FaceEmbeddingService is a singleton, initialized once at application startup.
    """
    return _face_embedding_service
