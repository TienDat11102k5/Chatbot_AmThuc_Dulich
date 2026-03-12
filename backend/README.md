# ⚙️ Backend Core (Java Spring Boot 3)

Hệ thống Backend này đóng vai trò Cầu Nối (API Gateway) giữa giao diện người dùng (Frontend) và Khối xử lý AI. Nhiệm vụ chính là đảm bảo an ninh hệ thống, quản lý tài khoản người dùng, và lưu vết lại toàn bộ lịch sử tư vấn.

## 📂 Kiến Trúc Thư Mục Clean Architecture

Nền tảng: **Java 21 + Spring Boot 3 + PostgreSQL**

```text
src/main/java/com/bot/
├── config/              # File config cho hệ thống: `SecurityConfig.java`, `CorsConfig.java`, `SwaggerConfig.java`
├── exception/           # Chứa custom Exceptions: `ResourceNotFoundException.java`, `GlobalExceptionHandler.java` (RFC 7807)
├── security/            # Giải pháp phân quyền: `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`, `CustomUserDetailsService.java`
├── entity/              # Class mapping trực tiếp với bảng trong SQL: `User.java`, `ChatHistory.java` (Dùng JPA @Entity)
├── dto/                 # Objects trung gian Response/Request: `ChatRequestDTO.java`, `LoginResponseDTO.java`
├── repository/          # Tương tác Database: `UserRepository.java`, `ChatRepository.java` (Kế thừa JpaRepository)
├── service/             # Chứa logic hệ thống (Interface và Implementation): `ChatService.java`, `AuthService.java`
├── controller/          # Các REST API để gọi từ ngoài vào: `ChatController.java`, `AuthController.java` (Dùng @RestController)
└── util/                # Các file tiện ích tái sử dụng: `SecurityUtils.java`, `DateFormatter.java`

src/main/resources/
├── application.yml      # Cấu hình chuỗi kết nối Database, Port, biến môi trường (dev, prod)
└── db/migration/        # Nơi chứa kịch bản tạo/sửa bảng tự động (vd: `V1__init_schema.sql` dùng cho Flyway/Liquibase)
```

## 📝 Luồng đi của Dữ liệu (Request Flow)
1. Giao diện (React) gửi câu hỏi nhắn lên `controller/ChatController.java`.
2. Dữ liệu request được bọc gọn trong lớp `dto/ChatRequest`.
3. Tầng `controller` sẽ gọi tầng logic `service/ChatService.java`.
4. Tại `service`, nó sẽ kiểm tra xem User có quyền chát không, lưu lại đoạn chat vào DB thông qua `repository`.
5. Sau đó, `service` gọi http sang bên nhánh AI (Python) để xin câu trả lời.
6. Khi nhận được kết quả từ AI, trả lại DTO cho `controller` để xuất dạng JSON trả về cho React.

> Ghi chú: File DTO là bắt buộc để tránh tình trạng lộ thông tin Entity (như thông tin mật khẩu của bảng User) ra ngoài REST API.
