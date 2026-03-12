# Sơ đồ Cơ sở Dữ liệu (Database ERD - PostgreSQL)

Sơ đồ biểu diễn mô hình thực thể quan hệ (Entity Relationship Diagram - ERD) trong lõi CSDL PostgreSQL của hệ thống. Đây là nơi Spring Boot (JPA/Hibernate) kết nối để thêm sửa xoá dữ liệu.

```mermaid
erDiagram
    %% Định nghĩa bảng Người dùng
    USERS ||--o{ CHAT_SESSIONS : "Sở hữu"
    USERS {
        uuid id PK "Khóa chính"
        string username "Tên đăng nhập"
        string password_hash "Mật khẩu mã hóa"
        string email "Email liên hệ"
        string role "ADMIN / USER"
        datetime created_at
    }

    %% Định nghĩa phiên chat (Chat Sessions)
    CHAT_SESSIONS ||--o{ MESSAGES : "Lưu trữ"
    CHAT_SESSIONS {
        uuid id PK
        uuid user_id FK "Liên kết Users"
        string title "Tên phiên (Sinh từ tin nhắn đầu)"
        boolean is_active "Đang hoạt động"
        datetime start_time
    }

    %% Định nghĩa tin nhắn chi tiết
    MESSAGES {
        uuid id PK
        uuid session_id FK
        string sender_type "ENUM: USER, BOT"
        text content "Nội dung tin nhắn gốc"
        jsonb metadata "Dữ liệu mở rộng (Ví dụ list ID Món ăn gợi ý)"
        datetime timestamp
    }

    %% Dữ liệu Cốt lõi về Ẩm thực và Du lịch
    CATEGORIES ||--o{ PLACES : "Phân loại"
    CATEGORIES {
        int id PK
        string name "Tour, Khách sạn, Nhà hàng, Quán ăn"
        string code "Mã định danh"
    }

    PLACES {
        int id PK
        int category_id FK
        string name "Tên địa điểm/Món ăn"
        text description "Mô tả / Đánh giá"
        string location "Tọa độ GPS / Địa chỉ"
        float rating "Đánh giá trung bình (1-5)"
        string price_range "Mức giá ($ - $$$$)"
        string vector_id "Liên kết Vector/Embbd (Bên AI)"
    }
```

## Chú giải thiết kế Database (RDBMS + JSONB)
1. **Liên kết Chặt chẽ (RDBMS)**: Hệ thống sử dụng khóa chính (Primary Key) là `UUID` cho các bảng liên quan đến user/chat để tăng cường bảo mật và tránh lỗi khi đồng bộ phân tán (Distributed ID).
2. **Trường dữ liệu JSONB (PostgreSQL)**: Bảng `MESSAGES` sử dụng tính năng cực mạnh của Postgres là kiểu `JSONB` cho cột `metadata`. Mặc dù dùng CSDL Quan hệ nhưng chúng ta vẫn có thể linh hoạt lưu danh sách ID địa điểm tư vấn của con Bot (ví dụ: `[{"placeId":1,"name":"Phở"}]`) trực tiếp trong này mà không cần tạo thêm bảng Many-to-Many làm dư thừa thiết kế.
3. **Places Data**: Bảng `PLACES` sẽ lưu trữ mô tả của mọi quán ăn và địa danh. Cột `vector_id` sẽ map với Model Vector lưu trên server Python (FastAPI).
