from app.services import get_face_recognition_service, FaceRecognitionService
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Response

faces_router = APIRouter()


@faces_router.post("/upload-face")
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


@faces_router.get("/faces")
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


@faces_router.get("/faces/{face_id}/image")
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


@faces_router.post("/recognize")
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
