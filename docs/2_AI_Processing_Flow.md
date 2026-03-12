# Sơ đồ Luồng xử lý AI (AI Processing Flow)

Sơ đồ biểu diễn chi tiết các thuật toán Machine Learning được áp dụng trong **AI Service (FastAPI)**, bao gồm NLP Intent Classification, NER Extraction và Cosine Similarity Recommendation.

```mermaid
flowchart TD
    %% Styling
    classDef input fill:#e2e8f0,stroke:#64748b,stroke-width:2px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#052e16
    classDef model fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#422006
    classDef output fill:#bae6fd,stroke:#0284c7,stroke-width:2px,color:#0f172a

    Input["📝 Raw Message\n'Gợi ý cho tôi quán phở ngon ở Hà Nội'"]:::input
    
    %% Tiền xử lý NLP
    subgraph Preprocessing ["1. Tiền xử lý Văn bản (NLP)"]
        direction TB
        Tokenization["Tokenization\n(Tách từ: 'Gợi', 'ý', 'quán'...)"]:::process
        Stopwords["Remove Stopwords\n(Loại bỏ từ nhiễu)"]:::process
        Tokenization --> Stopwords
    end

    %% Phân tích Ý định & Thực thể
    subgraph NLU ["2. Phân tích Ngữ nghĩa (NLU)"]
        direction LR
        Intent["Xác định Ý định\n(Intent Classification Matrix)"]:::model
        NER["Trích xuất Thực thể\n(Named Entity Recognition)"]:::model
    end

    %% Gợi ý Món ăn / Du lịch
    subgraph Recommendation ["3. Thuật toán Gợi ý (Cosine Similarity)"]
        direction TB
        Vectorize["Chuyển đổi Vector\n(TF-IDF / Word Embeddings)"]:::process
        Calculate["Tính toán khoảng cách\n(Cosine Similarity)"]:::model
        Knowledge[("Kho dữ liệu\nẨm thực / Du lịch\n(Vector hóa)")]:::input
        
        Vectorize --> Calculate
        Knowledge -.->|So sánh| Calculate
    end

    Output["📤 JSON Response\n- Intent: Recommend_Food\n- Entities: [Food: 'Phở', Loc: 'Hà Nội']\n- Results: [Quán A, Quán B...]"]:::output

    %% Flow
    Input --> Preprocessing
    Preprocessing --> Intent
    Preprocessing --> NER
    
    Intent -->|Intent: Gợi ý Ẩm thực| Vectorize
    NER -->|Đặc trưng: 'Phở', 'Hà Nội'| Vectorize
    
    Calculate --> Output
```

## Các Thuật toán Cốt lõi:
1. **Phân loại ý định (Intent Classification)**: AI xác định xem người dùng đang hỏi về Du lịch (Tìm điểm đến), Ẩm thực (Tìm quán ăn), hay Hỏi đáp thông thường (Small talk).
2. **Trích xuất thực thể (NER - Named Entity Recognition)**: Bóp tách các từ khoá mang ý nghĩa thực thể trong câu như: Tên món ăn ("Phở", "Bún chả"), Tên địa danh ("Hà Nội", "Đà Lạt"), Mức giá ("Rẻ", "Sang trọng").
3. **Độ tương đồng Cosine (Cosine Similarity)**: Khi đã có Intent và Entity, hệ thống chuyển hóa chúng thành các vector ngữ nghĩa (TF-IDF hoặc Word2Vec) và tính góc Cosine với dữ liệu quán ăn/địa điểm có sẵn trong CSDL để lọc ra Top N địa danh phù hợp nhất.
