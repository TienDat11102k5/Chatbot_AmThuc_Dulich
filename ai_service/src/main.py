"""
File: src/main.py
Mục đích: Điểm khởi chạy (Entry Point) chính của AI Service.
          File này được Uvicorn gọi đầu tiên, chịu trách nhiệm:
          1. Khởi tạo ứng dụng FastAPI.
          2. Load toàn bộ Model AI và Recommender vào RAM (In-Memory) qua Lifespan.
          3. Thiết lập Semantic Cache (LRU) để tăng tốc các câu hỏi lặp lại.
          4. Gắn Router API endpoint.
          5. Cho phép CORS (để Frontend/Backend khác domain gọi được).
          
Cách chạy Server: 
    py -3.11 -m uvicorn src.main:app --reload --port 8000
    
Sau khi chạy, truy cập:
    - API: http://localhost:8000/api/v1/ai/chat
    - Swagger UI (Tài liệu API tự động): http://localhost:8000/docs
"""

import sys
import os
from contextlib import asynccontextmanager  # Quản lý vòng đời server (khởi động/dừng)
from functools import lru_cache             # Bộ nhớ đệm LRU (Least Recently Used)

from fastapi import FastAPI                 # Framework API chính
from fastapi.middleware.cors import CORSMiddleware  # Middleware cho phép Cross-Origin requests

# Import Router chứa endpoint đã chuẩn bị ở Phase 4
from src.api.router import router as ai_router
from src.core.intent_classifier import IntentClassifier  # Model phân loại ý định
from src.core.recommender import RecommenderSystem       # Hệ thống đề xuất

# ==============================================================================
# 1. SEMANTIC CACHE — BỘ NHỚ ĐỆM THÔNG MINH (LRU Cache)
# ==============================================================================
# Tại sao cần Cache?
# Nếu 100 người cùng hỏi "Phở Hà Nội ở đâu ngon?", hệ thống không cần 
# chạy thuật toán AI 100 lần. Chỉ cần chạy lần đầu, rồi lưu kết quả lại.
# Các lần sau trả kết quả ngay từ bộ nhớ → Nhanh gấp 10-50 lần.
#
# maxsize=256: Lưu tối đa 256 câu hỏi gần nhất. Nếu đầy → tự xóa câu lâu không dùng.
# LRU = Least Recently Used = Ít được dùng gần đây nhất sẽ bị xóa trước.

class SemanticCache:
    """
    Bộ nhớ đệm ngữ nghĩa đơn giản dùng Python Dict.
    Key = câu hỏi đã chuẩn hóa (lowercase, bỏ dấu câu).
    Value = kết quả JSON trả về.
    """
    def __init__(self, max_size: int = 256):
        """
        Khởi tạo cache rỗng với kích thước tối đa.
        
        Tham số:
            max_size (int): Số lượng tối đa câu hỏi lưu trong bộ nhớ đệm.
        """
        self.cache = {}         # Dictionary lưu trữ: {key: value}
        self.max_size = max_size
        self.hit_count = 0      # Đếm số lần bắn trúng cache (dùng cho thống kê)
        self.miss_count = 0     # Đếm số lần hụt cache
        
    def get(self, key: str):
        """
        Tìm kết quả trong cache.
        
        Tham số:
            key (str): Câu hỏi đã chuẩn hóa.
            
        Trả về:
            dict hoặc None: Kết quả cũ nếu tìm thấy, None nếu chưa hỏi bao giờ.
        """
        normalized_key = key.lower().strip()
        if normalized_key in self.cache:
            self.hit_count += 1
            print(f"[Cache] 🎯 HIT — Trả ngay kết quả cũ cho: '{key[:30]}...'")
            return self.cache[normalized_key]
        self.miss_count += 1
        return None
    
    def set(self, key: str, value):
        """
        Lưu kết quả mới vào cache.
        Nếu cache đầy → Xóa phần tử cũ nhất (FIFO — First In First Out).
        
        Tham số:
            key (str): Câu hỏi đã chuẩn hóa.
            value: Kết quả cần lưu (dict/JSON).
        """
        normalized_key = key.lower().strip()
        
        # Nếu đầy, xóa phần tử nhập vào sớm nhất
        if len(self.cache) >= self.max_size:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            
        self.cache[normalized_key] = value


# ==============================================================================
# 2. LIFESPAN — QUẢN LÝ VÒNG ĐỜI SERVER (Startup / Shutdown)
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Hàm Lifespan quản lý sự kiện khi Server BẬT LÊN và TẮT ĐI.
    
    Khi Server KHỞI ĐỘNG (Startup):
    - Load Model SVM (intent_model.pkl) vào RAM → Không phải đọc file mỗi request.
    - Khởi tạo RecommenderSystem (tính sẵn Ma trận TF-IDF) → Tìm kiếm siêu nhanh.
    - Tạo SemanticCache rỗng sẵn sàng lưu trữ.
    
    Khi Server DỪNG (Shutdown):
    - In thống kê Cache (bao nhiêu lần HIT / MISS) ra terminal để debug.
    - Giải phóng RAM.
    
    Tại sao Load 1 lần?
    - Nếu mỗi request đều đọc file .pkl → chậm 200-500ms.
    - Load 1 lần vào RAM → truy cập chỉ 1-5ms → Nhanh gấp 100 lần!
    """
    print("\n" + "="*55)
    print(" 🚀 AI SERVICE ĐANG KHỞI ĐỘNG...")
    print("="*55)
    
    # --- STARTUP: Load mọi thứ vào RAM ---
    
    # Load Model phân loại ý định (SVM)
    print("[1/3] Đang nạp Model Intent Classifier (SVM)...")
    app.state.classifier = IntentClassifier()
    print("      ✅ Model SVM đã sẵn sàng trong RAM!")
    
    # Khởi tạo hệ thống Recommender (tính Ma trận TF-IDF từ Knowledge Base)
    print("[2/3] Đang khởi tạo Recommender System (TF-IDF Matrix)...")
    app.state.recommender = RecommenderSystem()
    print("      ✅ Recommender đã sẵn sàng!")
    
    # Khởi tạo Semantic Cache rỗng
    print("[3/3] Đang thiết lập Semantic Cache (LRU, max=256)...")
    app.state.cache = SemanticCache(max_size=256)
    print("      ✅ Cache đã sẵn sàng!")
    
    print("\n" + "="*55)
    print(" ✅ AI SERVICE KHỞI ĐỘNG THÀNH CÔNG!")
    print(" 🌐 Swagger UI: http://localhost:8000/docs")
    print(" 📡 Endpoint:   POST http://localhost:8000/api/v1/ai/chat")
    print("="*55 + "\n")
    
    # yield = Đánh dấu server đang chạy. Code dưới yield chạy khi server DỪNG.
    yield
    
    # --- SHUTDOWN: Dọn dẹp khi tắt server ---
    cache = app.state.cache
    print("\n" + "="*55)
    print(" 🛑 AI SERVICE ĐANG DỪNG...")
    print(f" 📊 Cache Stats: HIT={cache.hit_count} | MISS={cache.miss_count}")
    total = cache.hit_count + cache.miss_count
    if total > 0:
        hit_rate = (cache.hit_count / total) * 100
        print(f" 📈 Tỉ lệ HIT: {hit_rate:.1f}%")
    print("="*55 + "\n")


# ==============================================================================
# 3. KHỞI TẠO ỨNG DỤNG FASTAPI
# ==============================================================================
app = FastAPI(
    title="AI Chatbot Ẩm Thực & Du Lịch Việt Nam",
    description=(
        "API Service xử lý ngôn ngữ tự nhiên tiếng Việt cho chatbot tư vấn du lịch và ẩm thực.\n\n"
        "**Thuật toán cốt lõi:**\n"
        "- Intent Classification: TF-IDF + SVM (scikit-learn)\n"
        "- Named Entity Recognition: Regex + Dictionary Matching\n"
        "- Recommendation: Cosine Similarity trên Knowledge Base\n"
        "- Tokenization: Underthesea (Tiếng Việt)"
    ),
    version="1.0.0",
    lifespan=lifespan  # Gắn hàm quản lý vòng đời (startup/shutdown) ở trên
)

# ==============================================================================
# 4. CẤU HÌNH CORS (Cross-Origin Resource Sharing)
# ==============================================================================
# CORS cho phép Frontend (React chạy port 3000) và Backend (Spring Boot port 8080)
# có thể gọi API tới AI Service (port 8000) mà không bị trình duyệt chặn.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Cho phép tất cả origin (DEV mode — Production nên giới hạn)
    allow_credentials=True,
    allow_methods=["*"],       # Cho phép GET, POST, PUT, DELETE...
    allow_headers=["*"],       # Cho phép mọi Header
)

# ==============================================================================
# 5. GẮN ROUTER (Các endpoint API)
# ==============================================================================
app.include_router(ai_router)


# ==============================================================================
# 6. ENDPOINT KIỂM TRA SỨC KHỎE (Health Check)
# ==============================================================================
@app.get("/health", tags=["System"])
async def health_check():
    """
    Endpoint kiểm tra xem AI Service có đang chạy bình thường không.
    Backend hoặc Load Balancer sẽ gọi endpoint này định kỳ để theo dõi.
    
    Trả về:
        dict: {"status": "healthy", "service": "ai-chatbot-amthuc-dulich"}
    """
    return {
        "status": "healthy",
        "service": "ai-chatbot-amthuc-dulich",
        "version": "1.0.0"
    }
