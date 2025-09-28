"""This is a script for seeding the database with face images from the LFW dataset
(or another dataset with a similar structure).

It sends REST API requests to the backend server to create person entries.

The dataset directory should have the following structure:
- dataset/
    - Person_A/
        - image1.jpg
        - image2.jpg
    - Person_B/
        - image1.jpg
        - image2.jpg
    - ...
"""

import argparse
import os
from dataclasses import dataclass

import requests


@dataclass
class Configuration:
    dataset_path: str
    api_url: str
    num_entries: int


class ApiClient:
    upload_endpoint = "/api/faces/"

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.upload_url = f"{self.base_url}{self.upload_endpoint}"

    def create_face_entry(self, image_path: str, label: str):
        with open(image_path, "rb") as img_file:
            files = {"file": (image_path, img_file, "image/jpeg")}
            data = {"label": label}
            response = requests.post(self.upload_url, files=files, data=data)
            response.raise_for_status()
            return response.json()


def process_dataset(config: Configuration, api_client: ApiClient):
    num_uploaded = 0

    for face_dir in os.listdir(config.dataset_path):
        person_dir = os.path.join(config.dataset_path, face_dir)
        if not os.path.isdir(person_dir):
            continue

        label = face_dir
        some_image = os.listdir(person_dir)[0]
        image_path = os.path.join(person_dir, some_image)
        try:
            response = api_client.create_face_entry(image_path, label)
            print(f"Uploaded {image_path} as {label}: {response}")
            num_uploaded += 1
            if num_uploaded >= config.num_entries:
                break
        except Exception as e:
            print(f"Failed to upload {image_path}: {e}")
            continue


def main():
    parser = argparse.ArgumentParser(description='Seed the database with face images from the LFW dataset')
    parser.add_argument('--dataset_path', type=str, required=True, help='Path to the dataset directory')
    parser.add_argument('--api_url', type=str, default='http://localhost:8000', help='Base URL of the backend API')
    parser.add_argument('--num_entries', type=int, default=1000, help='Number of entries to create')

    args = parser.parse_args()

    config = Configuration(dataset_path=args.dataset_path, api_url=args.api_url, num_entries=args.num_entries)

    api_client = ApiClient(base_url=config.api_url)
    process_dataset(config, api_client)


if __name__ == "__main__":
    main()
