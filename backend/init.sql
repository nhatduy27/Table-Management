-- docker/postgres/init/init.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 20),
    location VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    qr_token VARCHAR(500),
    qr_token_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_location ON tables(location);

/* Khởi tạo dữ liệu mẫu cho anh em */

INSERT INTO tables (table_number, capacity, location, description, status) 
VALUES 
    ('T01', 4, 'Indoor', 'Table near window', 'active'),
    ('T02', 2, 'Indoor', 'Couple table', 'active'),
    ('T03', 6, 'Outdoor', 'Garden view', 'active'),
    ('T04', 8, 'VIP', 'Private room', 'active'),
    ('T05', 4, 'Patio', 'Smoking area', 'inactive')
ON CONFLICT (table_number) DO NOTHING;