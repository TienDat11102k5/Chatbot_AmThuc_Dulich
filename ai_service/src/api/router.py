"""
File: src/api/router.py
Mục đích: Định nghĩa API Endpoint chính cho AI Service.
          Đây là "Cánh cửa duy nhất" mà Backend (Spring Boot) gọi vào để nhận kết quả AI.
          
          Endpoint: POST /api/v1/ai/chat
          
          Luồng xử lý bên trong (Pipeline):
          1. Nhận tin nhắn từ Backend → Validate bằng Pydantic Schema.
          2. [MỚI] Load context từ Redis (nếu có) để nhớ ngữ cảnh hội thoại.
          3. [MỚI] Detect follow-up question ("còn quán nào không?").
          4. Kiểm tra Semantic Cache (đã hỏi câu này chưa?).
          5. Phân loại Ý định (Intent) bằng Model SVM đã train.
          6. [MỚI] Kiểm tra Out-of-Scope: 2 lớp phòng thủ (Intent OOS + Confidence Threshold).
          7. Nếu intent là tìm món ăn/địa điểm → Gọi NER bóc thực thể.
          8. [MỚI] Merge entities với context đã lưu (nếu là follow-up).
          9. Gọi Recommender Cosine Similarity tìm Top 3 kết quả.
          10. [MỚI] Filter bỏ các gợi ý đã đưa ra trước đó (tránh lặp).
          11. [MỚI] Lưu context mới vào Redis.
          12. Đóng gói Response JSON chuẩn và trả về.
"""

import re      # Regex for gibberish detection
import random  # Random response for OOS rejection
import os      # Environment variables
from fastapi import APIRouter, HTTPException, Request
from src.api.schemas import ChatRequest, ChatResponse, RecommendationItem
from src.core.ner import extract_entities
from src.core.location_handler import get_location_handler
from src.core.oos_logger import log_rejected_query  # OOS logging module
from src.core.context_manager import ContextManager, is_follow_up_question  # Context management

# ==============================================================================
# KHỞI TẠO ROUTER & CONTEXT MANAGER
# ==============================================================================
router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Chat"]
)

# Khởi tạo ContextManager với Redis
# Trong Docker: REDIS_HOST=redis, local: REDIS_HOST=localhost
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", "6379"))
context_manager = ContextManager(redis_host=redis_host, redis_port=redis_port)

# ==============================================================================
# CẤU HÌNH NGƯỠNG CONFIDENCE (Tunable Parameter)
# ==============================================================================
# Nếu model dự đoán với confidence < ngưỡng này VÀ intent không phải giao tiếp
# → tự động chuyển thành out_of_scope. Giá trị khởi điểm 0.4, điều chỉnh sau khi test.
CONFIDENCE_THRESHOLD = 0.4

# Danh sách các intent "giao tiếp" — KHÔNG áp dụng confidence threshold
# vì các câu ngắn ("hi", "bye") thường có confidence thấp nhưng vẫn hợp lệ.
CONVERSATION_INTENTS = {"chao_hoi", "cam_on", "tam_biet", "hoi_thong_tin"}

# ==============================================================================
# TỪ ĐIỂN CÂU TRẢ LỜI MẪU CHO TỪNG LOẠI Ý ĐỊNH (INTENT)
# ==============================================================================
INTENT_RESPONSES = {
    "tim_mon_an": "🍜 Đây là một số món ăn mà mình gợi ý cho bạn:",
    "tim_dia_diem": "📍 Đây là một số địa điểm du lịch mà mình gợi ý cho bạn:",
    "hoi_vi_tri": "🗺️ Mình sẽ giúp bạn tìm địa điểm gần đây:",
    "hoi_thoi_tiet": "🌤️ Mình chưa hỗ trợ tra cứu thời tiết trực tiếp. "
                      "Bạn có thể truy cập trang web dự báo thời tiết để biết thêm chi tiết nhé!",
    # Phản hồi giao tiếp — cải thiện UX cho các câu ngắn
    "chao_hoi": "👋 Xin chào! Mình là Chatbot Ẩm Thực & Du Lịch Việt Nam. "
                "Bạn có thể hỏi mình về các món ăn ngon hoặc địa điểm du lịch hấp dẫn nhé!",
    "cam_on": "😊 Cảm ơn bạn! Rất vui vì mình đã giúp được. "
              "Nếu cần tìm thêm món ăn hay địa điểm nào, cứ hỏi mình nhé!",
    "tam_biet": "👋 Tạm biệt bạn! Chúc bạn có những trải nghiệm ẩm thực "
                "và du lịch thật tuyệt vời. Hẹn gặp lại nhé!",
    "hoi_thong_tin": "ℹ️ Mình là Chatbot SavoryTrip — chuyên hỗ trợ tìm kiếm **món ăn ngon** "
                     "và **địa điểm du lịch** trên khắp Việt Nam. "
                     "Bạn có thể hỏi mình ví dụ:\n"
                     "• \"Phở Hà Nội ở đâu ngon?\"\n"
                     "• \"Gợi ý quán cà phê ở Đà Lạt\"\n"
                     "• \"Tìm địa điểm du lịch ở Phú Quốc\"",
}

# ==============================================================================
# CÂU TRẢ LỜI RANDOM KHI TỪ CHỐI OUT-OF-SCOPE (5 phiên bản)
# ==============================================================================
# Mỗi lần chatbot từ chối, chọn random 1 câu → tránh lặp lại nhàm chán.
# Mỗi câu đều kèm gợi ý chuyển hướng về chủ đề ẩm thực/du lịch.
OUT_OF_SCOPE_RESPONSES = [
    "🤔 Câu hỏi này nằm ngoài khả năng của mình rồi! "
    "Mình chỉ hỗ trợ về **ẩm thực** và **du lịch Việt Nam** thôi nhé.\n"
    "💡 Thử hỏi: *\"Phở Hà Nội ở đâu ngon?\"*",

    "😅 Xin lỗi, mình chưa được huấn luyện để trả lời câu hỏi này. "
    "Mình chuyên về **món ăn ngon** và **địa điểm du lịch** trên khắp Việt Nam.\n"
    "💡 Thử hỏi: *\"Gợi ý quán cà phê ở Đà Lạt\"*",

    "🙏 Mình không thể giúp được với câu hỏi này. "
    "Nhưng nếu bạn muốn khám phá **ẩm thực** hay **du lịch Việt Nam**, mình sẵn sàng!\n"
    "💡 Thử hỏi: *\"Bánh mì Sài Gòn ở đâu ngon nhất?\"*",

    "😊 Câu hỏi hay nhưng nằm ngoài chuyên môn của mình rồi! "
    "Mình giỏi nhất về **tìm đồ ăn** và **gợi ý địa điểm du lịch** cơ.\n"
    "💡 Thử hỏi: *\"Tìm địa điểm du lịch ở Phú Quốc\"*",

    "🤖 Mình là chatbot chuyên về **ẩm thực & du lịch**, nên không trả lời được câu này. "
    "Hãy thử hỏi mình về những điều mình biết nhé!\n"
    "💡 Thử hỏi: *\"Bún chả Hà Nội quán nào ngon?\"*",
]


# ==============================================================================
# HÀM PHÁT HIỆN CÂU VÔ NGHĨA (Gibberish Detector)
# ==============================================================================
# Mục đích: Chặn các input vô nghĩa ("asdfgh", "xyz123", "!!!")
# trước khi gửi vào model SVM — vì model không được train xử lý gibberish.
def _is_gibberish(text: str) -> bool:
    """
    Kiểm tra xem input có phải là chuỗi vô nghĩa không.
    Trả về True nếu text bị coi là gibberish.
    """
    cleaned = text.strip()

    # Rule 1: Quá ngắn (< 2 ký tự chữ cái)
    alpha_chars = re.sub(r'[^a-zA-ZÀ-ỹ]', '', cleaned)
    if len(alpha_chars) < 2:
        return True

    # Rule 2: Không chứa nguyên âm tiếng Việt nào
    # Người Việt viết câu nào cũng có nguyên âm (a, e, i, o, u + dấu)
    vietnamese_vowels = set(
        'aeiouyàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệ'
        'ìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữự'
        'ỳýỷỹỵ'
    )
    lower_text = cleaned.lower()
    has_vowel = any(ch in vietnamese_vowels for ch in lower_text)
    if not has_vowel:
        return True

    # Rule 3: Có cluster phụ âm liên tiếp > 3 ký tự (e.g. "sdfg", "xyz")
    # Tiếng Việt tối đa 2-3 phụ âm liền nhau ("ngh", "tr"), nên > 3 là gibberish
    consonant_pattern = re.compile(r'[bcdfghjklmnpqrstvwxz]{4,}', re.IGNORECASE)
    if consonant_pattern.search(lower_text):
        return True

    # Rule 4: String ngắn (≤ 6 chữ cái) có tỷ lệ phụ âm quá cao (>= 60%)
    # Ví dụ: "xyz123" → 3 chữ cái, 67% phụ âm → gibberish
    # Nhưng "Phở" → quá ngắn nên Rule 1 chặn rồi, "chào" → 25% phụ âm → OK
    if len(alpha_chars) <= 6:
        consonants = set('bcdfghjklmnpqrstvwxz')
        cons_count = sum(1 for ch in alpha_chars.lower() if ch in consonants)
        if len(alpha_chars) > 0 and cons_count / len(alpha_chars) >= 0.6:
            return True

    return False


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, raw_request: Request):
    """
    🔥 ENDPOINT CHÍNH: POST /api/v1/ai/chat
    
    Pipeline xử lý (có Out-of-Scope Protection):
    1. Cache check → 2. Intent Classification → 3. OOS Guard (2 lớp)
    → 4. NER + Recommender → 5. Response + Cache
    """
    try:
        user_message = request.message

        # Load pre-initialized objects from app.state (lifespan)
        classifier = raw_request.app.state.classifier
        recommender = raw_request.app.state.recommender
        cache = raw_request.app.state.cache

        # ==================================================================
        # BƯỚC 0: GIBBERISH DETECTION — Chặn câu vô nghĩa ngay từ đầu
        # ==================================================================
        if _is_gibberish(user_message):
            log_rejected_query(
                user_message=user_message,
                predicted_intent="gibberish",
                confidence=0.0,
                rejection_reason="gibberish_detected",
            )
            response_message = random.choice(OUT_OF_SCOPE_RESPONSES)
            response_data = {
                "intent": "out_of_scope",
                "confidence": 0.0,
                "message": response_message,
                "recommendations": [],
                "entities": None,
                "ask_location": False,
            }
            cache.set(user_message, response_data)
            return ChatResponse(**response_data)

        # ==================================================================
        # BƯỚC 1: LOAD CONTEXT & DETECT FOLLOW-UP (trước cache check)
        # ==================================================================
        session_id = request.session_id
        saved_context = context_manager.get_context(session_id)
        is_follow_up = is_follow_up_question(user_message)
        
        print(f"[Chat] Session: {session_id[:8] if session_id else 'None'}..., Follow-up: {is_follow_up}")
        
        # ==================================================================
        # BƯỚC 1.5: KIỂM TRA SEMANTIC CACHE (skip nếu là follow-up)
        # ==================================================================
        # Follow-up questions KHÔNG được cache vì phụ thuộc vào context
        if not is_follow_up:
            cached_result = cache.get(user_message)
            if cached_result is not None:
                return ChatResponse(**cached_result)

        # ==================================================================
        # BƯỚC 2: PHÂN LOẠI Ý ĐỊNH (Intent Classification)
        # ==================================================================
        intent_result = classifier.predict_intent(user_message)
        intent = intent_result["intent"]
        confidence = intent_result["confidence"]
        
        # ==================================================================
        # BƯỚC 2.5: OVERRIDE INTENT FOR FOLLOW-UP QUESTIONS
        # ==================================================================
        # Nếu là follow-up và có saved context → dùng intent từ context
        # Bỏ qua OOS guard vì follow-up questions thường ngắn và có confidence thấp
        if is_follow_up and saved_context and saved_context.get("last_intent"):
            intent = saved_context["last_intent"]
            confidence = 1.0  # Override confidence để bypass OOS guard
            print(f"[Chat] Follow-up detected, using saved intent: {intent}")

        # ==================================================================
        # BƯỚC 3: OUT-OF-SCOPE GUARD — Phòng thủ 2 lớp
        # ==================================================================
        # Lớp 1: Model trực tiếp classify là "out_of_scope"
        # Lớp 2: Confidence thấp (< 0.4) cho các intent KHÔNG phải giao tiếp
        #         → Model "không chắc chắn" → coi như out_of_scope
        is_oos = False
        rejection_reason = ""

        if intent == "out_of_scope":
            is_oos = True
            rejection_reason = "intent_oos"
        elif (
            confidence < CONFIDENCE_THRESHOLD
            and intent not in CONVERSATION_INTENTS
        ):
            is_oos = True
            rejection_reason = "low_confidence"

        # Nếu bị chặn → trả câu từ chối random + log + KHÔNG gọi NER/Recommender
        if is_oos:
            log_rejected_query(
                user_message=user_message,
                predicted_intent=intent,
                confidence=confidence,
                rejection_reason=rejection_reason,
            )
            response_message = random.choice(OUT_OF_SCOPE_RESPONSES)
            response_data = {
                "intent": "out_of_scope",
                "confidence": confidence,
                "message": response_message,
                "recommendations": [],
                "entities": None,
                "ask_location": False,
            }
            cache.set(user_message, response_data)
            return ChatResponse(**response_data)

        # ==================================================================
        # BƯỚC 4: XỬ LÝ THEO TỪNG LOẠI Ý ĐỊNH (Chỉ đến đây nếu in-scope)
        # ==================================================================
        recommendations = []
        entities = None
        response_message = INTENT_RESPONSES.get(
            intent,
            "Mình không hiểu lắm. Bạn thử hỏi cách khác nhé!"
        )

        if intent in ("tim_mon_an", "tim_dia_diem"):
            # NER → Extract entities từ câu hiện tại
            entities = extract_entities(user_message)
            
            # ==================================================================
            # CONTEXT AWARENESS: Merge với context đã lưu (nếu là follow-up)
            # ==================================================================
            if is_follow_up and saved_context:
                print("[Chat] Detected follow-up question, merging with saved context")
                entities = context_manager.merge_entities(entities, saved_context)
                
                # Nếu là follow-up, dùng intent từ context cũ
                if saved_context.get("last_intent"):
                    intent = saved_context["last_intent"]
                    print(f"[Chat] Using saved intent: {intent}")
            
            # Fallback: Nếu không có location trong câu hiện tại và không phải follow-up,
            # thử extract location từ chat history (câu trước)
            if not entities.get("location") and request.chat_history and not is_follow_up:
                print("[Context] No location in current message, checking chat history...")
                # Duyệt ngược chat history để tìm location gần nhất
                for hist_msg in reversed(request.chat_history):
                    if isinstance(hist_msg, dict) and "message" in hist_msg:
                        hist_text = hist_msg["message"]
                        hist_entities = extract_entities(hist_text)
                        if hist_entities.get("location"):
                            entities["location"] = hist_entities["location"]
                            print(f"[Context] Found location from history: {entities['location']}")
                            break
            
            # Gọi recommender với top_k=10 để có dự phòng cho việc filter
            recommender_result = recommender.recommend(
                entities, intent=intent, top_k=10, user_message=user_message
            )
            raw_results = recommender_result["results"]
            location_not_found = recommender_result.get(
                "location_not_found", False
            )
            searched_location = recommender_result.get(
                "searched_location", None
            )
            
            # ==================================================================
            # FILTER PREVIOUS RECOMMENDATIONS (tránh lặp lại gợi ý)
            # ==================================================================
            previous_rec_ids = context_manager.get_previous_recommendations(session_id)
            if previous_rec_ids:
                print(f"[Chat] Filtering {len(previous_rec_ids)} previous recommendations")
                # Filter bỏ các gợi ý đã đưa ra trước đó
                filtered_results = [
                    rec for rec in raw_results 
                    if rec.get("id") not in previous_rec_ids
                ]
                
                # Nếu sau khi filter không còn đủ 3 gợi ý, giữ nguyên top 3 từ filtered
                if len(filtered_results) >= 3:
                    raw_results = filtered_results[:3]
                elif len(filtered_results) > 0:
                    # Có ít hơn 3 gợi ý mới, lấy hết
                    raw_results = filtered_results
                else:
                    # Không còn gợi ý mới nào
                    print("[Chat] No new recommendations available after filtering")
                    raw_results = []
            else:
                # Không có previous recommendations, lấy top 3
                raw_results = raw_results[:3]

            recommendations = [
                RecommendationItem(**item) for item in raw_results
            ]

            if recommendations:
                # Tùy chỉnh message cho follow-up
                if is_follow_up and saved_context:
                    if intent == "tim_mon_an":
                        response_message = "🍜 Đây là thêm một số gợi ý khác cho bạn:"
                    elif intent == "tim_dia_diem":
                        response_message = "📍 Đây là thêm một số địa điểm khác:"
                elif location_not_found and searched_location:
                    response_message = (
                        f"😅 Mình không tìm thấy kết quả phù hợp tại"
                        f" {searched_location}. "
                        f"Đây là một số gợi ý từ các tỉnh thành khác:\n"
                    )
                
                detail_lines = []
                for i, rec in enumerate(recommendations, 1):
                    location_info = rec.location
                    if rec.address and rec.address.strip():
                        location_info += f" - {rec.address}"
                    detail_lines.append(
                        f"\n{i}. **{rec.name}** ({location_info})\n"
                        f"   {rec.description}"
                    )
                response_message += "\n" + "\n".join(detail_lines)
            else:
                # Không còn gợi ý mới sau khi filter
                if previous_rec_ids and is_follow_up:
                    response_message = (
                        "😅 Mình đã gợi ý hết các địa điểm phù hợp rồi! "
                        "Bạn có thể thử hỏi về địa điểm khác hoặc thay đổi tiêu chí tìm kiếm nhé."
                    )
                else:
                    response_message = (
                        "😅 Mình chưa tìm thấy kết quả phù hợp trong "
                        "cơ sở dữ liệu. Bạn thử mô tả cụ thể hơn nhé!"
                    )

        elif intent == "hoi_vi_tri":
            entities = extract_entities(user_message)
            location_handler = get_location_handler()
            user_location = request.user_location
            location_result = location_handler.handle_nearby_query(
                entities, user_location
            )
            response_message = location_result["message"]
            raw_results = location_result.get("recommendations", [])
            recommendations = [
                RecommendationItem(**item) for item in raw_results
            ]

        # ==================================================================
        # BƯỚC 5: LƯU CONTEXT VÀO REDIS (trước khi return)
        # ==================================================================
        if intent in ("tim_mon_an", "tim_dia_diem") and recommendations:
            context_manager.save_context(
                session_id=session_id,
                entities=entities,
                intent=intent,
                recommendations=[r.model_dump() for r in recommendations]
            )
        
        # ==================================================================
        # BƯỚC 6: ĐÓNG GÓI RESPONSE + LƯU VÀO CACHE (skip cache cho follow-up)
        # ==================================================================
        ask_location = False
        if intent == "hoi_vi_tri":
            ask_location = location_result.get("ask_location", False)

        response_data = {
            "intent": intent,
            "confidence": confidence,
            "message": response_message,
            "recommendations": [r.model_dump() for r in recommendations],
            "entities": entities,
            "ask_location": ask_location,
        }

        # Chỉ cache nếu KHÔNG phải follow-up (follow-up phụ thuộc context)
        if not is_follow_up:
            cache.set(user_message, response_data)
        
        return ChatResponse(**response_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý AI: {str(e)}"
        )
