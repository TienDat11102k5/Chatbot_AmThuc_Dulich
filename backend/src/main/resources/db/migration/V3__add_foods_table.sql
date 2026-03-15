-- =============================================================================
-- V3__add_foods_table.sql
-- Mô tả: Tạo bảng foods để lưu thông tin món ăn riêng biệt
-- Tách biệt foods và places để dễ quản lý
-- =============================================================================

-- Bảng FOODS (Món ăn)
CREATE TABLE IF NOT EXISTS foods (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    location      VARCHAR(500),
    address       VARCHAR(500),
    tags          TEXT,
    rating        REAL DEFAULT 0.0,
    price_range   VARCHAR(50),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_foods_location ON foods(location);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_is_active ON foods(is_active);

-- Thêm cột address vào bảng places nếu chưa có
ALTER TABLE places ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE places ADD COLUMN IF NOT EXISTS tags TEXT;
