"""
File: src/api/router.py
Mục đích: Định nghĩa API Endpoint chính cho AI Service.
          Đây là "Cánh cửa duy nhất" mà Backend (Spring Boot) gọi vào để nhận kết quả AI.
          
          Endpoint: POST /api/v1/ai/chat
          
          Luồng xử lý bên trong (Pipeline):
          1. Nhận tin nhắn từ Backend → Validate bằng Pydantic Schema.
          2. Kiểm tra Semantic Cache (đã hỏi câu này chưa?).
          3. Phân loại Ý định (Intent) bằng Model SVM đã train.
          4. Nếu intent là tìm món ăn/địa điểm → Gọi NER bóc thực thể.
          5. Gọi Recommender Cosine Similarity tìm Top 3 kết quả.
          6. Đóng gói Response JSON chuẩn và trả về.
"""

from fastapi import APIRouter, HTTPException, Request  # Request để truy cập app.state
from src.api.schemas import ChatRequest, ChatResponse, RecommendationItem  # Schema đã chuẩn bị
from src.core.ner import extract_entities     # Hàm trích xuất thực thể từ Phase 3

# ==============================================================================
# KHỞI TẠO ROUTER
# ==============================================================================
# APIRouter giúp gom nhóm các endpoint lại, sau đó gắn vào app chính trong main.py
router = APIRouter(
    prefix="/api/v1/ai",  # Tất cả các endpoint sẽ bắt đầu bằng /api/v1/ai/...
    tags=["AI Chat"]       # Nhãn hiển thị trên Swagger UI
)

# ==============================================================================
# TỪ ĐIỂN CÂU TRẢ LỜI MẪU CHO TỪNG LOẠI Ý ĐỊNH (INTENT)
# ==============================================================================
# Khi AI phân loại được ý định, chúng ta cần một câu trả lời "mở đầu" tự nhiên
# trước khi đưa ra kết quả gợi ý. Đây là các mẫu câu cho từng intent.
INTENT_RESPONSES = {
    "tim_mon_an": "🍜 Đây là một số món ăn mà mình gợi ý cho bạn:",
    "tim_dia_diem": "📍 Đây là một số địa điểm du lịch mà mình gợi ý cho bạn:",
    "hoi_thoi_tiet": "🌤️ Mình chưa hỗ trợ tra cứu thời tiết trực tiếp. "
                      "Bạn có thể truy cập trang web dự báo thời tiết để biết thêm chi tiết nhé!",
    "giao_tiep_bot": "👋 Xin chào! Mình là Chatbot Ẩm Thực & Du Lịch Việt Nam. "
                      "Bạn có thể hỏi mình về các món ăn ngon hoặc địa điểm du lịch hấp dẫn nhé!"
}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, raw_request: Request):
    """
    🔥 ENDPOINT CHÍNH: POST /api/v1/ai/chat
    
    Đây là hàm xử lý chính khi Backend gửi tin nhắn tới AI Service.
    Tất cả logic AI đều chạy bên trong hàm này theo thứ tự Pipeline.
    
    Điểm khác biệt quan trọng:
    - `request` (ChatRequest): JSON body do Pydantic validate tự động.
    - `raw_request` (Request): Object FastAPI gốc, dùng để truy cập `app.state`
      chứa Model AI, Recommender, và Cache đã được load sẵn trong lifespan (main.py).
    
    Trả về:
        ChatResponse: JSON chứa intent, confidence, message, recommendations[], entities.
    """
    try:
        user_message = request.message
        
        # Lấy các đối tượng đã load sẵn trong RAM từ main.py lifespan
        # Thay vì khởi tạo mới mỗi request → Tiết kiệm thời gian cực lớn!
        classifier = raw_request.app.state.classifier      # Model SVM (đã load .pkl)
        recommender = raw_request.app.state.recommender    # Recommender (đã tính Ma trận TF-IDF)
        cache = raw_request.app.state.cache                # Semantic Cache (bộ nhớ đệm)
        
        # ==================================================================
        # BƯỚC 1: KIỂM TRA SEMANTIC CACHE (Bộ nhớ đệm thông minh)
        # ==================================================================
        # Nếu câu hỏi này ĐÃ CÓ trong cache → Trả ngay kết quả cũ, bỏ qua mọi tính toán.
        # Đây là tối ưu quan trọng nhất: giảm latency từ ~50ms xuống ~1ms cho câu hỏi lặp.
        cached_result = cache.get(user_message)
        if cached_result is not None:
            return ChatResponse(**cached_result)
        
        # ==================================================================
        # BƯỚC 2: PHÂN LOẠI Ý ĐỊNH (Intent Classification)
        # ==================================================================
        # Gọi Model SVM đã train ở Phase 2, đã load sẵn trong RAM qua lifespan.
        intent_result = classifier.predict_intent(user_message)
        
        intent = intent_result["intent"]         # Ý định: tim_mon_an, tim_dia_diem,...
        confidence = intent_result["confidence"] # Độ tự tin: 0.0 → 1.0
        
        # ==================================================================
        # BƯỚC 3: XỬ LÝ THEO TỪNG LOẠI Ý ĐỊNH
        # ==================================================================
        recommendations = []
        entities = None
        response_message = INTENT_RESPONSES.get(
            intent, 
            "Mình không hiểu lắm. Bạn thử hỏi cách khác nhé!"
        )
        
        # Chỉ gọi NER + Recommender khi intent là TÌM MÓN ĂN hoặc TÌM ĐỊA ĐIỂM
        # Nếu intent là giao tiếp bình thường hoặc hỏi thời tiết → bỏ qua phần này
        if intent in ("tim_mon_an", "tim_dia_diem"):
            
            # Bước 3a: Trích xuất thực thể (NER) — Bắt food[] và location[]
            entities = extract_entities(user_message)
            
            # Bước 3b: Gọi Recommender Cosine Similarity — Tìm Top 3 kết quả giống nhất
            raw_results = recommender.recommend(entities, top_k=3)
            
            # Bước 3c: Chuyển đổi kết quả thô thành Schema Pydantic chuẩn
            recommendations = [
                RecommendationItem(**item) for item in raw_results
            ]
            
            # Bước 3d: Bổ sung chi tiết vào câu trả lời nếu có kết quả
            if recommendations:
                detail_lines = []
                for i, rec in enumerate(recommendations, 1):
                    detail_lines.append(
                        f"\n{i}. **{rec.name}** ({rec.location})\n"
                        f"   {rec.description}"
                    )
                response_message += "\n" + "\n".join(detail_lines)
            else:
                response_message = (
                    "😅 Mình chưa tìm thấy kết quả phù hợp trong cơ sở dữ liệu. "
                    "Bạn thử mô tả cụ thể hơn nhé!"
                )
        
        # ==================================================================
        # BƯỚC 4: ĐÓNG GÓI RESPONSE + LƯU VÀO CACHE
        # ==================================================================
        response_data = {
            "intent": intent,
            "confidence": confidence,
            "message": response_message,
            "recommendations": [r.model_dump() for r in recommendations],
            "entities": entities
        }
        
        # Lưu kết quả vào Cache để lần sau không cần tính lại
        cache.set(user_message, response_data)
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        # Bắt mọi lỗi bất ngờ và trả về HTTP 500 kèm thông tin debug
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý AI: {str(e)}"
        )
