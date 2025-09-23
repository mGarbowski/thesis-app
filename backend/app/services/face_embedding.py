from typing import Protocol
from PIL.Image import Image
from torch import Tensor
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

class FaceEmbeddingService(Protocol):
    def get_cropped_image(self, image: Image) -> Tensor:
        ...

    def compute_feature_vector(self, cropped_image: Tensor) -> np.ndarray:
        ...


class TorchFaceEmbeddingService(FaceEmbeddingService):
    def __init__(self, detector: MTCNN, feature_extractor: InceptionResnetV1):
        self.detector: MTCNN = detector
        self.feature_extractor: InceptionResnetV1 = feature_extractor

    def get_cropped_image(self, image: Image) -> Tensor:
        return self.detector(image)

    def compute_feature_vector(self, cropped_image: Tensor) -> np.ndarray:
        return self.feature_extractor(cropped_image.unsqueeze(0)).detach().cpu().numpy().flatten()


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_detector = MTCNN(
    margin=32,
    select_largest=True,
    device=device,
).eval()

_feature_extractor = InceptionResnetV1(
    pretrained="vggface2",
    device=device
).eval()

_face_embedding_service = TorchFaceEmbeddingService(_detector, _feature_extractor)

def get_face_embedding_service() -> FaceEmbeddingService:
    return _face_embedding_service