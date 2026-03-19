-- =============================================================================
-- V6__add_user_status.sql
-- Mô tả: Thêm cột status vào bảng users để quản lý trạng thái tài khoản.
-- Giá trị: ACTIVE (mặc định), INACTIVE, BANNED
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
