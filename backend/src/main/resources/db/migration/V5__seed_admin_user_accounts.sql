-- =============================================================================
-- V5__seed_admin_user_accounts.sql
-- Mô tả: Seed 2 tài khoản mặc định (1 Admin + 1 User) để test hệ thống.
--         Dùng ON CONFLICT DO NOTHING để tránh lỗi nếu tài khoản đã tồn tại.
--         Password được hash bằng BCrypt (tương thích SecurityConfig.passwordEncoder()).
-- =============================================================================

-- Tài khoản Admin: admin@gmail.com / Admin@123
INSERT INTO users (id, username, password_hash, email, role, full_name, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    '$2b$10$x.TFN9PvXY/WX4Kjyq3xvOGvkch5G47gjJ4npnaN1ZvHYqr6Gh.gy',
    'admin@gmail.com',
    'ADMIN',
    'Admin SavoryTrip',
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Tài khoản User: user@gmail.com / User@123
INSERT INTO users (id, username, password_hash, email, role, full_name, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'testuser',
    '$2b$10$hTV4QWLcXfqLSvZqcft2c.2lixEVqBoBUVyRVCoixEK3ekzGj3jQC',
    'user@gmail.com',
    'USER',
    'User Test',
    NOW()
)
ON CONFLICT (username) DO NOTHING;
