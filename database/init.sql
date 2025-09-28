-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE face_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_data BYTEA NOT NULL,
    feature_vector vector(512),
    filename VARCHAR(255),
    label VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity index
-- https://github.com/pgvector/pgvector?tab=readme-ov-file#indexing
-- Index is approximate, trade-off between speed and recall
-- Search with no index provides perfect recall
-- For now, I did not encounter an issue with hnsw index, ivfflat on the other hand is not working well
-- I am leaving this index for now as it proivides a 10x speedup
-- It may need removing and falling back to full table scan if it causes issues
CREATE INDEX ON face_images USING hnsw (feature_vector vector_cosine_ops);

-- Regular indexes
CREATE INDEX idx_face_images_created_at ON face_images(created_at);
CREATE INDEX idx_face_images_label ON face_images(label);