"""
File: src/api/router.py
Mục đích: Định nghĩa API Endpoint chính cho AI Service.
          Đây là "Cánh cửa duy nhất" mà Backend (Spring Boot) gọi vào để nhận kết quả AI.
          
          Endpoint: POST /api/v1/ai/chat
"""

import re
import random
import os
import uuid
from fastapi import APIRouter, HTTPException, Request
from src.api.schemas import ChatRequest, ChatResponse, RecommendationItem
from src.core.ner import extract_entities, MERGED_PROVINCES
from src.core.location_handler import get_location_handler
from src.core.oos_logger import log_rejected_query
from src.core.context_manager import ContextManager, is_follow_up_question, detect_topic_change
from src.core.clarification import should_ask_clarification, generate_clarification_message
from src.core.response_generator import (
    generate_greeting_response, format_recommendations, generate_no_results_response,
    generate_pagination_message,
    format_multi_section_response,
    OUT_OF_SCOPE_RESPONSES,
)
from src.core.multi_intent_analyzer import get_multi_intent_analyzer
from src.core.security import is_gibberish, is_code_injection
from src.core.config import settings
from src.core.logger import logger

# ==============================================================================
# KHỞI TẠO ROUTER & CONTEXT MANAGER
# ==============================================================================
router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Chat"]
)

context_manager = ContextManager(redis_host=settings.REDIS_HOST, redis_port=settings.REDIS_PORT)

# ==============================================================================
# HELPER FUNCTIONS (Phase 2 Refactoring)
# ==============================================================================

def detect_multi_intent(entities: dict, user_message: str) -> list:
    """[DEPRECATED] Hàm cũ — giữ lại để backward compatible với code đang dùng.
    Logic mới đã được chuyển sang MultiIntentAnalyzer.
    """
    intents = []
    if entities.get("food"):
        intents.append("tim_mon_an")
    
    accommodation_types = ["khách sạn", "hotel", "homestay", "resort", "nhà nghỉ", "villa", "khu nghỉ dưỡng"]
    if any(pt in accommodation_types for pt in entities.get("place_type", [])):
        intents.append("tim_dia_diem")
    
    return intents if intents else ["tim_mon_an"]


def _process_multi_intent(
    user_message: str,
    entities: dict,
    confidence: float,
    intent: str,
    recommender,
    session_id: str,
) -> ChatResponse | None:
    """
    Xử lý câu hỏi multi-intent: phân tích, tìm kiếm từng sub-intent, gộp kết quả.

    Args:
        user_message: Câu hỏi gốc của user
        entities: Entities đã extract (dùng để lấy location)
        confidence: Độ tin cậy intent (từ SVM)
        intent: Primary intent (từ SVM)
        recommender: Recommender instance
        session_id: Session ID hiện tại

    Returns:
        ChatResponse nếu là multi-intent, None nếu là single-intent (để pipeline cũ xử lý)
    """
    analyzer = get_multi_intent_analyzer()
    sub_intents = analyzer.analyze(user_message, entities)

    # Không phải multi-intent → trả None để pipeline cũ xử lý
    if not sub_intents:
        return None

    logger.info(f"[MULTI-INTENT] Phát hiện {len(sub_intents)} sub-intent: "
                f"{[s.category for s in sub_intents]}")

    # Collect location tổng (từ sub-intent đầu tiên có location)
    global_location = []
    for sub in sub_intents:
        if sub.location:
            global_location = sub.location
            break

    all_section_results = []       # Dùng cho sub_intent_results field
    all_recommendations = []       # Dùng cho recommendations field (gộp hết)

    for sub in sub_intents:
        try:
            # Build entities riêng cho sub-intent này
            sub_entities = {
                "food": sub.keywords if sub.category in ("tim_mon_an", "tim_quan_nuoc") else [],
                "location": sub.location or global_location,
                "place_type": sub.keywords if sub.category in ("tim_luu_tru", "tim_quan_nuoc") else [],
                "raw_query": " ".join(sub.keywords + (sub.location or global_location)),
            }

            # Ánh xạ filter keyword cho lưu trú và quán nước
            if sub.filter_type == "accommodation" and not sub_entities["place_type"]:
                sub_entities["place_type"] = ["khách sạn"]
            elif sub.filter_type == "drink" and not sub_entities["food"]:
                sub_entities["food"] = ["cà phê"]

            # Gọi recommender với top_k = số lượng user yêu cầu
            recommender_result = recommender.recommend(
                sub_entities,
                intent=sub.recommender_intent,
                top_k=sub.quantity,
                user_message=sub.original_clause or user_message,
            )

            raw_results = recommender_result.get("results", [])
            recs = [RecommendationItem(**item) for item in raw_results[:sub.quantity]]
            all_recommendations.extend(recs)

            # Thêm vào section results
            all_section_results.append({
                "category": sub.category,
                "category_label": sub.category_label,
                "category_emoji": sub.category_emoji,
                "quantity_requested": sub.quantity,
                "recommendations": [r.model_dump() for r in recs],
            })

            logger.info(
                f"[MULTI-INTENT] sub={sub.category} qty={sub.quantity} "
                f"found={len(recs)} loc={sub.location}"
            )

        except Exception as e:
            logger.error(f"[MULTI-INTENT] Lỗi khi xử lý sub_intent={sub.category}: {e}")
            # Vẫn thêm section rỗng để giữ cấu trúc
            all_section_results.append({
                "category": sub.category,
                "category_label": sub.category_label,
                "category_emoji": sub.category_emoji,
                "quantity_requested": sub.quantity,
                "recommendations": [],
            })

    # Format message tổng hợp
    response_message = format_multi_section_response(
        section_results=all_section_results,
        global_location=global_location,
    )

    # Lưu context đầy đủ (FIX Task 1.5 — trước đây food/place_type bị mất)
    if all_recommendations:
        # Gộp tất cả keywords food + place_type từ các sub-intent
        all_food_kw = []
        all_place_kw = []
        for sub in sub_intents:
            if sub.category in ("tim_mon_an", "tim_quan_nuoc"):
                all_food_kw.extend(sub.keywords or [])
            elif sub.category in ("tim_luu_tru",):
                all_place_kw.extend(sub.keywords or ["khách sạn"])
            elif sub.category == "tim_dia_diem":
                all_place_kw.extend(sub.keywords or [])

        merged_entities = {
            "location": global_location,
            "food": list(set(all_food_kw)),         # Deduplicate
            "place_type": list(set(all_place_kw)),  # Deduplicate
        }

        # Intent gốc = recommender_intent của sub-intent đầu tiên (FIX Task 1.1)
        # Dùng intent hợp lệ (tim_mon_an/tim_dia_diem) thay vì "multi_intent"
        primary_intent = sub_intents[0].recommender_intent if sub_intents else "tim_mon_an"

        context_manager.save_context(
            session_id=session_id,
            entities=merged_entities,
            intent=primary_intent,
            recommendations=[r.model_dump() for r in all_recommendations],
            last_suggestion="none",
            original_query=user_message,   # MỚI: Câu hỏi gốc
        )

    return ChatResponse(
        intent="multi_intent",
        confidence=confidence,
        message=response_message,
        recommendations=[r.model_dump() for r in all_recommendations],
        entities=entities,
        ask_location=False,
        has_more_results=False,
        total_results=len(all_recommendations),
        remaining_results=0,
        last_suggestion="none",
        is_multi_intent=True,
        sub_intent_results=all_section_results,
    )

def _validate_input(user_message: str) -> dict:
    """Validate gibberish and code injection."""
    if is_gibberish(user_message):
        log_rejected_query(
            user_message=user_message,
            predicted_intent="gibberish",
            confidence=0.0,
            rejection_reason="gibberish_detected",
        )
        return {
            "intent": "out_of_scope",
            "confidence": 0.0,
            "message": random.choice(OUT_OF_SCOPE_RESPONSES),
            "recommendations": [],
            "entities": None,
            "ask_location": False,
        }
        
    if is_code_injection(user_message):
        log_rejected_query(
            user_message=user_message,
            predicted_intent="code_injection",
            confidence=0.0,
            rejection_reason="code_script_detected",
        )
        return {
            "intent": "out_of_scope",
            "confidence": 0.0,
            "message": (
                "🚫 Xin lỗi, mình là trợ lý **ẩm thực & du lịch**, "
                "không phải trình biên dịch code nha! 😄\n\n"
                "💡 Thử hỏi mình: *\"Quán phở ngon ở Hà Nội\"* "
                "hoặc *\"Địa điểm du lịch Đà Nẵng\"*"
            ),
            "recommendations": [],
            "entities": None,
            "ask_location": False,
        }
    return None

def _classify_intent(user_message: str, is_follow_up: bool, saved_context: dict, classifier) -> tuple:
    """Predict and rescue intent."""
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
    
    # Follow-up intent override
    if is_follow_up and saved_context and saved_context.get("last_intent"):
        last_intent = saved_context["last_intent"]

        # FIX Task 1.2: Map "multi_intent" → intent hợp lệ cho recommender
        if last_intent == "multi_intent":
            # Đây là follow-up sau câu multi-intent — dùng entities cũ để quyết định intent
            saved_entities = saved_context.get("entities", {})
            last_suggestion = saved_context.get("last_suggestion", "none")
            if last_suggestion in ("hotel", "place") or saved_entities.get("place_type"):
                intent = "tim_dia_diem"
            else:
                intent = "tim_mon_an"  # Default: tìm ẩm thực
            confidence = 1.0
            logger.info(f"[Context] Multi-intent follow-up → mapped intent = {intent}")
        else:
            intent = last_intent
            confidence = 1.0
            last_suggestion = saved_context.get("last_suggestion", "none")
            if last_suggestion != "none":
                if last_suggestion in ("hotel", "place"):
                    intent = "tim_dia_diem"
                elif last_suggestion in ("cafe", "food"):
                    intent = "tim_mon_an"
                
    # NER Rescue
    if confidence < settings.CONFIDENCE_THRESHOLD and intent not in settings.CONVERSATION_INTENTS:
        pre_ner = extract_entities(user_message)
        if pre_ner.get("food"):
            intent = "tim_mon_an"
            confidence = 0.7
        elif pre_ner.get("place_type"):
            intent = "tim_dia_diem"
            confidence = 0.7
        elif pre_ner.get("location"):
            intent = "tim_dia_diem"
            confidence = 0.7
            
    is_oos = False
    rejection_reason = ""
    if intent == "out_of_scope":
        is_oos = True
        rejection_reason = "intent_oos"
    elif confidence < settings.CONFIDENCE_THRESHOLD and intent not in settings.CONVERSATION_INTENTS:
        is_oos = True
        rejection_reason = "low_confidence"
        
    if is_oos:
        log_rejected_query(user_message, intent, confidence, rejection_reason)
        return "out_of_scope", confidence, intent_result, {
            "intent": "out_of_scope",
            "confidence": confidence,
            "message": random.choice(OUT_OF_SCOPE_RESPONSES),
            "recommendations": [],
            "entities": None,
            "ask_location": False,
        }
        
    return intent, confidence, intent_result, None

def _extract_and_merge(user_message: str, intent: str, intent_result: dict, request: ChatRequest, is_follow_up: bool, saved_context: dict, session_id: str) -> tuple:
    """Extract entities, identify merged provinces, merge with setup if needed."""
    entities = intent_result.get("entities")
    if not entities:
        try:
            entities = extract_entities(user_message)
        except Exception as e:
            logger.error(f"NER extraction failed: {e}")
            entities = {"food": [], "location": [], "place_type": []}
            
    merged_province_note = None
    if entities.get("location"):
        for loc in list(entities["location"]):
            loc_lower = loc.lower().strip()
            if loc_lower in MERGED_PROVINCES:
                info = MERGED_PROVINCES[loc_lower]
                merged_province_note = f"📌 *{info['note']}*\n"
                
    # Context change detection and merging
    if is_follow_up and saved_context:
        if detect_topic_change(entities, saved_context):
            context_manager.clear_context(session_id)
            saved_context = {}
            is_follow_up = False
        else:
            entities = context_manager.merge_entities(entities, saved_context, current_intent=intent)
            last_suggestion = saved_context.get("last_suggestion", "none")
            if last_suggestion != "none":
                if last_suggestion == "hotel":
                    entities["place_type"] = ["khách sạn"]
                    entities["food"] = []
                elif last_suggestion == "cafe":
                    entities["food"] = ["cà phê"]
                    entities["place_type"] = []
                elif last_suggestion == "food":
                    entities["place_type"] = []
                elif last_suggestion == "place":
                    entities["food"] = []
                    entities["place_type"] = []

    # Historical lookup
    if not entities.get("location") and request.chat_history and not is_follow_up:
        for hist_msg in reversed(request.chat_history):
            if isinstance(hist_msg, dict) and hist_msg.get("role") == "user":
                hist_text = hist_msg.get("content", "")
                hist_entities = extract_entities(hist_text)
                if hist_entities.get("location"):
                    entities["location"] = hist_entities["location"]
                    break
                    
    return entities, is_follow_up, saved_context, merged_province_note

def _search_recommendations(entities: dict, user_message: str, intent: str, intents: list, is_follow_up: bool, saved_context: dict, merged_province_note: str, recommender, session_id: str) -> tuple:
    """Handle recommender queries."""
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
        try:
            recommender_result = recommender.recommend(entities, intent=sub_intent, top_k=10, user_message=user_message)
            raw_results = recommender_result["results"]
            location_not_found = recommender_result.get("location_not_found", False)
            searched_location = recommender_result.get("searched_location", None)
            
            if location_not_found and len(intents) == 1:
                base_msg = generate_greeting_response(sub_intent, entities, is_follow_up, True, searched_location)
                response_message = (merged_province_note + base_msg) if merged_province_note else base_msg
            
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
                suggestion_type = sub_sugg
                
                total_found += len(recommender_result["results"])
                shown_count += len(final_results)
                
        except Exception as e:
            logger.error(f"Recommender or formatting failed for {sub_intent}: {e}")
            
    if not has_results:
        response_message = generate_no_results_response(is_follow_up=is_follow_up, had_previous=bool(previous_rec_ids))
        remaining = 0
    else:
        remaining = max(0, total_found - previous_count - shown_count)
        response_message += generate_pagination_message(remaining)

    return recommendations_list, response_message, total_found, remaining, suggestion_type

def _build_response(intent: str, confidence: float, response_message: str, recommendations: list, entities: dict, ask_location: bool, remaining: int, total_found: int, suggestion_type: str, user_message: str, session_id: str, is_follow_up: bool, cache) -> ChatResponse:
    """Build the final ChatResponse, saving context and caching as appropriate."""
    if intent in ("tim_mon_an", "tim_dia_diem") and recommendations:
        context_manager.save_context(
            session_id=session_id,
            entities=entities,
            intent=intent,
            recommendations=[r.model_dump() for r in recommendations],
            last_suggestion=suggestion_type,
            original_query=user_message,   # FIX Task 1.4: Lưu câu hỏi gốc
        )
        
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
        "last_suggestion": suggestion_type
    }

    if not is_follow_up:
        cache.set(user_message, response_data)
    
    return ChatResponse(**response_data)


# ==============================================================================
# MAIN CHAT ENDPOINT (Orchestrator)
# ==============================================================================

import time

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, raw_request: Request):
    start_time = time.time()
    from src.core.metrics import metrics_store
    intent = "unknown"
    has_error = False
    
    try:
        user_message = request.message
        classifier = raw_request.app.state.classifier
        recommender = raw_request.app.state.recommender
        cache = raw_request.app.state.cache

        # 1. Validate Input (Security Guard)
        invalid_resp = _validate_input(user_message)
        if invalid_resp:
            cache.set(user_message, invalid_resp)
            return ChatResponse(**invalid_resp)

        # 2. Setup Session & Context
        session_id = request.session_id or str(uuid.uuid4())
        saved_context = context_manager.get_context(session_id)
        is_follow_up = is_follow_up_question(user_message)

        # 3. Cache Check (Bypass for follow-ups)
        if not is_follow_up:
            cached_result = cache.get(user_message)
            if cached_result:
                metrics_store.record_cache(hit=True)
                intent = cached_result.get("intent", "unknown")
                if intent in ("tim_mon_an", "tim_dia_diem") and cached_result.get("recommendations"):
                    context_manager.save_context(
                        session_id=session_id,
                        entities=cached_result.get("entities", {}),
                        intent=intent,
                        recommendations=cached_result.get("recommendations", []),
                        last_suggestion=cached_result.get("last_suggestion", "none")
                    )
                response = ChatResponse(**cached_result)
                metrics_store.record_request(intent=intent, response_time=time.time() - start_time, has_error=False)
                return response
            else:
                metrics_store.record_cache(hit=False)

        # 4. Classify Intent
        intent, confidence, intent_result, oos_resp = _classify_intent(user_message, is_follow_up, saved_context, classifier)
        if oos_resp:
            cache.set(user_message, oos_resp)
            return ChatResponse(**oos_resp)

        # 5. Process Based on Intent
        recommendations = []
        entities = {}
        total_found = remaining = 0
        suggestion_type = "none"
        ask_location = False
        
        if intent in ("tim_mon_an", "tim_dia_diem"):
            # Extract & merge context
            entities, is_follow_up, saved_context, merged_province_note = _extract_and_merge(
                user_message, intent, intent_result, request, is_follow_up, saved_context, session_id
            )

            # ★ MULTI-INTENT CHECK (MỚI) — Kiểm tra trước khi clarification
            if not is_follow_up:
                multi_response = _process_multi_intent(
                    user_message=user_message,
                    entities=entities,
                    confidence=confidence,
                    intent=intent,
                    recommender=recommender,
                    session_id=session_id,
                )
                if multi_response is not None:
                    # Đây là câu hỏi multi-intent → trả kết quả luôn
                    metrics_store.record_request(
                        intent="multi_intent",
                        response_time=time.time() - start_time,
                        has_error=False
                    )
                    return multi_response

            # Clarification check (single intent path)
            if not is_follow_up and should_ask_clarification(entities, intent):
                return ChatResponse(
                    intent=intent, confidence=confidence,
                    message=generate_clarification_message(entities),
                    recommendations=[], entities=entities, ask_location=True
                )
                
            # Search & recommendations (single intent — pipeline cũ)
            intents = detect_multi_intent(entities, user_message) if len(detect_multi_intent(entities, user_message)) > 1 and ("và" in user_message.lower() or "," in user_message) else [intent]
            
            recommendations, response_message, total_found, remaining, suggestion_type = _search_recommendations(
                entities, user_message, intent, intents, is_follow_up, saved_context, merged_province_note, recommender, session_id
            )
            
        elif intent == "hoi_vi_tri":
            entities = extract_entities(user_message)
            location_result = get_location_handler().handle_nearby_query(entities, request.user_location)
            response_message = location_result["message"]
            recommendations = [RecommendationItem(**item) for item in location_result.get("recommendations", [])]
            ask_location = location_result.get("ask_location", False)
        else:
            response_message = generate_greeting_response(intent)

        # 6. Build final response
        response = _build_response(
            intent, confidence, response_message, recommendations, entities, 
            ask_location, remaining, total_found, suggestion_type, 
            user_message, session_id, is_follow_up, cache
        )
        metrics_store.record_request(intent=intent, response_time=time.time() - start_time, has_error=False)
        return response
        
    except Exception as e:
        has_error = True
        logger.error(f"❌ Unhandled error in chat_endpoint: {e}", exc_info=True)
        response = ChatResponse(
            intent="unknown", confidence=0.0,
            message="Xin lỗi, hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau nhé!",
            recommendations=[], entities=None, ask_location=False
        )
        metrics_store.record_request(intent=intent, response_time=time.time() - start_time, has_error=True)
        return response
