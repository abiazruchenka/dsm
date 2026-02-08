CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    image VARCHAR(255),
    link VARCHAR(255),
    date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS galleries (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY,
    object_key VARCHAR(500) NOT NULL UNIQUE,
    bucket VARCHAR(255) NOT NULL,

    original_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    versions JSONB,
    gallery_id UUID,
    block_id UUID,

    caption VARCHAR(255),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_gallery_id ON photos(gallery_id);

CREATE TABLE IF NOT EXISTS reenactment_categories (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    text TEXT,
    image VARCHAR(255),
    category_id UUID REFERENCES reenactment_categories(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blocks_sort_order ON blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_blocks_category_id ON blocks(category_id);