from typing import Any
from uuid import UUID

import pytest
from httpx import AsyncClient


async def upload_face(client: AsyncClient, filename: str, label: str) -> UUID:
    """Upload face and return the assigned UUID."""
    with open("tests/assets/" + filename, "rb") as f:
        response = await client.post(
            "/api/faces/",
            files={"file": (filename, f, "image/jpeg")},
            data={"label": label},
        )
    assert response.status_code == 200

    data = response.json()
    person_id = UUID(data["id"])

    assert data["label"] == label
    assert data["filename"] == filename
    assert "image uploaded successfully" in data["message"].lower()

    return person_id


async def check_face_in_list(
    client: AsyncClient, person_id: UUID, label: str, filename: str
):
    response = await client.get("/api/faces/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["faces"]) >= 1
    assert any(UUID(face["id"]) == person_id for face in data["faces"])

    entry = next(face for face in data["faces"] if UUID(face["id"]) == person_id)
    assert entry["label"] == label
    assert entry["filename"] == filename


async def check_download_image(client: AsyncClient, person_id: UUID):
    response = await client.get(f"/api/faces/{person_id}/image")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert len(response.content) > 0


async def recognize_face(client: AsyncClient, filename: str) -> dict[str, Any]:
    with open(f"tests/assets/{filename}", "rb") as f:
        response = await client.post(
            "/api/faces/recognize",
            files={"file": (filename, f, "image/jpeg")},
        )
    assert response.status_code == 200
    data = response.json()
    return data


@pytest.mark.asyncio
async def test_recognition_pipeline(client, clean_db):
    """Test the full recognition pipeline.

    - Add two different persons with one image each.
    - Verify both persons are in the list.
    - Verify both images can be downloaded.
    - Verify that another image of person 1 is recognized correctly.
    """
    person_1_label = "Person 1"
    person_2_label = "Person 2"

    person_1_file_1 = "person_1_face_1.jpg"
    person_1_file_2 = "person_1_face_2.jpg"
    person_2_file_1 = "person_2_face_1.jpg"

    person_1_id = await upload_face(client, person_1_file_1, person_1_label)
    person_2_id = await upload_face(client, person_2_file_1, person_2_label)

    await check_face_in_list(client, person_1_id, person_1_label, person_1_file_1)
    await check_face_in_list(client, person_2_id, person_2_label, person_2_file_1)

    await check_download_image(client, person_1_id)
    await check_download_image(client, person_2_id)

    result = await recognize_face(client, person_1_file_2)

    assert 0 < result["cosine_similarity"] < 1
    assert 0 < result["cosine_distance"] < 1
    assert len(result["search_vector"]) == 512

    assert result["matched_record"]["id"] == str(person_1_id)
    assert result["matched_record"]["label"] == person_1_label
    assert result["matched_record"]["filename"] == person_1_file_1
    assert "created_at" in result["matched_record"]
    assert len(result["matched_record"]["feature_vector"]) == 512
