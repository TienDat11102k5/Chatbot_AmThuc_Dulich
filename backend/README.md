# ⚙️ Backend — API Gateway (Java Spring Boot 3)

> **Ngôn ngữ:** Java 21 | **Framework:** Spring Boot 3  
> **Database:** PostgreSQL | **Bảo mật:** JWT (RS256) + Spring Security  
> **Nhiệm vụ:** Quản lý người dùng, xác thực, lưu trữ lịch sử chat, và làm cầu nối giữa Frontend và AI Service.

---

## 🚀 Cách Chạy

```bash
# 1. Đảm bảo PostgreSQL đang chạy và đã tạo database

# 2. Cấu hình file .env (API keys, DB credentials)

# 3. Chạy ứng dụng
mvnw spring-boot:run
```

- **Server chạy tại:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html

---

## 🏗️ Chức Năng Đã Triển Khai

### 🔐 Xác thực & Phân quyền (Authentication & Authorization)
| Chức năng | API Endpoint | File chính |
|---|---|---|
| Đăng ký tài khoản | `POST /api/auth/register` | `AuthController.java` → `AuthService.java` |
| Đăng nhập (Email/Password) | `POST /api/auth/login` | `AuthController.java` → `JwtService.java` |
| Đăng nhập Google OAuth | `POST /api/auth/google` | `AuthController.java` → `AuthService.java` |
| Quên mật khẩu (Gửi OTP qua email) | `POST /api/auth/forgot-password` | `AuthService.java` → `EmailService.java` |
| Đặt lại mật khẩu | `POST /api/auth/reset-password` | `AuthService.java` → `OtpToken.java` |

**Công nghệ bảo mật:**
- JWT Token ký bằng thuật toán RS256 (`JwtService.java`)
- Filter xác thực mỗi request (`JwtAuthenticationFilter.java`)
- Spring Security cấu hình RBAC (`SecurityConfig.java`)
- Custom UserDetails (`CustomUserDetailsService.java`)

### 💬 Chatbot & Lịch Sử Trò Chuyện
| Chức năng | API Endpoint | File chính |
|---|---|---|
| Gửi tin nhắn tới AI | `POST /api/chat/send` | `ChatController.java` → `ChatService.java` |
| Lấy lịch sử chat | `GET /api/chat/sessions` | `ChatController.java` → `ChatSessionRepository.java` |
| Stream phản hồi AI (SSE) | Server-Sent Events | `ChatService.streamAiResponse()` |

**Luồng xử lý tin nhắn:**
```
Frontend (React) → ChatController → ChatService
    → Lưu tin nhắn User vào PostgreSQL (MessageRepository)
    → Gọi HTTP tới AI Service (FastAPI port 8000)
    → Nhận kết quả JSON từ AI
    → Stream phản hồi về Frontend qua SSE
    → Lưu tin nhắn AI vào PostgreSQL (@Async)
```

### 📍 Quản Lý Địa Điểm Du Lịch
| Chức năng | API Endpoint | File chính |
|---|---|---|
| Danh sách địa điểm | `GET /api/places` | `PlaceController.java` → `PlaceService.java` |
| Chi tiết địa điểm | `GET /api/places/{id}` | `PlaceController.java` → `PlaceRepository.java` |
| Yêu thích địa điểm | `POST /api/places/favorite` | `PlaceController.java` → `UserFavoriteRepository.java` |

### 👤 Quản Lý Người Dùng
| Chức năng | API Endpoint | File chính |
|---|---|---|
| Thông tin cá nhân | `GET /api/users/profile` | `UserController.java` → `UserService.java` |
| Cập nhật hồ sơ | `PUT /api/users/profile` | `UserController.java` → `UserService.java` |

---

## 📂 Cấu Trúc Thư Mục

```text
src/main/java/com/bot/
├── config/                       # ⚙️ CẤU HÌNH HỆ THỐNG
│   ├── AsyncConfig.java          #   Cấu hình xử lý bất đồng bộ (@Async)
│   ├── RedisConfig.java          #   Cấu hình Redis (nếu dùng caching)
│   └── SecurityConfig.java      #   Cấu hình Spring Security + CORS
│
├── security/                     # 🔐 BẢO MẬT
│   ├── JwtService.java           #   Tạo & xác minh JWT Token (RS256)
│   ├── JwtAuthenticationFilter.java  # Filter kiểm tra Token mỗi request
│   ├── CustomUserDetails.java    #   Map User Entity → Spring Security UserDetails
│   └── CustomUserDetailsService.java # Load user từ DB cho Spring Security
│
├── entity/                       # 📊 CÁC BẢNG DATABASE (JPA Entity)
│   ├── User.java                 #   Tài khoản người dùng
│   ├── ChatSession.java          #   Phiên trò chuyện
│   ├── Message.java              #   Tin nhắn trong phiên chat
│   ├── Place.java                #   Địa điểm du lịch
│   ├── Category.java             #   Danh mục phân loại
│   ├── UserFavorite.java         #   Địa điểm yêu thích của user
│   └── OtpToken.java            #   Token OTP quên mật khẩu
│
├── repository/                   # 💾 TRUY VẤN DATABASE (Spring Data JPA)
│   ├── UserRepository.java
│   ├── ChatSessionRepository.java
│   ├── MessageRepository.java
│   ├── PlaceRepository.java
│   ├── CategoryRepository.java
│   ├── UserFavoriteRepository.java
│   └── OtpTokenRepository.java
│
├── service/                      # 🧠 LOGIC NGHIỆP VỤ
│   ├── auth/AuthService.java     #   Đăng ký, đăng nhập, quên mật khẩu
│   ├── chat/ChatService.java     #   Gửi/nhận tin nhắn, gọi AI Service, SSE streaming
│   ├── email/EmailService.java   #   Gửi email OTP
│   ├── place/PlaceService.java   #   CRUD địa điểm du lịch
│   └── user/UserService.java    #   Quản lý hồ sơ người dùng
│
├── controller/                   # 🌐 REST API ENDPOINTS
│   ├── auth/AuthController.java  #   API xác thực (/api/auth/*)
│   ├── chat/ChatController.java  #   API chat (/api/chat/*)
│   ├── place/PlaceController.java #  API địa điểm (/api/places/*)
│   └── user/UserController.java  #   API người dùng (/api/users/*)
│
└── exception/
    └── GlobalExceptionHandler.java  # Xử lý lỗi tập trung (RFC 7807)
```

---

## 🔗 Giao Tiếp Với AI Service

Backend giao tiếp với AI Service (Python FastAPI) qua HTTP nội bộ:

| Hướng | Chi tiết |
|---|---|
| **Backend → AI** | `POST http://localhost:8000/api/v1/ai/chat` (gửi JSON `{"message": "..."}`) |
| **AI → Backend** | Trả JSON `{"intent": "...", "recommendations": [...], "entities": {...}}` |
| **Backend → Frontend** | Stream qua **SSE (Server-Sent Events)** để phản hồi real-time |

---

## 📦 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 3.x |
| Ngôn ngữ | Java 21 |
| Database | PostgreSQL |
| ORM | Spring Data JPA (Hibernate) |
| Bảo mật | Spring Security + JWT (RS256) |
| Async | @Async + ThreadPoolTaskExecutor |
| Email | Spring Mail (SMTP) |
| API Docs | Swagger / OpenAPI |
| Build Tool | Maven |
