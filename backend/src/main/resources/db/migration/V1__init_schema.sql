-- =============================================================================
-- V1__init_schema.sql
-- Mô tả: Khởi tạo toàn bộ bảng cốt lõi cho hệ thống Chatbot Ẩm Thực & Du Lịch.
-- Bao gồm: users, categories, places, chat_sessions, messages,
--           user_favorites, otp_tokens
-- Flyway version: 1 (phiên bản đầu tiên)
-- =============================================================================

-- =============================================================================
-- 1. BẢNG USERS (Người dùng)
-- Mục đích: Lưu trữ thông tin tài khoản người dùng.
-- Đặc biệt: Cột "preferences" kiểu JSONB để lưu sở thích cá nhân
--            (VD: {"cuisine":["phở","bún chả"], "budget":"trung bình"})
--            AI Service sẽ đọc trường này để cá nhân hóa gợi ý.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID tự sinh dạng UUID v4
    username        VARCHAR(255) NOT NULL UNIQUE,                -- Tên đăng nhập (duy nhất)
    password_hash   VARCHAR(255) NOT NULL,                       -- Mật khẩu đã mã hóa Bcrypt/Argon2
    email           VARCHAR(255) NOT NULL UNIQUE,                -- Email (duy nhất, dùng cho OTP)
    role            VARCHAR(50)  NOT NULL DEFAULT 'USER',        -- Vai trò: USER hoặc ADMIN
    preferences     JSONB,                                       -- Sở thích cá nhân dạng JSON
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()          -- Thời điểm tạo tài khoản
);

-- =============================================================================
-- 2. BẢNG CATEGORIES (Danh mục)
-- Mục đích: Bảng tra cứu (lookup table) phân loại các loại địa điểm.
-- Ví dụ: Ẩm thực, Du lịch, Lưu trú, Giải trí...
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,                 -- ID tự tăng (1, 2, 3...)
    name VARCHAR(255) NOT NULL,              -- Tên danh mục hiển thị (VD: "Ẩm thực")
    code VARCHAR(100) NOT NULL UNIQUE        -- Mã danh mục viết liền (VD: "am_thuc")
);

-- =============================================================================
-- 3. BẢNG PLACES (Địa điểm)
-- Mục đích: Dữ liệu cốt lõi — lưu thông tin nhà hàng, địa điểm du lịch, khách sạn...
-- Đặc biệt: Cột "vector_id" liên kết với vector embedding trong Phase 2 (pgvector).
-- =============================================================================
CREATE TABLE IF NOT EXISTS places (
    id            SERIAL PRIMARY KEY,                               -- ID tự tăng
    category_id   INTEGER      NOT NULL REFERENCES categories(id),  -- FK tới bảng categories
    name          VARCHAR(255) NOT NULL,                             -- Tên địa điểm (VD: "Phở Thìn Bờ Hồ")
    description   TEXT,                                              -- Mô tả chi tiết
    location      VARCHAR(500),                                      -- Địa chỉ / vị trí
    rating        REAL,                                              -- Đánh giá (1.0 - 5.0)
    price_range   VARCHAR(50),                                       -- Khoảng giá (VD: "50k-100k")
    vector_id     VARCHAR(255),                                      -- ID vector embedding (sẽ đổi sang cột embedding ở V2)
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE                 -- Trạng thái: true = đang hoạt động
);

-- =============================================================================
-- 4. BẢNG CHAT_SESSIONS (Phiên trò chuyện)
-- Mục đích: Lưu metadata của từng cuộc hội thoại giữa User và Bot.
-- Mỗi phiên chat có tiêu đề riêng, tương tự giao diện ChatGPT với
-- thanh sidebar hiển thị danh sách các cuộc trò chuyện.
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID phiên dạng UUID
    user_id     UUID      NOT NULL REFERENCES users(id),     -- FK tới bảng users (ai tạo phiên)
    title       VARCHAR(255) NOT NULL,                       -- Tiêu đề phiên (tự sinh từ tin nhắn đầu)
    is_active   BOOLEAN   NOT NULL DEFAULT TRUE,             -- Trạng thái phiên: true = đang mở
    start_time  TIMESTAMP NOT NULL DEFAULT NOW()             -- Thời điểm bắt đầu phiên
);

-- =============================================================================
-- 5. BẢNG MESSAGES (Tin nhắn)
-- Mục đích: Lưu từng tin nhắn trong cuộc trò chuyện (cả USER lẫn BOT).
-- Đặc biệt: Cột "metadata" kiểu JSONB để lưu dữ liệu mở rộng
--            (VD: danh sách ID địa điểm Bot gợi ý, link ảnh, rating...).
-- =============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),                     -- ID tin nhắn dạng UUID
    session_id  UUID         NOT NULL REFERENCES chat_sessions(id),            -- FK tới phiên chat
    sender_type VARCHAR(10)  NOT NULL CHECK (sender_type IN ('USER', 'BOT')),  -- Ai gửi: USER hoặc BOT
    content     TEXT         NOT NULL,                                          -- Nội dung text của tin nhắn
    metadata    JSONB,                                                         -- Dữ liệu mở rộng dạng JSON
    timestamp   TIMESTAMP    NOT NULL DEFAULT NOW()                            -- Thời điểm gửi tin
);

-- =============================================================================
-- 6. BẢNG USER_FAVORITES (Địa điểm yêu thích)
-- Mục đích: Lưu danh sách các địa điểm mà người dùng đánh dấu "yêu thích".
-- Ràng buộc: Một cặp (user_id, place_id) chỉ được xuất hiện 1 lần
--            (tránh lưu trùng — xem index phía dưới).
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID bản ghi dạng UUID
    user_id  UUID    NOT NULL REFERENCES users(id),       -- FK tới người dùng
    place_id INTEGER NOT NULL REFERENCES places(id),      -- FK tới địa điểm
    saved_at TIMESTAMP NOT NULL DEFAULT NOW()             -- Thời điểm lưu yêu thích
);

-- =============================================================================
-- 7. BẢNG OTP_TOKENS (Mã xác thực OTP)
-- Mục đích: Lưu mã OTP dùng cho tính năng "Quên mật khẩu" (Password Reset).
-- Token có thời hạn (expiry_date), hết hạn sẽ bị từ chối.
-- =============================================================================
CREATE TABLE IF NOT EXISTS otp_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID token dạng UUID
    email       VARCHAR(255) NOT NULL,                       -- Email nhận OTP
    otp         VARCHAR(6)   NOT NULL,                       -- Mã OTP 6 chữ số
    expiry_date TIMESTAMP    NOT NULL,                       -- Thời hạn hiệu lực
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()          -- Thời điểm tạo OTP
);

-- =============================================================================
-- INDEXES — Tối ưu hiệu năng truy vấn
-- =============================================================================

-- Index GIN trên cột JSONB: cho phép tìm kiếm nhanh trong dữ liệu JSON
-- VD: WHERE preferences @> '{"cuisine": ["phở"]}'
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_messages_metadata  ON messages USING GIN (metadata);

-- Index trên Foreign Key: tăng tốc các câu lệnh JOIN giữa các bảng
-- (PostgreSQL KHÔNG tự tạo index cho FK — phải tạo thủ công)
CREATE INDEX IF NOT EXISTS idx_places_category_id       ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id     ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id       ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id    ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_place_id   ON user_favorites(place_id);

-- Unique Index kết hợp: ngăn người dùng lưu trùng một địa điểm vào yêu thích
-- Nếu (user_id, place_id) đã tồn tại → INSERT sẽ bị từ chối ở tầng Database
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique ON user_favorites(user_id, place_id);
