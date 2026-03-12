# 🍲✈️ AI Chatbot Du Lịch & Ẩm Thực Việt Nam

Dự án Xây dựng hệ thống Trợ lý ảo (AI Chatbot) thông minh chuyên hỗ trợ gợi ý, tìm kiếm và lên kế hoạch cho các địa điểm du lịch và quán ăn tại Việt Nam. 

Hệ thống được thiết kế theo kiến trúc **Microservices** hiện đại, tách biệt hoàn toàn giữa giao diện người dùng (Frontend), lõi xử lý nghiệp vụ (Backend), và tác vụ tính toán Trí tuệ Nhân tạo (AI Service).

---

## 🚀 1. Giới thiệu chức năng chính
- **Giao tiếp tự nhiên:** Người dùng có thể chat với bot bằng ngôn ngữ tự nhiên (tiếng Việt).
- **Phân tích siêu dữ liệu:** AI nhận diện yêu cầu, bóc tách các thực thể như Tên món ăn, Địa điểm, Mức giá,... từ câu nói của người dùng.
- **Cá nhân hóa:** Lọc quán ăn/địa điểm theo sở thích cá nhân, chế độ ăn kiêng (ăn chay, dị ứng hải sản...).
- **Gợi ý thông minh (Recommender System):** Đề xuất các địa điểm phù hợp nhất dựa trên độ tương đồng Vector (Semantic Search).
- **Lưu trữ yêu thích:** Cho phép người dùng lưu lại các danh sách quán ăn/địa điểm ưa thích để xem lại sau.

---

## 🧠 2. Nguyên lý hoạt động (Flow cơ bản)
Quy trình xử lý một tin nhắn từ người dùng diễn ra như sau:
1. **Người dùng (Client):** Nhập tin nhắn (VD: *"Tìm cho mình quán phở ở Cầu Giấy dưới 50k, không ăn hành"*).
2. **Frontend (ReactJS):** Gắn kèm Token định danh gửi Request (REST API) về cho Backend.
3. **Backend Core (Spring Boot):** Nhận tin nhắn, kiểm tra quyền truy cập, lấy thêm thông tin **Preferences (Sở thích/Dị ứng)** của User từ Database. Kế tiếp, gói tất cả lại gửi sang Server AI.
4. **AI Service (FastAPI / Python):** 
   - Dùng **NLP Mô hình** để phân loại ý định (Người dùng đang tìm đồ ăn).
   - Dùng **NER Mô hình** để trích xuất từ khóa: `Món: Phở`, `Vị trí: Cầu Giấy`, `Giá: <50k`, `Dị ứng: Hành`.
   - Kết hợp với truy vấn Vector Similarity để tìm ra Top 5 quán ăn thỏa mãn nhất các điều kiện trên.
   - AI service trả dữ liệu (danh sách ID địa điểm, kèm nội dung sinh ra) về lại cho Backend.
5. **Backend Core (Spring Boot):** Lưu lại lịch sử đoạn hội thoại vào Database (PostgreSQL) để làm Context cho câu hỏi sau, rồi trả Response (List quán ăn) về cho Frontend hiển thị.
6. **Frontend (ReactJS):** Render kết quả bot trả về thành các dạng Card đẹp mắt để người dùng thao tác, thêm vào danh mục yêu thích (`USER_FAVORITES`).

---

## 💻 3. Công nghệ sử dụng (Technology Stack)

Hệ thống được thiết chia làm 3 cụm Service chính giao tiếp với nhau:

### 🎨 Frontend (Giao diện người dùng)
- **Framework:** ReactJS (SPA)
- **Styling:** TailwindCSS
- **Network:** Axios (Gọi HTTP API)
- **State Management:** Redux / Zustand (Quản lý trạng thái hộp thoại chat)

### ⚙️ Backend Core (Xử lý nghiệp vụ & Database)
- **Framework:** Java / Spring Boot 3
- **Bảo mật:** Spring Security + JWT (JSON Web Token)
- **ORM:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL (Lưu trữ User, Chat Logs, Địa điểm, Danh sách yêu thích). Sử dụng kiểu dữ liệu `JSONB` cho các trường động.

### 🤖 AI Service (Xử lý Ngôn ngữ & Gợi ý)
- **Framework:** Python / FastAPI (Nhanh, hỗ trợ ASGI/Async)
- **Machine Learning / NLP:** HuggingFace / Underthesea / Spacy (Xử lý tiếng Việt).
- **Vector Search / Recommender:** Cosine Similarity, PyTorch, hoặc sử dụng tích hợp `pgvector` bên trong PostgreSQL.

---

## 📂 4. Tài liệu tham khảo của dự án (Docs)
Các bản vẽ thiết kế và kiến trúc được lưu trữ trong thư mục `docs/`:
- `1_System_Architecture.md`: Sơ đồ kiến trúc tổng thể toàn hệ thống.
- `2_AI_Processing_Flow.md`: Sơ đồ luồng xử lý luồng sự kiện (Sequence Flow) của AI.
- `4_Database_ERD.md`: Sơ đồ thiết kế Thực thể Liên kết (Database Diagram) cho Postgres.
- `5_Team_Roles.md`: Bảng mô tả cách chia task và phân luồng làm việc cho team 5 người.

---
*Dự án được xây dựng dành cho đồ án môn học / tốt nghiệp với cấu trúc module hóa có thể mở rộng cao (Scalability).*