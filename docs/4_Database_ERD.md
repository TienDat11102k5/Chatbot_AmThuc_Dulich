# Sơ đồ Cơ sở Dữ liệu (Database ERD - PostgreSQL)

Sơ đồ biểu diễn mô hình thực thể quan hệ (Entity Relationship Diagram - ERD) trong lõi CSDL PostgreSQL của hệ thống. Đây là nơi Spring Boot (JPA/Hibernate) kết nối để thêm sửa xoá dữ liệu.

```mermaid
erDiagram
    %% Định nghĩa bảng Người dùng
    USERS ||--o{ CHAT_SESSIONS : "Sở hữu"
    USERS ||--o{ USER_FAVORITES : "Lưu trữ"
    USERS {
        uuid id PK "Khóa chính"
        string username "Tên đăng nhập"
        string password_hash "Mật khẩu mã hóa"
        string email "Email liên hệ"
        string role "ADMIN / USER"
        jsonb preferences "Sở thích/Dị ứng cá nhân"
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

    %% Định nghĩa bảng Danh sách yêu thích
    PLACES ||--o{ USER_FAVORITES : "Được lưu bởi"
    USER_FAVORITES {
        uuid id PK
        uuid user_id FK "Liên kết Người dùng"
        int place_id FK "Liên kết Địa điểm"
        datetime saved_at "Thời gian lưu"
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
        boolean is_active "Trạng thái hoạt động (Soft delete)"
    }
```

## Chú giải thiết kế Database (RDBMS + JSONB)
1. **Liên kết Chặt chẽ (RDBMS)**: Hệ thống sử dụng khóa chính (Primary Key) là `UUID` cho các bảng liên quan đến user/chat để tăng cường bảo mật.
2. **Trường dữ liệu JSONB (PostgreSQL)**: 
   - Cột `metadata` (Bảng `MESSAGES`) hỗ trợ lưu linh hoạt danh sách các ID địa điểm gợi ý.
   - Cột `preferences` (Bảng `USERS`) hỗ trợ lưu vô số lượng tùy biến về sở thích khách hàng (VD: dị ứng hải sản, thích ăn mặn...) để AI lọc kết quả mà không cần sửa cấu trúc cột tĩnh truyền thống.
3. **Danh sách yêu thích (`USER_FAVORITES`)**: Giải quyết tính năng cực kỳ thiết thực cho dự án - cho phép người dùng lưu lại danh sách các quán ăn mong muốn từ các lượt gợi ý của AI.
4. **Soft Delete (`is_active` - `PLACES`)**: Giữ lịch sử Chat không bị Null Reference khi một địa điểm kinh doanh đóng cửa và bị gỡ khỏi ứng dụng. Bảng `PLACES` cũng đảm nhận lưu `vector_id` để map lên VectorDB bên Python.
