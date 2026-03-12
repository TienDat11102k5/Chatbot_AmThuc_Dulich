# BẢNG PHÂN RÃ CÔNG VIỆC CHI TIẾT (WBS) - 6 TUẦN

## Thành phần team

- **Dev 1 (AI):** FastAPI, Mô hình Intent
- **Dev 2 (Kỹ sư Dữ liệu):** Data, NER (Trích xuất thực thể)
- **Dev 3 (Kỹ sư Thuật toán):** Thuật toán Recommender (Cosine)
- **Dev 4 (Backend Lead):** Spring Boot, PostgreSQL, API Gateway
- **Dev 5 (Frontend Lead):** ReactJS, UI/UX

---

# GIAI ĐOẠN 1: KHỞI TẠO & CHUẨN BỊ DỮ LIỆU (Tuần 1)

| Mã Task | Người nhận | Tên công việc                 | Yêu cầu đầu ra                                                                 |
| ------- | ---------- | ----------------------------- | ------------------------------------------------------------------------------ |
| SYS-01  | Dev 1      | Setup Git Repo & FastAPI Base | Repo GitHub có .gitignore, FastAPI chạy uvicorn cổng 8000, có requirements.txt |
| SYS-02  | Dev 4      | Setup Spring Boot Base        | Project Java chạy cổng 8080, có dependency Web, JPA, PostgreSQL                |
| SYS-03  | Dev 5      | Setup ReactJS Base            | Tạo bằng Vite, cài TailwindCSS và Axios, chạy npm run dev                      |
| DAT-01  | Dev 2      | Tạo Dataset Ý định            | File intent_dataset.csv có ít nhất 150 câu                                     |
| DAT-02  | Dev 3      | Tạo Dataset Knowledge Base    | knowledge_base.csv gồm 50 món ăn + 50 địa điểm                                 |
| DB-01   | Dev 4      | Thiết kế Entity               | User, ChatSession, Message, Place                                              |

---

# GIAI ĐOẠN 2: XÂY DỰNG CORE LOGIC & TRAINING (Tuần 2 - Tuần 3)

| Mã Task | Người nhận | Tên công việc      | Yêu cầu đầu ra                                 |
| ------- | ---------- | ------------------ | ---------------------------------------------- |
| AI-01   | Dev 1      | Train Intent Model | Train SVM/Naive Bayes và xuất intent_model.pkl |
| AI-02   | Dev 2      | Code logic NER     | Hàm extract_entities(text)                     |
| AI-03   | Dev 3      | Code Recommender   | TF-IDF + cosine similarity                     |
| BE-01   | Dev 4      | REST API Core      | POST /api/v1/chat lưu message DB               |
| BE-02   | Dev 4      | Setup WebClient    | Service gọi FastAPI                            |
| FE-01   | Dev 5      | Layout Chat UI     | ChatContainer, MessageBubble, InputBar         |
| FE-02   | Dev 5      | Gọi API Axios      | Gửi POST xuống backend                         |

---

# GIAI ĐOẠN 3: TÍCH HỢP HỆ THỐNG (Tuần 4)

| Mã Task | Người nhận | Tên công việc          | Yêu cầu đầu ra                |
| ------- | ---------- | ---------------------- | ----------------------------- |
| API-01  | Dev 1      | Endpoint AI Predict    | FastAPI load model và NER     |
| API-02  | Dev 3      | Endpoint AI Recommend  | Trả top 3 kết quả             |
| BE-03   | Dev 4      | Backend - AI Flow      | Spring Boot gọi API AI        |
| SYS-04  | Dev 4      | Cấu hình CORS          | React gọi API không lỗi       |
| FE-03   | Dev 5      | Render Dynamic Content | Hiển thị card món ăn/địa điểm |

---

# GIAI ĐOẠN 4: FIX BUG & HOÀN THIỆN (Tuần 5 - Tuần 6)

| Mã Task | Người nhận | Tên công việc | Yêu cầu đầu ra                       |
| ------- | ---------- | ------------- | ------------------------------------ |
| BUG-01  | Dev 1,2    | Tối ưu AI     | Train lại khi sai >20%               |
| BUG-02  | Dev 4,5    | Tối ưu UX     | Scroll khi có tin nhắn               |
| DOC-01  | Dev 4      | UML           | Sequence, Architecture, ERD          |
| DOC-02  | Dev 1,3    | ML Metrics    | Accuracy, F1-score, Confusion Matrix |
| DOC-03  | Dev 5      | Video Demo    | Demo ~3 phút + README                |
