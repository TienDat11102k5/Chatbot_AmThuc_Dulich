-- =============================================================================
-- V7__create_chat_history_table.sql
-- Mục đích: Tạo bảng chat_history ánh xạ với ChatHistory.java Entity
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_history (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id BIGINT,
    message TEXT NOT NULL,
    response TEXT,
    intent VARCHAR(50),
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tạo Index để truy vấn nhanh the session
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
