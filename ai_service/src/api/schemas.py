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
        "session_id": "abc-123-xyz",
        "user_location": {
            "lat": 10.762622,
            "lng": 106.660172,
            "address": "TP. Hồ Chí Minh"
        },
        "chat_history": [
            {"role": "user", "content": "Tôi muốn đi du lịch"},
            {"role": "assistant", "content": "Bạn muốn đi đâu?"}
        ]
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
    user_location: Optional[dict] = Field(
        default=None,
        description="Vị trí hiện tại của user (cho câu hỏi 'gần đây'). Format: {lat: float, lng: float, address: str}"
    )
    chat_history: Optional[List[dict]] = Field(
        default=None,
        description="Lịch sử chat gần đây (tối đa 5 tin nhắn). Format: [{role: 'user'|'assistant', content: str}]"
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
        "address": "123 Đường ABC, Phường XYZ",
        "tags": "lẩu, bò, đà lạt",
        "score": 0.8734
    }
    """
    id: str = Field(description="Mã định danh bản ghi (VD: MON001, DIA001)")
    name: str = Field(description="Tên món ăn hoặc địa điểm")
    type: str = Field(description="Loại: 'food' (món ăn) hoặc 'place' (địa điểm)")
    description: str = Field(description="Mô tả chi tiết về món ăn/địa điểm")
    location: str = Field(description="Vị trí địa lý (tỉnh/thành phố)")
    address: str = Field(default="", description="Địa chỉ chi tiết (nếu có)")
    tags: str = Field(description="Các thẻ tag phân loại, ngăn cách bởi dấu phẩy")
    price_range: str = Field(default="", description="Khoảng giá (VD: '50k-100k', 'Cao cấp')")
    rating: float = Field(default=0.0, description="Đánh giá trung bình (0.0 → 5.0)")
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
        },
        "ask_location": false
    }
    """
    intent: str = Field(
        description="Ý định của người dùng (tim_mon_an, tim_dia_diem, hoi_vi_tri, hoi_thoi_tiet, chao_hoi, cam_on, tam_biet, hoi_thong_tin, hoi_gia, so_sanh, danh_gia, out_of_scope)"
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
    ask_location: bool = Field(
        default=False,
        description="True nếu AI cần hỏi lại vị trí user (cho intent hoi_vi_tri)"
    )
    # Pagination fields — Phase 1
    has_more_results: bool = Field(
        default=False,
        description="True nếu còn kết quả khác chưa hiển thị (user hỏi 'còn quán nào' để xem tiếp)"
    )
    total_results: int = Field(
        default=0,
        description="Tổng số kết quả tìm được (VD: tìm được 15 quán, hiện 3 quán đầu)"
    )
    remaining_results: int = Field(
        default=0,
        description="Số kết quả còn lại chưa hiển thị"
    )
    # Sentiment field — Phase 3
    sentiment: Optional[str] = Field(
        default=None,
        description="Cảm xúc phát hiện được: 'positive', 'negative', 'neutral' hoặc None"
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
