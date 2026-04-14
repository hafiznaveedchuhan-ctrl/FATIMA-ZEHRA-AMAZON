-- Migration: Create Categories Table
-- Description: Product categories for organization
-- Date: 2026-01-26

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add comments
COMMENT ON TABLE categories IS 'Product categories';
COMMENT ON COLUMN categories.name IS 'Category name (unique)';
COMMENT ON COLUMN categories.description IS 'Category description for UI';
COMMENT ON COLUMN categories.image_url IS 'Category banner image';
