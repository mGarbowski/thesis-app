# Setosa AI agent guide

This repo contains a small full‑stack demo for face recognition (FastAPI + PostgreSQL/pgvector + React/Vite), containerized for production with Nginx. Use this guide to stay productive and consistent with existing patterns.

## Big picture
- Frontend: React + Vite + TypeScript in `frontend/`. Talks to backend via `http://localhost:8000/api` during dev (see `frontend/src/api.ts`).
- Backend: FastAPI in `backend/app/` with async SQLAlchemy and pgvector. Main app: `app/main.py`; routers in `app/api/`; services in `app/services/`; DB in `app/db/`.
- Database: PostgreSQL with pgvector extension. Schema and index created by `database/init.sql` (HNSW index on 512‑dim feature vectors; approximate search for speed).
- Production: `docker-compose.yml` builds `backend` and `nginx`; Nginx serves frontend and proxies `/api` to backend. Model weights are mounted into the backend container.

## Backend patterns that matter
- Routing: Define REST endpoints in `app/api/*.py` and include routers in `app/main.py` (currently `faces_router` under `/api/faces`).
- DI and services: Use FastAPI Depends with service singletons/factories.
  - Face embeddings: `app/services/face_embedding.py` exposes `get_face_embedding_service()`; initialized once with MTCNN + InceptionResnetV1 (facenet‑pytorch) on startup.
  - Recognition and persistence: `app/services/face_recognition.py` handles image read→crop→embedding→DB insert/search; expose via `get_face_recognition_service()`.
- DB sessions: Import `get_db` from `app.db.session` and inject with Depends for async sessions. ORM model `FaceImage` in `app/db/model.py` stores: id UUID, raw `image_data` (bytea), `feature_vector` Vector(512), filename, label, created_at.
- Similarity search: Queries use `feature_vector.cosine_distance(search_vector)` and order by ascending distance; similarity = 1 − distance. Be aware results are approximate due to HNSW index (see comments in `database/init.sql` and `database/search_index_test.sql`).
- Config: `app/config.py` reads env via pydantic‑settings. Keys: `DATABASE_URL`, `CORS_ALLOWED_ORIGIN`, `ENABLE_SQLALCHEMY_LOGGING`, `FACENET_WEIGHTS_PATH`, `FACENET_WEIGHTS_KEY`.
- Logging: Simple stdout logger in dev (`app/logging.py`); prod uses `logging_config.yml` (wired by PDM script `prod`).
- Response shapes: Current endpoints return plain dicts (no Pydantic models). Preserve existing field names and types unless you update both frontend types and tests.

## Frontend conventions
- API URLs and types live in `frontend/src/api.ts` (e.g., `apiUrls`, `RecognizeResponse`, `GetFacesResponse`). If you change backend routes/payloads, adjust these types and helpers.
- UI pages under `frontend/src/pages/` and shared components under `frontend/src/components/`.
- Formatting/linting via Biome: `npm run fmt` (write) and `npm run check`.

## Developer workflows
- Backend (Python 3.12, PDM):
  - Install PDM and deps: `pdm install --dev --frozen-lockfile`
  - Run dev server with autoreload: `pdm dev` (FastAPI dev)
  - Tests: `pdm test`; Coverage: `pdm cov`
  - Format/sort: `pdm fmt`; Checks (black, isort, pyright): `pdm check`
  - Code metrics: `pdm metrics_all`
- Test DB: start with `docker compose -f database/docker-compose.yml up`. Tests connect to `localhost:5433` and recreate schema per run via fixtures in `backend/tests/conftest.py`.
- Frontend:
  - Install deps: `npm ci`
  - Dev server: `npm run dev`; Build: `npm run build`
- Production: `docker compose up --build` (root). Nginx serves SPA and proxies `/api` to backend service `face_recognition_backend_prod`.

## Integration details and gotchas
- Torch device auto‑select: `face_embedding.get_device()` prefers CUDA if available; otherwise CPU. Ensure model weights compatibility and path (`FACENET_WEIGHTS_PATH` env). If not provided, facenet‑pytorch pretrained weights are used.
- Image pipeline: uploads are read as bytes, converted to PIL, cropped/aligned via MTCNN, embeddings computed by InceptionResnetV1 to 512‑dim numpy vector; persisted in Postgres and used for cosine search.
- CORS: In prod via Nginx, CORS is typically unnecessary (same origin). In standalone dev, set `CORS_ALLOWED_ORIGIN` appropriately for the frontend origin.
- Large images: `image_data` is stored raw; keep responses lightweight by avoiding image blobs in list endpoints (see `GET /api/faces`).

## Examples to follow
- Endpoint pattern: see `app/api/faces.py` for upload (`POST /api/faces`), list (`GET /api/faces`), get image (`GET /api/faces/{id}/image`), recognize (`POST /api/faces/recognize`).
- DB search + vector ops: see `FaceRecognitionService.find_closest_face` for the canonical cosine distance query.
- Test an end‑to‑end flow: `backend/tests/test_integration.py::test_recognition_pipeline`.

If anything here seems off or you need more specifics (e.g., adding new entities, switching indexes, or defining Pydantic schemas), ask for clarification and we’ll extend this guide.