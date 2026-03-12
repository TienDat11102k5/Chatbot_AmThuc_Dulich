# 🧠 AI Service - BỘ NÃO AI (Python FastAPI)

Đây là thành phần Cốt Lõi nhất của Đồ án Trí tuệ Nhân tạo. Nơi này đảm nhận việc xử lý AI theo luồng RAG (Retrieval-Augmented Generation) để cung cấp câu trả lời tư vấn về ẩm thực, du lịch của 63 tỉnh thành Việt Nam.

## 📂 Kiến Trúc Thư Mục Chuẩn

Nền tảng: **Python + FastAPI + LangChain/LlamaIndex**

```text
.
├── docs/                # Chứa tài liệu API nội bộ (ví dụ: `openapi.json`, hướng dẫn sử dụng API)
├── data/                # [QUAN TRỌNG] Nơi chứa file text/json thô để đưa vào RAG (vd: `hanoi.md`, `saigon.md`)
├── models/              # Nơi chứa các File Configuration cho Prompt đặc thù của LLM hoặc local model tải về
├── src/                 # Source Code Chính
│   ├── api/             # Chứa Routers của FastAPI (vd: `chat_api.py`, `health.py`) phơi cho Backend gọi
│   ├── core/            # Config chung: `config.py` (loadding `.env`), `logger.py`
│   ├── llm/             # Adapter giao tiếp với LLM: `gemini_adapter.py`, `openai_adapter.py`
│   ├── rag/             # Logic Chunking, Embedding, Vector Database (vd: `chroma_db.py`, `document_loader.py`)
│   ├── services/        # Business Logic xử lý câu hỏi: Kết hợp RAG tìm Context -> LLM sinh câu trả lời
│   └── main.py          # Entrypoint của toàn hệ thống (Uvicorn run ở file này)
├── requirements.txt     # File quản lý thư viện Python (FastAPI, LangChain, Uvicorn, ChromaDB)
└── Dockerfile           # Kịch bản đóng gói ứng dụng AI chạy trên Docker
```

## 📝 Bí quyết làm RAG cho môn AI

1. Bỏ toàn bộ cẩm nang du lịch và bài Review quán ăn (đã làm sạch nội dung) vào mục `data/`.
2. Lớp `rag/` sẽ cắt chúng thành những đoạn nhỏ (chunks) và chuyển thành vector lưu trong ChromaDB.
3. Khi người dùng hỏi "Đi Bắc Ninh có món bánh nào đê ăn?", hệ thống sẽ search vector trong `rag/` lấy ra thông tin "Bánh phu thê Đình Bảng", nhét thông tin này vào file `llm/` để yêu cầu API trả lời một cách tự nhiên.

> Ghi chú: Sử dụng file `.gitkeep` ở các thư mục rỗng phía trên để đảm bảo khi đẩy lên Git không bị thất lạc cấu trúc.
