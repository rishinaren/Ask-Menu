-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS menu_chunks (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_chunks_restaurant_id ON menu_chunks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_chunks_embedding ON menu_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_menu_chunks_content_gin ON menu_chunks USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_menu_chunks_content_gist ON menu_chunks USING gist(content gist_trgm_ops);