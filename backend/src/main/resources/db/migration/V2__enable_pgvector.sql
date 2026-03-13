-- =============================================================================
-- V2__enable_pgvector.sql
-- Mô tả: Kích hoạt extension pgvector và thêm cột vector embedding vào bảng places.
--         Hỗ trợ AI tìm kiếm ngữ nghĩa (Semantic Search) bằng Cosine Similarity.
-- Flyway version: 2
-- Yêu cầu: Docker image phải là pgvector/pgvector:pg15 (đã cấu hình trong docker-compose.yml)
-- =============================================================================

-- Bước 1: Kích hoạt extension pgvector
-- (Cần quyền superuser — Docker image pgvector/pgvector đã tích hợp sẵn)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- Bước 2: Thêm cột "embedding" vào bảng places
-- Kiểu dữ liệu: vector(768) — vector 768 chiều
-- Lý do chọn 768 chiều:
--   - Phù hợp với mô hình embedding phổ biến (all-MiniLM-L6-v2, text-embedding-ada-002)
--   - Đây là kích thước tối ưu giữa độ chính xác và hiệu năng
-- Cách hoạt động:
--   1. AI Service (FastAPI/Python) nhận mô tả địa điểm → chuyển thành vector 768 chiều
--   2. Vector được lưu vào cột này
--   3. Khi user hỏi "quán phở ngon gần đây", câu hỏi cũng được chuyển thành vector
--   4. PostgreSQL so sánh 2 vector bằng Cosine Similarity → trả về kết quả gần nhất
-- =============================================================================
ALTER TABLE places ADD COLUMN IF NOT EXISTS embedding vector(768);

-- =============================================================================
-- Bước 3: Tạo HNSW Index cho tìm kiếm vector cực nhanh
-- Thuật toán: HNSW (Hierarchical Navigable Small World)
--   - Tốc độ: tìm kiếm gần đúng (approximate) nhưng cực nhanh (~5ms cho 100K vectors)
--   - Độ chính xác: ~95-99% so với brute-force scan
-- Khoảng cách: Cosine Distance (vector_cosine_ops)
--   - Đo mức độ tương đồng về hướng giữa 2 vector (0 = giống nhau hoàn toàn, 1 = khác biệt hoàn toàn)
-- Ví dụ query sử dụng index này:
--   SELECT * FROM places ORDER BY embedding <=> '[0.1, 0.2, ...]' LIMIT 5;
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_places_embedding
    ON places USING hnsw (embedding vector_cosine_ops);
