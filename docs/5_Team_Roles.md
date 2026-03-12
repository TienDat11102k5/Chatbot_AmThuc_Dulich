# Phân chia công việc cho nhóm 5 thành viên

Dựa trên bảng phân rã công việc chi tiết (WBS), dưới đây là vai trò và nhiệm vụ cụ thể của 5 thành viên trong nhóm dự án Chatbot AI Ẩm Thực & Du Lịch. Sự thống nhất này đảm bảo mỗi thành viên có một mảng chuyên môn rõ ràng và gắn kết với tiến độ dự án.

## Thành viên 1 / Dev 1: AI Engineer (Mô hình & Hệ thống AI)
*Vai trò:* Xây dựng dịch vụ AI độc lập với FastAPI và huấn luyện mô hình phân loại ý định.
- **Setup & API:** Khởi tạo base project FastAPI, cấu hình `requirements.txt` và viết các REST endpoints (VD: API Predict).
- **Phân loại ý định (Intent):** Sử dụng dữ liệu huấn luyện, xây dựng mô hình Phân loại ý định (SVM, Naive Bayes, hoặc Transformer) để nhận biết người dùng muốn gì (hỏi đường, tìm món ăn, tìm nhà hàng...).
- **Tích hợp & Tối ưu:** Ráp mô hình vào API, đo lường độ chính xác (Accuracy, F1-Score) và train lại mô hình khi tỷ lệ sai sót cao.

## Thành viên 2 / Dev 2: Kỹ sư Dữ liệu (Data Engineer & NER)
*Vai trò:* Chuẩn bị dữ liệu thô và bóc tách từ khóa (Thực thể - NER).
- **Thu thập dữ liệu:** Xây dựng tập dữ liệu ý định (`intent_dataset.csv`) làm nguyên liệu học cho Dev 1.
- **Nhận diện thực thể (NER):** Viết logic hàm `extract_entities(text)` để trích xuất các thông tin quan trọng từ câu nói (VD: lấy ra "Phở", "Cầu Giấy", "50k" từ câu chat).
- **Tối ưu AI:** Phối hợp cùng Dev 1 tinh chỉnh bộ nhận diện thực thể, đảm bảo bắt đúng từ khóa tiếng Việt.

## Thành viên 3 / Dev 3: Kỹ sư Thuật toán (Thuật toán Gợi ý)
*Vai trò:* Viết hệ thống Gợi ý (Recommender System).
- **Xây dựng Knowledge Base:** Tạo lập CSDL tri thức cốt lõi (`knowledge_base.csv`) với danh sách các món ăn, địa điểm, thuộc tính giá cả, vị trí để test thuật toán.
- **Thuật toán Cosine Similarity:** Code logic tính toán độ tương đồng (TF-IDF + Cosine) giữa yêu cầu của User và Knowledge Base.
- **Tích hợp Recommender:** Triển khai endpoint trả về Top N kết quả (Top 3/5 quán ăn phù hợp) và cung cấp các metric đánh giá chất lượng gợi ý.

## Thành viên 4 / Dev 4: Backend Lead (Spring Boot & PostgreSQL)
*Vai trò:* Xây dựng Backend trung tâm điều phối dữ liệu, bảo mật và lưu trữ.
- **Hệ thống Core:** Khởi tạo Spring Boot base, thiết kế các Entity (JPA) gồm: User, ChatSession, Message, Place.
- **API & Điều phối:** Viết REST API (Login, Lưu tin nhắn). Làm API Gateway để nhận request từ ReactJS, gọi API của FastAPI (WebClient), sau đó gộp kết quả trả về Frontend.
- **Cấu hình & Tài liệu:** Xử lý CORS, thiết lập Database PostgreSQL, và đảm nhận việc vẽ các bản đồ Kiến trúc (UML, Sequence, ERD, Architecture).

## Thành viên 5 / Dev 5: Frontend Lead (React Web Client & UI/UX)
*Vai trò:* Chịu trách nhiệm toàn bộ về giao diện và trải nghiệm người dùng.
- **Khởi tạo Frontend:** Setup Vite + ReactJS, cài đặt TailwindCSS, cấu trúc thư mục UI.
- **Giao diện Chat:** Viết layout màn hình hội thoại (ChatContainer, MessageBubble, InputBar) đem lại trải nghiệm mượt mà giống các AI hiện đại.
- **Tích hợp API & UX:** Dùng Axios fetch data từ Backend, tự động scroll khi có tin nhắn mới, render Dynamic Card hiển thị thông tin món ăn/địa điểm kèm hình ảnh.
- **Truyền thông:** Đảm nhận việc quay Video demo dự án và đóng gói file README hướng dẫn.

---

## 🛠 Cách các thành viên phối hợp với nhau (Flow công việc ngắn gọn)
1. **Dev 2 & Dev 3** lo mảng dữ liệu (CSV) đưa cho **Dev 1** huấn luyện mô hình và viết code chạy AI.
2. **Dev 4** nhận API Specification / Swagger từ **Dev 1** để nối API AI vào Spring Boot, đồng thời chuẩn bị API Backend để **Dev 5** code UI.
3. Trong lúc các thành viên lo Core Logic, **Dev 5** có thể dùng Mock Data để code xong Giao diện hiển thị trước. Cuối cùng **Dev 4** tích hợp nối liền quy trình.
