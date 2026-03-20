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
import json
from contextlib import asynccontextmanager  # Quản lý vòng đời server (khởi động/dừng)
from functools import lru_cache             # Bộ nhớ đệm LRU (Least Recently Used)

import redis as redis_lib                    # Redis client (Phase 7 — Semantic Cache dùng chung)
from fastapi import FastAPI                 # Framework API chính
from fastapi.middleware.cors import CORSMiddleware  # Middleware cho phép Cross-Origin requests

# Import Router chứa endpoint đã chuẩn bị ở Phase 4
from src.api.router import router as ai_router
from src.api.admin_router import admin_router  # Phase 1: Admin endpoints
from src.core.intent_classifier import IntentClassifier  # Model phân loại ý định
from src.core.recommender import RecommenderSystem       # Hệ thống đề xuất (CSV — sẽ chuyển sang PostgreSQL ở Phase AI Service)

# ==============================================================================
# 1. SEMANTIC CACHE — BỘ NHỚ ĐỆM THÔNG MINH (Redis-backed)
# ==============================================================================
# [THAY ĐỔI Phase 7] Trước đây dùng Python Dict (mất khi restart).
# Bây giờ dùng Redis để cache tồn tại giữa các lần restart và có thể chia sẻ
# nếu AI Service được scale lên nhiều instance.
#
# Key pattern: "chat:cache:{normalized_question}"
# TTL: 1 giờ (3600 giây) — câu hỏi ít thay đổi trong 1 giờ
#
# Ví dụ:
#   Hỏi "Phở Hà Nội ngon ở đâu?" → AI tính toán 200ms → Lưu vào Redis
#   Restart AI Service
#   Hỏi lại → Redis trả ngay < 5ms (không cần tính toán lại)

class SemanticCache:
    """
    Bộ nhớ đệm ngữ nghĩa dùng Redis làm backend lưu trữ.
    
    Key = câu hỏi đã chuẩn hóa (lowercase, strip).
    Value = kết quả JSON serialize.
    TTL = 1 giờ (tự xóa sau 3600 giây).
    
    Graceful Degradation: Nếu Redis bị sập, cache bị bỏ qua hoàn toàn —
    AI vẫn hoạt động bình thường, chỉ chậm hơn vì phải tính toán lại.
    """
    
    # Tiền tố cho mọi key trong Redis — tránh xung đột với key khác
    KEY_PREFIX = "chat:cache:"
    
    # Thời gian sống của mỗi cache entry (1 giờ)
    TTL_SECONDS = 3600

    def __init__(self):
        """
        Khởi tạo Redis client từ biến môi trường.
        
        Biến môi trường:
            REDIS_HOST: Host Redis (mặc định "localhost", Docker dùng "redis")
            REDIS_PORT: Port Redis (mặc định 6379)
        
        Nếu không kết nối được Redis → self.redis_client = None
        (Graceful Degradation — cache bị bỏ qua, AI vẫn chạy bình thường)
        """
        self.hit_count = 0   # Đếm số lần bắn trúng cache (dùng cho thống kê)
        self.miss_count = 0  # Đếm số lần hụt cache
        
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        
        try:
            self.redis_client = redis_lib.Redis(
                host=redis_host,
                port=redis_port,
                decode_responses=True,  # Tự động decode bytes → str
                socket_timeout=2,       # Timeout 2 giây — tránh block lâu
                socket_connect_timeout=2
            )
            # Ping để kiểm tra kết nối ngay lúc khởi động
            self.redis_client.ping()
            print(f"      ✅ Đã kết nối Redis tại {redis_host}:{redis_port}")
        except Exception as e:
            # Không kết nối được → Graceful Degradation
            self.redis_client = None
            print(f"      ⚠️  Không kết nối được Redis ({e}) — Bỏ qua Semantic Cache")

    def get(self, key: str):
        """
        Tìm kết quả trong Redis cache.
        
        Tham số:
            key (str): Câu hỏi gốc (chưa cần chuẩn hóa).
            
        Trả về:
            dict hoặc None: Kết quả cũ nếu tìm thấy, None nếu chưa có.
        """
        if self.redis_client is None:
            self.miss_count += 1
            return None  # Redis sập → luôn miss
            
        normalized_key = self.KEY_PREFIX + key.lower().strip()
        
        try:
            data = self.redis_client.get(normalized_key)
            if data:
                self.hit_count += 1
                print(f"[Cache] 🎯 HIT — Trả ngay kết quả từ Redis cho: '{key[:30]}...'")
                return json.loads(data)  # Deserialize JSON → dict
            self.miss_count += 1
            return None
        except Exception as e:
            # Redis lỗi giữa chừng → bỏ qua cache, tiếp tục xử lý bình thường
            self.miss_count += 1
            print(f"[Cache] ⚠️ Redis lỗi khi đọc: {e}")
            return None

    def set(self, key: str, value):
        """
        Lưu kết quả vào Redis cache với TTL tự động.
        
        Tham số:
            key (str): Câu hỏi gốc (chưa cần chuẩn hóa).
            value: Kết quả cần lưu (dict/JSON serializable).
        """
        if self.redis_client is None:
            return  # Redis sập → bỏ qua, không lưu
            
        normalized_key = self.KEY_PREFIX + key.lower().strip()
        
        try:
            # SETEX = SET + EXPIRE trong 1 lệnh (atomic)
            self.redis_client.setex(
                name=normalized_key,
                time=self.TTL_SECONDS,  # TTL: 1 giờ
                value=json.dumps(value, ensure_ascii=False)  # Serialize dict → JSON
            )
        except Exception as e:
            # Redis lỗi khi ghi → bỏ qua, không crash AI
            print(f"[Cache] ⚠️ Redis lỗi khi ghi: {e}")




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
    
    # Khởi tạo Semantic Cache kết nối Redis
    print("[3/3] Đang thiết lập Semantic Cache (Redis-backed, TTL=1h)...")
    app.state.cache = SemanticCache()  # Phase 7: Không còn max_size, dùng Redis TTL thay thế
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
app.include_router(admin_router)  # Phase 1: Admin endpoints (GET /api/v1/ai/admin/*)


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
