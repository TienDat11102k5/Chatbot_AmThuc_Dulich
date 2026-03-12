# Sơ đồ Kiến trúc Hệ thống (System Architecture)

Sơ đồ mô tả bức tranh tổng thể của dự án Chatbot với kiến trúc Microservices, bao gồm 3 service chính: Frontend (ReactJS), Backend Core (Spring Boot), và AI Service (FastAPI).

```mermaid
flowchart TB
    %% Styling
    classDef client fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef frontend fill:#bae6fd,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef backend fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#422006
    classDef ai fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef db fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#3b0764

    %% Clients Layer
    subgraph Clients["📱 1. Client Layer"]
        direction LR
        UI_Web("Web App\n(Trình duyệt)"):::client
        UI_Mobile("Mobile App\n(Tương lai)"):::client
    end

    %% Frontend Layer
    subgraph Frontend["🖥️ 2. Frontend Service (ReactJS)"]
        direction TB
        ReactApp["React Application\n- Chat Interface\n- Axios Client\n- Tailwind UI"]:::frontend
    end

    %% Backend Layer
    subgraph Backend["⚙️ 3. Backend Core (Java / Spring Boot)"]
        direction TB
        APIGateway["API Gateway / Xử lý Request"]:::backend
        AuthLogic["Xác thực & Bảo mật\n(Spring Security / JWT)"]:::backend
        ChatLogic["Business Logic\n(Quản lý Session chat)"]:::backend
        DataLayer["Tầng truy cập dữ liệu\n(Spring Data JPA)"]:::backend

        APIGateway --> AuthLogic
        APIGateway --> ChatLogic
        ChatLogic --> DataLayer
    end

    %% AI Service Layer
    subgraph AIService["🧠 4. AI Service (Python / FastAPI)"]
        direction TB
        FastAPIServer["FastAPI Server\n(Endpoints)"]:::ai
        NLP["NLP Module\n(Phân loại ý định)"]:::ai
        NER["NER Module\n(Trích xuất thực thể)"]:::ai
        Recommender["Hệ gợi ý\n(Cosine Similarity)"]:::ai
        
        FastAPIServer --> NLP
        NLP --> NER
        NER --> Recommender
    end

    %% Database Layer
    subgraph Database["🗄️ 5. Database Layer"]
        direction LR
        PostgresDB[("PostgreSQL\n(USERS, USER_FAVORITES, \nCONVERSATIONS, MESSAGES)")]:::db
        PlacesDB[("Dữ liệu Du lịch/Ẩm thực\n(PLACES, CSV Vector)")]:::db
    end

    %% Connections
    Clients -->|HTTP / REST| Frontend
    UI_Web --> ReactApp
    UI_Mobile -.-> ReactApp
    
    ReactApp -->|HTTP JSON| APIGateway
    
    ChatLogic <-->|Giao tiếp 2 chiều| FastAPIServer
    
    DataLayer -->|Đọc và Ghi bằng JDBC| PostgresDB
    Recommender -->|Truy vấn Vector Similarity| PlacesDB
```

## Chú thích Kiến trúc:
1. **Frontend (ReactJS)**: Giao diện người dùng trực tiếp trải nghiệm Chatbot.
2. **Backend Core (Spring Boot)**: Không xử lý thuật toán AI mà đóng vai trò là xương sống (Backbone) của hệ thống: Quản lý user, lưu lại lịch sử tin nhắn vào PostgreSQL, điều phối các request chuyển hướng sang AI.
3. **AI Service (FastAPI)**: Chuyên trách tính toán AI. Nhận chuỗi văn bản thuần (Text) từ Backend, thực thi các thuật toán Machine Learning (NLP, NER) và Recommendation (Cosine Similarity), tính toán để trả ra danh sách ID địa điểm/món ăn.
4. **PostgreSQL**: DBMS chính để lưu trữ dữ liệu người dùng, đoạn chat và danh sách địa điểm (Places & Food).
