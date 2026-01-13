CREATE TABLE IF NOT EXISTS contact (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON contact(email);

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP,
    status VARCHAR(20), -- CONFIRMED, CANCELLED, WAITLIST
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    period VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    event_begin_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP NOT NULL,
    event_registration_end_time TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_event_begin_time ON events(event_begin_time);
CREATE INDEX IF NOT EXISTS idx_events_event_end_time ON events(event_end_time);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
CREATE INDEX IF NOT EXISTS idx_events_period ON events(period);