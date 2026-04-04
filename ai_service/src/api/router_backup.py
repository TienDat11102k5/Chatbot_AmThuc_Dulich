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
import uuid    # Generate temp session_id when None
from fastapi import APIRouter, HTTPException, Request
from src.api.schemas import ChatRequest, ChatResponse, RecommendationItem
from src.core.ner import extract_entities, MERGED_PROVINCES
from src.core.location_handler import get_location_handler
from src.core.oos_logger import log_rejected_query  # OOS logging module
from src.core.context_manager import ContextManager, is_follow_up_question, detect_topic_change  # Context management
from src.core.clarification import should_ask_clarification, generate_clarification_message  # Clarification
from src.core.response_generator import (  # Response Generator — Phase 1 Optimization
    generate_greeting_response, format_recommendations, generate_no_results_response,
    generate_pagination_message,
    OUT_OF_SCOPE_RESPONSES,
)
from src.core.security import is_gibberish, is_code_injection  # Phase 2 Refactor

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
# INTENT_RESPONSES & OUT_OF_SCOPE_RESPONSES → Đã chuyển sang response_generator.py  
# Import ở đầu file: from src.core.response_generator import ...
# ==============================================================================


# Security functions đã được chuyển sang src/core/security.py

# ==============================================================================
# HÀM DETECT MULTI-INTENT (Phase 1 Fix)
# ==============================================================================
def detect_multi_intent(entities: dict, user_message: str) -> list:
    """Phát hiện nếu user hỏi nhiều intent cùng lúc"""
    intents = []
    
    # Rule 1: Có food entities
    if entities.get("food"):
        intents.append("tim_mon_an")
    
    # Rule 2: Có place_type_entities
    accommodation_types = ["khách sạn", "hotel", "homestay", "resort", "nhà nghỉ", "villa", "khu nghỉ dưỡng"]
    if any(pt in accommodation_types for pt in entities.get("place_type", [])):
        intents.append("tim_dia_diem")
    
    return intents if intents else ["tim_mon_an"]

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
        if is_gibberish(user_message):
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
        # BƯỚC 0.5: CODE/SCRIPT INJECTION DETECTION
        # Chặn input là code lập trình (JS, HTML, SQL, Python...)
        # ==================================================================
        if is_code_injection(user_message):
            log_rejected_query(
                user_message=user_message,
                predicted_intent="code_injection",
                confidence=0.0,
                rejection_reason="code_script_detected",
            )
            code_reject_msg = (
                "🚫 Xin lỗi, mình là trợ lý **ẩm thực & du lịch**, "
                "không phải trình biên dịch code nha! 😄\n\n"
                "💡 Thử hỏi mình: *\"Quán phở ngon ở Hà Nội\"* "
                "hoặc *\"Địa điểm du lịch Đà Nẵng\"*"
            )
            response_data = {
                "intent": "out_of_scope",
                "confidence": 0.0,
                "message": code_reject_msg,
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
        
        # Guard Clause: tạo UUID tạm nếu session_id không có
        if not session_id:
            session_id = str(uuid.uuid4())
            print(f"[Chat] ⚠️ No session_id provided, generated temp: {session_id[:8]}...")
        
        saved_context = context_manager.get_context(session_id)
        is_follow_up = is_follow_up_question(user_message)
        
        print(f"[Chat] Session: {session_id[:8]}..., Follow-up: {is_follow_up}")
        
        # ==================================================================
        # BƯỚC 1.5: KIỂM TRA SEMANTIC CACHE (skip nếu là follow-up)
        # ==================================================================
        # Follow-up questions KHÔNG được cache vì phụ thuộc vào context
        if not is_follow_up:
            cached_result = cache.get(user_message)
            if cached_result is not None:
                # [Fix]: Tuy trả kết quả từ Cache nhưng VẪN PHẢI LƯU CONTEXT cho session hiện tại,
                # để các câu hỏi follow-up (như "có", "liệt kê ra") có thể hoạt động.
                c_intent = cached_result.get("intent")
                c_recs = cached_result.get("recommendations", [])
                c_entities = cached_result.get("entities", {})
                c_suggestion = cached_result.get("last_suggestion", "none")
                
                if c_intent in ("tim_mon_an", "tim_dia_diem") and c_recs:
                    print(f"[Cache] 🟢 HIT - Saving context for session {session_id[:8]} from cached result")
                    context_manager.save_context(
                        session_id=session_id,
                        entities=c_entities,
                        intent=c_intent,
                        recommendations=c_recs,
                        last_suggestion=c_suggestion
                    )
                else:
                    print(f"[Cache] 🟢 HIT - No context saved (intent={c_intent})")
                return ChatResponse(**cached_result)

        # ==================================================================
        # BƯỚC 2: PHÂN LOẠI Ý ĐỊNH (Intent Classification)
        # ==================================================================
        # FIX Lỗi #2: Thêm try-except
        try:
            intent_result = classifier.predict_intent(user_message)
        except Exception as e:
            print(f"[ERROR] Intent classification failed: {e}")
            intent_result = {
                "intent": "out_of_scope",
                "confidence": 0.0,
                "cleaned_text": user_message,
                "entities": None
            }
            
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
            
            # Nếu bot vừa suggest 1 thứ gì đó (khách sạn, quán cafe) và user đồng ý (ví dụ: "có", "liệt kê ra")
            last_suggestion = saved_context.get("last_suggestion", "none")
            if last_suggestion != "none":
                if last_suggestion == "hotel":
                    intent = "tim_dia_diem"
                elif last_suggestion == "cafe":
                    intent = "tim_mon_an"
                elif last_suggestion == "food":
                    intent = "tim_mon_an"
                elif last_suggestion == "place":
                    intent = "tim_dia_diem"
                print(f"[Chat] Follow-up suggestion detected: {last_suggestion}, hijacked intent to: {intent}")

        # ==================================================================
        # BƯỚC 2.8: NER-BASED INTENT RESCUE (Cứu intent khi SVM không tự tin)
        # ==================================================================
        # Nếu confidence thấp (SVM không chắc) NHƯNG NER phát hiện food/location entities
        # → Override intent sang đúng loại thay vì để OOS guard chặn.
        # Ví dụ: "liệt kê 5 quán bánh mì tại hà nội" → SVM conf=-0.058 nhưng NER thấy "bánh mì" + "hà nội"
        if confidence < CONFIDENCE_THRESHOLD and intent not in CONVERSATION_INTENTS:
            pre_ner = extract_entities(user_message)
            has_food = bool(pre_ner.get("food"))
            has_location = bool(pre_ner.get("location"))
            has_place_type = bool(pre_ner.get("place_type"))
            
            if has_food or has_location or has_place_type:
                # Quyết định intent dựa trên loại entity phát hiện được
                if has_food:
                    old_intent = intent
                    intent = "tim_mon_an"
                    confidence = 0.7  # Override confidence để pass OOS guard
                    print(f"[NER-Rescue] 🔄 '{old_intent}' → 'tim_mon_an' (found food: {pre_ner['food']})")
                elif has_place_type:
                    old_intent = intent
                    intent = "tim_dia_diem"
                    confidence = 0.7
                    print(f"[NER-Rescue] 🔄 '{old_intent}' → 'tim_dia_diem' (found place_type: {pre_ner['place_type']})")
                elif has_location and not has_food:
                    old_intent = intent
                    intent = "tim_dia_diem"
                    confidence = 0.7
                    print(f"[NER-Rescue] 🔄 '{old_intent}' → 'tim_dia_diem' (found location: {pre_ner['location']})")

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
        total_found = 0
        remaining = 0
        # [Phase 1] Dùng Response Generator thay vì INTENT_RESPONSES dict
        response_message = generate_greeting_response(intent)

        # Track merged province notification
        merged_province_note = None

        if intent in ("tim_mon_an", "tim_dia_diem"):
            # FIX Lỗi #5: Sử dụng entities từ classifier nếu có
            entities = intent_result.get("entities")
            if not entities:
                # FIX Lỗi #2: Try-except cho NER
                try:
                    entities = extract_entities(user_message)
                except Exception as e:
                    print(f"[ERROR] NER extraction failed: {e}")
                    entities = {"food": [], "location": [], "place_type": []}
            
            # ==================================================================
            # MERGED PROVINCE DETECTION: Kiểm tra tỉnh cũ đã sáp nhập
            # ==================================================================
            if entities.get("location"):
                for loc in list(entities["location"]):
                    loc_lower = loc.lower().strip()
                    if loc_lower in MERGED_PROVINCES:
                        info = MERGED_PROVINCES[loc_lower]
                        merged_province_note = f"📌 *{info['note']}*\n"
                        print(f"[Chat] Merged province detected: {loc_lower} → {info['current']}")
            
            # ==================================================================
            # CONTEXT AWARENESS: Topic Change Detection + Merge
            # ==================================================================
            if is_follow_up and saved_context:
                # Check topic change TRƯỚC khi merge
                if detect_topic_change(entities, saved_context):
                    print("[Chat] 🔄 Topic change detected! Clearing old context")
                    context_manager.clear_context(session_id)
                    saved_context = {}
                    is_follow_up = False  # Reset — không merge context cũ
                else:
                    print("[Chat] Detected follow-up question, merging with saved context")
                    # FIX Lỗi #4: Truyền current_intent để context lọc entity rác
                    entities = context_manager.merge_entities(entities, saved_context, current_intent=intent)
                    
                    # Nếu user đồng ý với suggestion trước đó, inject entity tương ứng để search
                    last_suggestion = saved_context.get("last_suggestion", "none")
                    if last_suggestion != "none":
                        print(f"[Chat] Injecting entities for suggestion: {last_suggestion}")
                        if last_suggestion == "hotel":
                            entities["place_type"] = ["khách sạn"]
                            entities["food"] = [] # Clear food context
                        elif last_suggestion == "cafe":
                            entities["food"] = ["cà phê"]
                            entities["place_type"] = []
                        elif last_suggestion == "food":
                            entities["place_type"] = []
                        elif last_suggestion == "place":
                            entities["food"] = []
                            entities["place_type"] = []
            
            # Fallback: Nếu không có location trong câu hiện tại và không phải follow-up,
            # thử extract location từ chat history (câu trước).
            # [Fix Phase 5]: CHỈ lấy lịch sử của USER, BỎ QUA của ASSISTANT để tránh bị loạn Context.
            if not entities.get("location") and request.chat_history and not is_follow_up:
                print("[Context] No location in current message, checking user chat history...")
                # Duyệt ngược chat history để tìm location gần nhất do user hỏi
                for hist_msg in reversed(request.chat_history):
                    if isinstance(hist_msg, dict) and hist_msg.get("role") == "user":
                        hist_text = hist_msg.get("content", "")
                        hist_entities = extract_entities(hist_text)
                        if hist_entities.get("location"):
                            entities["location"] = hist_entities["location"]
                            print(f"[Context] Found location from user history: {entities['location']}")
                            break
            
            # ==================================================================
            # CLARIFICATION: Hỏi lại nếu thiếu location (Phase 2)
            # ==================================================================
            # Chỉ hỏi lại khi: (1) không phải follow-up, (2) có food nhưng không có location
            if not is_follow_up and should_ask_clarification(entities, intent):
                clarification_msg = generate_clarification_message(entities)
                print(f"[Chat] Clarification needed: missing location")
                return ChatResponse(
                    intent=intent,
                    confidence=confidence,
                    message=clarification_msg,
                    recommendations=[],
                    entities=entities,
                    ask_location=True,
                )
            
            # ==================================================================
            # MULTI-INTENT & RECOMMENDER (Phase 1 Fix)
            # ==================================================================
            # FIX Lỗi #1 Multi intent
            check_multi = detect_multi_intent(entities, user_message)
            intents = check_multi if len(check_multi) > 1 and ("và" in user_message.lower() or "," in user_message) else [intent]
            
            response_message = generate_greeting_response(
                intent=intent if len(intents) == 1 else "tim_mon_an", 
                entities=entities,
                is_follow_up=(is_follow_up and bool(saved_context)),
                location_not_found=False, 
                searched_location=None,
            )
            
            if merged_province_note:
                response_message = merged_province_note + response_message

            total_found = 0
            shown_count = 0
            previous_rec_ids = context_manager.get_previous_recommendations(session_id)
            previous_count = len(previous_rec_ids) if previous_rec_ids else 0
            has_results = False
            suggestion_type = "none"
            recommendations_list = []
            
            for sub_intent in intents:
                # FIX Lỗi #2: Try-except cho AI component
                try:
                    recommender_result = recommender.recommend(entities, intent=sub_intent, top_k=10, user_message=user_message)
                    raw_results = recommender_result["results"]
                    location_not_found = recommender_result.get("location_not_found", False)
                    searched_location = recommender_result.get("searched_location", None)
                    
                    if location_not_found and len(intents) == 1:
                        # Regenerate greeting if 1 intent and location missing warning
                        response_message = merged_province_note + generate_greeting_response(sub_intent, entities, is_follow_up, True, searched_location) if merged_province_note else generate_greeting_response(sub_intent, entities, is_follow_up, True, searched_location)
                    
                    # Filter
                    filtered_results = [r for r in raw_results if r.get("id") not in previous_rec_ids] if previous_rec_ids else raw_results
                    final_results = filtered_results[:3] if len(filtered_results) >= 3 else filtered_results
                    
                    if final_results:
                        has_results = True
                        recs = [RecommendationItem(**item) for item in final_results]
                        recommendations_list.extend(recs)
                        
                        if len(intents) > 1:
                            if sub_intent == "tim_mon_an":
                                response_message += "\n\n🍽️ **Gợi ý Quán ăn:**"
                            elif sub_intent == "tim_dia_diem":
                                response_message += "\n\n🏨 **Gợi ý Khách sạn/Nơi ở:**"
                                
                        items_text, sub_sugg = format_recommendations(recs, sub_intent, is_follow_up=(is_follow_up and bool(saved_context)))
                        response_message += items_text
                        suggestion_type = sub_sugg # keep last one
                        
                        total_found += len(recommender_result["results"])
                        shown_count += len(final_results)
                        
                except Exception as e:
                    print(f"[ERROR] Recommender or formatting failed for {sub_intent}: {e}")
                    
            if not has_results:
                response_message = generate_no_results_response(is_follow_up=is_follow_up, had_previous=bool(previous_rec_ids))
            else:
                remaining = max(0, total_found - previous_count - shown_count)
                response_message += generate_pagination_message(remaining)
            
            recommendations = recommendations_list

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
                recommendations=[r.model_dump() for r in recommendations],
                last_suggestion=suggestion_type if 'suggestion_type' in locals() else "none"
            )
        
        # ==================================================================
        # BƯỚC 6: ĐÓNG GÓI RESPONSE + LƯU VÀO CACHE (skip cache cho follow-up)
        # ==================================================================
        ask_location = False
        if intent == "hoi_vi_tri":
            ask_location = location_result.get("ask_location", False)

        # Tính pagination cho non-search intents
        _total = total_found if intent in ("tim_mon_an", "tim_dia_diem") else 0
        _remaining = remaining if intent in ("tim_mon_an", "tim_dia_diem") else 0
        
        response_data = {
            "intent": intent,
            "confidence": confidence,
            "message": response_message,
            "recommendations": [r.model_dump() for r in recommendations],
            "entities": entities,
            "ask_location": ask_location,
            "has_more_results": _remaining > 0,
            "total_results": _total,
            "remaining_results": _remaining,
            "last_suggestion": suggestion_type if 'suggestion_type' in locals() else "none"
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
