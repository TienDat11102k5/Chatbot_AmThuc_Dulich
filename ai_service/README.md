# 🧠 AI Service — Bộ Não AI Chatbot Ẩm Thực & Du Lịch Việt Nam

> **Đồ án Môn học:** Trí Tuệ Nhân Tạo  
> **Ngôn ngữ:** Python 3.11 | **Framework:** FastAPI  
> **Nhiệm vụ:** Xử lý ngôn ngữ tự nhiên tiếng Việt, phân loại ý định người dùng và gợi ý món ăn/địa điểm du lịch.

---

## 🚀 Cách Chạy Server

```bash
# 1. Cài đặt thư viện (chỉ cần chạy 1 lần)
py -3.11 -m pip install -r requirements.txt

# 2. Huấn luyện Model AI (chỉ cần chạy 1 lần hoặc khi thay đổi dataset)
set PYTHONPATH=. && py -3.11 -m src.core.intent_classifier

# 3. Khởi động Server
set PYTHONPATH=. && py -3.11 -m uvicorn src.main:app --reload --port 8000
```

- **Swagger UI (Tài liệu API tự động):** http://localhost:8000/docs
- **API Endpoint chính:** `POST http://localhost:8000/api/v1/ai/chat`
- **Health Check:** `GET http://localhost:8000/health`

---

## 🏗️ Kiến Trúc & Thuật Toán Cốt Lõi

| Thành phần | Thuật toán / Công nghệ | Thư viện |
|---|---|---|
| Cắt từ tiếng Việt | Word Segmentation (Nối từ ghép) | `underthesea==1.3.5` |
| Phân loại ý định (Intent) | **TF-IDF + SVM** (Support Vector Machine) | `scikit-learn==1.5.2` |
| Trích xuất thực thể (NER) | Regex + Longest Match First (63 tỉnh thành) | Built-in Python |
| Tìm kiếm gợi ý (Recommender) | **Cosine Similarity** trên Ma trận TF-IDF | `scikit-learn==1.5.2` |
| Bộ nhớ đệm (Cache) | Semantic Cache LRU (max 256 entries) | Built-in Python |
| API Framework | FastAPI + Uvicorn (ASGI, bất đồng bộ) | `fastapi==0.115.0` |

### Luồng Xử Lý Pipeline (Khi nhận 1 câu hỏi)

```
Nhận Request JSON → Kiểm tra Cache → Cắt từ tiếng Việt (Underthesea)
→ Phân loại Ý định (SVM) → Trích xuất Thực thể NER (food + location)
→ Tìm kiếm Cosine Similarity (Top 3) → Đóng gói JSON Response → Trả về
```

---

## 📂 Cấu Trúc Thư Mục

```text
ai_service/
├── requirements.txt              # Thư viện Python (FastAPI, scikit-learn, underthesea, pandas)
├── Dockerfile                    # Đóng gói Docker cho Production
│
├── data/                         # 📦 DỮ LIỆU THÔ
│   ├── intent_dataset.csv        #   Dataset train AI (180+ câu, 4 nhóm ý định)
│   └── knowledge_base.csv        #   Tri thức món ăn/địa điểm (30 record, 3 miền Bắc-Trung-Nam)
│
├── models/                       # 🧠 MODEL ĐÃ HUẤN LUYỆN
│   └── intent_model.pkl          #   File nhị phân Model SVM (Accuracy: 92.86%)
│
├── docs/                         # 📝 BÁO CÁO ĐỒ ÁN
│   └── metrics.txt               #   Bảng điểm chi tiết (Accuracy, Precision, Recall, F1-Score)
│
└── src/                          # 💻 MÃ NGUỒN CHÍNH
    ├── main.py                   #   Entry point FastAPI (Lifespan In-Memory + Cache + CORS)
    ├── validate_data.py          #   Script kiểm tra toàn vẹn dữ liệu CSV
    │
    ├── core/                     # 🔬 LÕI THUẬT TOÁN AI
    │   ├── nlp_utils.py          #   Tiền xử lý NLP: Cắt từ, Stop words, chuẩn hóa text
    │   ├── intent_classifier.py  #   Huấn luyện & Dự đoán ý định (TF-IDF + SVM Pipeline)
    │   ├── ner.py                #   Trích xuất thực thể: 63 tỉnh thành + 50+ món ăn
    │   └── recommender.py        #   Tìm kiếm ngữ nghĩa: Cosine Similarity trên TF-IDF
    │
    └── api/                      # 🌐 API GATEWAY
        ├── schemas.py            #   Pydantic Schema (ChatRequest, ChatResponse, RecommendationItem)
        └── router.py             #   Endpoint POST /api/v1/ai/chat (Pipeline 4 bước)
```

---

## 📊 Kết Quả Huấn Luyện Model

| Metric | Giá trị |
|---|---|
| **Accuracy** | **92.86%** |
| Model | SVM (SVC kernel='linear') |
| Vectorizer | TF-IDF (TfidfVectorizer) |
| NLP Tokenizer | Underthesea + Custom Stop Words |
| Tỉ lệ Train/Test | 80% / 20% |

### 4 Nhóm Ý Định (Intent) được AI nhận diện:

| Intent | Mô tả | Ví dụ câu hỏi |
|---|---|---|
| `tim_mon_an` | Tìm kiếm món ăn | "Phở Hà Nội ăn ở đâu ngon?" |
| `tim_dia_diem` | Tìm kiếm địa điểm du lịch | "Nên đi đâu ở Đà Lạt?" |
| `hoi_thoi_tiet` | Hỏi về thời tiết | "Hôm nay Sài Gòn có mưa không?" |
| `giao_tiep_bot` | Giao tiếp với chatbot | "Chào bạn, giúp mình với" |

---

## ⚡ Tối Ưu Hiệu Năng

1. **In-Memory Loading (Lifespan):** Model và Recommender được nạp vào RAM 1 lần khi server khởi động. Mọi request sau đó truy cập trực tiếp từ bộ nhớ → Giảm latency từ ~500ms xuống ~5ms.
2. **Semantic Cache (LRU):** Lưu kết quả của 256 câu hỏi gần nhất. Câu hỏi trùng lặp → Trả ngay từ cache, bỏ qua toàn bộ tính toán AI.
3. **Stop Words Removal:** Loại bỏ ~25 từ vô nghĩa tiếng Việt (là, thì, mà, ở...) giúp TF-IDF tập trung vào từ khóa quan trọng.
