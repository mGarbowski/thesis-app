
const API_BASE_URL = 'http://localhost:8000';

const apiUrls = {
    recognize: `${API_BASE_URL}/recognize`,
    getImage: (id: string) => `${API_BASE_URL}/faces/${id}/image`,
    uploadFace: `${API_BASE_URL}/upload-face`,
}

export type EmbeddingVector = number[];

export interface RecognizeResponse {
    cosine_similarity: number;
    cosine_distance: number;
    search_vector: EmbeddingVector;
    matched_record: {
        id: string;
        filename: string;
        label: string;
        created_at: string;
        feature_vector: EmbeddingVector;
    }
}

const recognizeImage = async (image: File): Promise<RecognizeResponse> => {
    const formData = new FormData();
    formData.append('file', image);
    const response = await fetch(apiUrls.recognize, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Recognition failed');
    }

    return await response.json() as RecognizeResponse;
}

const getFaceImage = async (faceId: string): Promise<string> => {
    const response = await fetch(apiUrls.getImage(faceId));

    if (!response.ok) {
        throw new Error('Failed to fetch face image');
    }

    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
}

export interface UploadResponse {
  id: string;
  filename: string;
  label: string;
  message: string;
}

const uploadFace = async (image: File, label: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('label', label);

    const response = await fetch(apiUrls.uploadFace, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
    }

    return await response.json() as UploadResponse;
}

export const api = {
    recognizeImage,
    getFaceImage,
    uploadFace,
}