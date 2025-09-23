from io import BytesIO

import numpy as np
import torch
from PIL import Image
from app.db import get_db, FaceImage
from app.services import get_face_recognition_service, FaceRecognitionService
from fastapi import Depends
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


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


@app.post("/upload-face")
async def upload_face(
        file: UploadFile = File(...),
        label: str = Form(...),
        face_rec_service: FaceRecognitionService = Depends(get_face_recognition_service)
):
    try:
        face_image = await face_rec_service.add_face_image(file, label)

        return {
            "id": str(face_image.id),
            "filename": face_image.filename,
            "label": face_image.label,
            "message": "Face image uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/faces")
async def get_faces(face_rec_service: FaceRecognitionService = Depends(get_face_recognition_service)):
    try:
        faces = await face_rec_service.get_all_faces()

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
async def get_face_image(face_id: str,
                         face_rec_service: FaceRecognitionService = Depends(get_face_recognition_service)):
    try:
        face = await face_rec_service.get_face_by_id(face_id)

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
async def recognize(file: UploadFile = File(...),
                    face_rec_service: FaceRecognitionService = Depends(get_face_recognition_service)):
    try:
        result = await face_rec_service.find_closest_face(file)

        if not result:
            raise HTTPException(status_code=404, detail="No faces found in database")

        return {
            "cosine_similarity": result.cosine_similarity,
            "cosine_distance": result.cosine_distance,
            "matched_record": {
                "id": str(result.face_image.id),
                "filename": result.face_image.filename,
                "label": result.face_image.label,
                "created_at": result.face_image.created_at.isoformat(),
                "feature_vector": result.face_image.feature_vector.tolist()
            },
            "search_vector": result.search_vector,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")
