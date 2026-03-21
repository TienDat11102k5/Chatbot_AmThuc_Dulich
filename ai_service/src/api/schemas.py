"""
File: src/api/schemas.py
Mục đích: Định nghĩa các Lược đồ (Schema) chuẩn cho Request và Response của API.
          Sử dụng thư viện Pydantic để khai báo kiểu dữ liệu chính xác,
          tự động validate đầu vào và sinh tài liệu Swagger/OpenAPI tự động.
          
          File này đảm bảo giao tiếp giữa Backend (Spring Boot) và AI Service (FastAPI)
          tuân theo một cấu trúc JSON thống nhất, không bị sai lệch kiểu dữ liệu.
"""

from pydantic import BaseModel, Field  # BaseModel là lớp cha để định nghĩa schema
from typing import List, Optional       # Kiểu dữ liệu danh sách và tùy chọn


# ==============================================================================
# 1. SCHEMA ĐẦU VÀO (REQUEST) — Nhận từ Backend Spring Boot
# ==============================================================================
class ChatRequest(BaseModel):
    """
    Schema cho yêu cầu chat từ Backend.
    
    Khi Backend (Spring Boot) gửi request tới AI Service, nó PHẢI gửi JSON theo format này.
    Pydantic tự động kiểm tra: nếu thiếu trường 'message' sẽ trả lỗi 422 Validation Error.
    
    Ví dụ JSON đầu vào hợp lệ:
    {
        "message": "Ở Đà Lạt ăn gì ngon?",
        "session_id": "abc-123-xyz"
    }
    """
    message: str = Field(
        ...,  # Dấu 3 chấm (...) = BẮT BUỘC phải có, không được bỏ trống
        description="Nội dung tin nhắn của người dùng gửi lên chatbot",
        min_length=1,  # Không cho phép gửi chuỗi rỗng ""
        examples=["Ở Đà Lạt ăn gì ngon?"]
    )
    session_id: Optional[str] = Field(
        default=None,  # Không bắt buộc, có thể không gửi
        description="Mã phiên chat (nếu có). Dùng để tracking hội thoại."
    )


# ==============================================================================
# 2. SCHEMA KẾT QUẢ TÌM KIẾM — Mỗi kết quả AI recommend
# ==============================================================================
class RecommendationItem(BaseModel):
    """
    Schema cho MỖI kết quả (item) mà hệ thống Recommender tìm ra.
    
    Ví dụ 1 item:
    {
        "id": "MON011",
        "name": "Lẩu Bò Đà Lạt",
        "type": "food",
        "description": "Lẩu bò Đà Lạt nổi danh...",
        "location": "Đà Lạt",
        "tags": "lẩu, bò, đà lạt",
        "score": 0.8734
    }
    """
    id: str = Field(description="Mã định danh bản ghi (VD: MON001, DIA001)")
    name: str = Field(description="Tên món ăn hoặc địa điểm")
    type: str = Field(description="Loại: 'food' (món ăn) hoặc 'place' (địa điểm)")
    description: str = Field(description="Mô tả chi tiết về món ăn/địa điểm")
    location: str = Field(description="Vị trí địa lý (tỉnh/thành phố)")
    tags: str = Field(description="Các thẻ tag phân loại, ngăn cách bởi dấu phẩy")
    score: float = Field(description="Điểm tương đồng Cosine (0.0 → 1.0)")


# ==============================================================================
# 3. SCHEMA ĐẦU RA (RESPONSE) — Trả về cho Backend Spring Boot
# ==============================================================================
class ChatResponse(BaseModel):
    """
    Schema cho phản hồi từ AI Service trả về Backend.
    
    Backend sẽ nhận JSON này và xử lý tiếp (stream SSE về Frontend, lưu DB...).
    
    Ví dụ JSON đầu ra:
    {
        "intent": "tim_mon_an",
        "confidence": 0.95,
        "message": "Dưới đây là gợi ý cho bạn:",
        "recommendations": [
            {"id": "MON011", "name": "Lẩu Bò Đà Lạt", ...},
            {"id": "MON004", "name": "Bún Bò Huế", ...}
        ],
        "entities": {
            "food": ["lẩu bò"],
            "location": ["đà lạt"]
        }
    }
    """
    intent: str = Field(
        description="Ý định của người dùng (tim_mon_an, tim_dia_diem, hoi_thoi_tiet, giao_tiep_bot)"
    )
    confidence: float = Field(
        description="Độ tự tin của AI khi dự đoán intent (0.0 → 1.0)"
    )
    message: str = Field(
        description="Câu trả lời dạng text mà chatbot sẽ hiển thị cho người dùng"
    )
    recommendations: List[RecommendationItem] = Field(
        default=[],
        description="Danh sách kết quả gợi ý (Top 3 từ Cosine Similarity). Rỗng nếu intent là giao_tiep_bot."
    )
    entities: Optional[dict] = Field(
        default=None,
        description="Các thực thể NER đã trích xuất (food, location). Hữu ích cho debug."
    )


# ==============================================================================
# 4. SCHEMAS ADMIN — Dành cho trang quản trị AI (Phase 1)
# ==============================================================================
class IntentItem(BaseModel):
    """
    Schema cho 1 intent trong bộ dữ liệu huấn luyện.
    Ví dụ: { "tag": "tim_mon_an", "sample_count": 151, "examples": ["Phở Hà Nội", "Bún bò Huế"] }
    """
    tag: str = Field(description="Tên intent (VD: tim_mon_an, tim_dia_diem)")
    sample_count: int = Field(description="Số lượng mẫu câu huấn luyện cho intent này")
    examples: List[str] = Field(
        default=[],
        description="Tối đa 5 câu mẫu đại diện cho intent"
    )


class IntentListResponse(BaseModel):
    """Schema phản hồi danh sách intents cho trang Training Data admin."""
    total_intents: int = Field(description="Tổng số intent")
    total_samples: int = Field(description="Tổng số mẫu câu trong dataset")
    intents: List[IntentItem] = Field(description="Danh sách chi tiết từng intent")


class AiStatsResponse(BaseModel):
    """Schema phản hồi thống kê AI cho trang Monitoring admin."""
    total_intents: int = Field(description="Tổng số intent AI hỗ trợ")
    total_samples: int = Field(description="Tổng số mẫu câu huấn luyện")
    intent_breakdown: dict = Field(
        description="Phân bổ số lượng mẫu theo intent, VD: {'tim_mon_an': 151, 'tim_dia_diem': 100}"
    )
    cache_hit_count: int = Field(default=0, description="Số lần cache HIT (Redis)")
    cache_miss_count: int = Field(default=0, description="Số lần cache MISS")
    cache_hit_rate: float = Field(default=0.0, description="Tỉ lệ cache HIT (%)")
