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
CREATE INDEX ON face_images USING ivfflat (feature_vector vector_cosine_ops);

-- Regular indexes
CREATE INDEX idx_face_images_created_at ON face_images(created_at);
CREATE INDEX idx_face_images_label ON face_images(label);