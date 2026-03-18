-- V4: Add fullName and avatarUrl columns to users table for user profile feature
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
