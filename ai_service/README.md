# 🧠 AI Service — Bộ Não AI Chatbot Ẩm Thực & Du Lịch Việt Nam

> **Đồ án Môn học:** Trí Tuệ Nhân Tạo  
> **Ngôn ngữ:** Python 3.11 | **Framework:** FastAPI  
> **Nhiệm vụ:** Xử lý ngôn ngữ tự nhiên tiếng Việt, phân loại ý định người dùng và gợi ý món ăn/địa điểm du lịch.

---

## 🚀 Cách Chạy Server

```bash
# 1. Cài đặt thư viện (chỉ cần chạy 1 lần)
pip install -r requirements.txt

# 2. Huấn luyện Model AI (chỉ cần chạy 1 lần hoặc khi thay đổi dataset)
train_model.bat

# 3. Khởi động Server
run_server.bat
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
├── requirements.txt              # Thư viện Python
├── Dockerfile                    # Đóng gói Docker
├── train_model.bat               # Script train model
├── run_server.bat                # Script chạy server
├── merge_data.py                 # Script gộp dữ liệu
│
├── data/                         # 📦 DỮ LIỆU
│   ├── regions/                  #   Dữ liệu chia theo tỉnh thành
│   │   ├── ha_noi.csv           #   Hà Nội (25 câu)
│   │   ├── sai_gon.csv          #   Sài Gòn (25 câu)
│   │   ├── da_nang.csv          #   Đà Nẵng (22 câu)
│   │   ├── hue.csv              #   Huế (20 câu)
│   │   ├── hoi_an.csv           #   Hội An (17 câu)
│   │   ├── nha_trang.csv        #   Nha Trang (18 câu)
│   │   ├── da_lat.csv           #   Đà Lạt (19 câu)
│   │   ├── phu_quoc.csv         #   Phú Quốc (14 câu)
│   │   ├── vung_tau.csv         #   Vũng Tàu (11 câu)
│   │   ├── can_tho.csv          #   Cần Thơ (14 câu)
│   │   ├── other_regions.csv    #   Các tỉnh khác (14 câu)
│   │   ├── general.csv          #   Câu hỏi chung (46 câu)
│   │   └── README.md            #   Hướng dẫn quản lý dữ liệu
│   ├── intent_dataset.csv        #   Dataset gộp (245 câu, tự động tạo)
│   └── knowledge_base.csv        #   Tri thức món ăn/địa điểm (30 record)
│
├── models/                       # 🧠 MODEL ĐÃ HUẤN LUYỆN
│   └── intent_model.pkl          #   File Model SVM (Accuracy: 91.84%)
│
├── docs/                         # 📝 BÁO CÁO
│   └── metrics.txt               #   Bảng điểm chi tiết
│
└── src/                          # 💻 MÃ NGUỒN
    ├── main.py                   #   Entry point FastAPI
    ├── validate_data.py          #   Script kiểm tra dữ liệu
    │
    ├── core/                     # 🔬 THUẬT TOÁN AI
    │   ├── nlp_utils.py          #   Tiền xử lý NLP
    │   ├── intent_classifier.py  #   Huấn luyện & Dự đoán ý định
    │   ├── ner.py                #   Trích xuất thực thể
    │   └── recommender.py        #   Tìm kiếm ngữ nghĩa
    │
    └── api/                      # 🌐 API GATEWAY
        ├── schemas.py            #   Pydantic Schema
        └── router.py             #   Endpoint POST /api/v1/ai/chat
```

---

## 📊 Kết Quả Huấn Luyện Model

| Metric | Giá trị |
|---|---|
| **Accuracy** | **91.84%** |
| Tổng câu hỏi | 245 câu |
| Model | SVM (SVC kernel='linear') |
| Vectorizer | TF-IDF (TfidfVectorizer) |
| NLP Tokenizer | Underthesea + Custom Stop Words |
| Tỉ lệ Train/Test | 80% / 20% |

### 4 Nhóm Ý Định (Intent) được AI nhận diện:

| Intent | Mô tả | Số câu | Ví dụ |
|---|---|---|---|
| `tim_mon_an` | Tìm kiếm món ăn | 78 | "Phở Hà Nội ăn ở đâu ngon?" |
| `tim_dia_diem` | Tìm địa điểm du lịch | 87 | "Nên đi đâu ở Đà Lạt?" |
| `hoi_thoi_tiet` | Hỏi về thời tiết | 43 | "Hôm nay Sài Gòn có mưa không?" |
| `giao_tiep_bot` | Giao tiếp với chatbot | 37 | "Chào bạn, giúp mình với" |

### Dữ liệu theo Tỉnh thành:

12 tỉnh thành phố: Hà Nội, Sài Gòn, Đà Nẵng, Huế, Hội An, Nha Trang, Đà Lạt, Phú Quốc, Vũng Tàu, Cần Thơ, và các tỉnh khác.

**Xem chi tiết:** `data/regions/README.md`

---

## ⚡ Tối Ưu Hiệu Năng

1. **In-Memory Loading (Lifespan):** Model và Recommender được nạp vào RAM 1 lần khi server khởi động. Mọi request sau đó truy cập trực tiếp từ bộ nhớ → Giảm latency từ ~500ms xuống ~5ms.
2. **Semantic Cache (LRU):** Lưu kết quả của 256 câu hỏi gần nhất. Câu hỏi trùng lặp → Trả ngay từ cache, bỏ qua toàn bộ tính toán AI.
3. **Stop Words Removal:** Loại bỏ ~25 từ vô nghĩa tiếng Việt (là, thì, mà, ở...) giúp TF-IDF tập trung vào từ khóa quan trọng.
