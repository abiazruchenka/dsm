CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contact(email);

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

DROP TABLE IF EXISTS galleries CASCADE;
create table if not exists galleries (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

create table if not exists photos (
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

    caption VARCHAR(255),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_gallery_id ON photos(gallery_id);