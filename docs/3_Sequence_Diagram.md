# Sơ đồ Luồng Tuần tự (Sequence Diagram)

Mô tả luồng tương tác giữa User, Frontend (React), Backend Core (Spring) và AI Service (FastAPI) từ khi gửi tin nhắn cho đến khi nhận được tư vấn.

```mermaid
sequenceDiagram
    autonumber
    
    %% Định nghĩa các Actor và Component
    actor U as Người dùng (Khách du lịch)
    participant Web as ReactJS (Frontend)
    participant APIGW as Spring Boot (API Gateway)
    participant Auth as Spring Security (Filter)
    participant DB as PostgreSQL (System DB)
    participant AI as Python FastAPI (AI Server)
    participant Model as NLP/NER/Cosine Model

    %% Hành động gửi tin nhắn
    U->>Web: Nhập tin nhắn: "Mình muốn tìm quán Phở ngon ở Quận 1, Tp.HCM"
    Web->>APIGW: POST /api/chat/send {userId, sessionId, message}
    
    %% Backend xác nhận và lưu trữ
    activate APIGW
    APIGW->>Auth: Xác thực Token JWT
    Auth-->>APIGW: Hợp lệ (Valid User)
    APIGW->>DB: Lưu tin nhắn của User (Session History)
    
    %% Backend chuyển tiếp sang AI
    APIGW->>AI: POST /api/v1/predict/intent {text: "Mình muốn tìm..."}
    
    %% Quy trình AI xử lý
    activate AI
    AI->>Model: 1. Tiền xử lý & Trích xuất Intent, Thực thể (NER)
    activate Model
    Model-->>AI: {Intent: "Tim_Quan_An", Entities: {Food: "Phở", Location: "Quận 1, HCM"}}
    
    AI->>Model: 2. Query Knowledge Base (Tính Cosine Similarity góc độ tương đồng)
    Model-->>AI: Top 3 Quán Phở có Rating cao nhất Quận 1
    deactivate Model
    
    AI-->>APIGW: Trả về JSON Results (Danh sách Quán ăn + Suggestion Text)
    deactivate AI
    
    %% Backend cập nhật DB và trả về Frontend
    APIGW->>DB: Cập nhật Response AI vào Chat Log DB
    APIGW-->>Web: Response HTTP (Data JSON)
    deactivate APIGW
    
    %% Render UI
    Web-->>U: Hiển thị phản hồi lên màn hình (Text + Card hình ảnh quán ăn)
```

## Chú thích luồng đi (Data Flow)
Sơ đồ giúp mô tả tính bất đồng bộ (Asynchronous) trong thiết kế hệ thống Microservices. Thay vì xử lý AI nặng nề trên Java/Spring (rất tốn kém), hệ thống Spring Boot đóng vai trò là Orchestrator chuyển giao (delegate) phần NLU/Cosine Similarity cực nặng sang cho Python (FastAPI).

Sơ đồ thể hiện rõ quá trình bóc tách thực thể (NER: `Phở` và `Quận 1`), sau đó gọi mô hình Vector Database để chạy hàm tính khoảng cách gần nhất (Cosine Similarity), cho ra top 3 kết quả trả về.
