"""
File: src/core/context_manager.py
Mục đích: Quản lý ngữ cảnh hội thoại (Context Management) để AI có thể nhớ và hiểu câu hỏi follow-up.

Chức năng chính:
1. Lưu context của mỗi session vào Redis (entities, recommendations đã gợi ý)
2. Load context khi user hỏi câu tiếp theo
3. Merge context cũ với entities mới
4. Track các gợi ý đã đưa ra để tránh lặp lại
"""

import json
import redis
from typing import Dict, List, Optional


class ContextManager:
    """
    Quản lý ngữ cảnh hội thoại cho mỗi session.
    
    Context bao gồm:
    - entities: {food: [], location: [], place_type: []}
    - previous_recommendations: [id1, id2, id3, ...] - Danh sách ID đã gợi ý
    - last_intent: "tim_mon_an" hoặc "tim_dia_diem"
    - conversation_count: Số lượng câu hỏi trong session
    """
    
    def __init__(self, redis_host: str = "localhost", redis_port: int = 6379):
        """
        Khởi tạo ContextManager với Redis connection.
        
        Args:
            redis_host: Redis server host (default: localhost, trong Docker: redis)
            redis_port: Redis server port (default: 6379)
        """
        try:
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=0,
                decode_responses=True,  # Tự động decode bytes → string
                socket_connect_timeout=2,
                socket_timeout=2
            )
            # Test connection
            self.redis_client.ping()
            print(f"[ContextManager] ✅ Connected to Redis at {redis_host}:{redis_port}")
        except Exception as e:
            print(f"[ContextManager] ⚠️ Cannot connect to Redis: {e}")
            print("[ContextManager] Context management will be disabled")
            self.redis_client = None
    
    def save_context(self, session_id: str, entities: Dict, intent: str, 
                    recommendations: List[Dict], last_suggestion: str = None) -> bool:
        """
        Lưu context của session vào Redis.
        
        Args:
            session_id: ID của session (UUID)
            entities: Dict chứa food, location, place_type
            intent: Intent của câu hỏi (tim_mon_an, tim_dia_diem)
            recommendations: List các gợi ý đã trả về
            last_suggestion: Loại gợi ý follow-up vừa đưa ra (hotel, food, none)
            
        Returns:
            bool: True nếu lưu thành công, False nếu thất bại
        """
        if not self.redis_client:
            return False
        
        try:
            # Extract IDs từ recommendations để track
            rec_ids = [rec.get("id") for rec in recommendations if rec.get("id")]
            
            # Load context cũ để merge với previous_recommendations
            old_context = self.get_context(session_id)
            old_rec_ids = old_context.get("previous_recommendations", [])
            
            # Merge IDs (không trùng lặp)
            all_rec_ids = list(set(old_rec_ids + rec_ids))
            
            context = {
                "entities": entities,
                "last_intent": intent,
                "previous_recommendations": all_rec_ids,
                "last_suggestion": last_suggestion,
                "conversation_count": old_context.get("conversation_count", 0) + 1
            }
            
            key = f"context:{session_id}"
            # TTL = 1 hour (3600 seconds)
            self.redis_client.setex(key, 3600, json.dumps(context))
            
            print(f"[ContextManager] Saved context for session {session_id[:8]}... "
                  f"(entities: {entities}, intent: {intent}, "
                  f"total_recommendations: {len(all_rec_ids)})")
            return True
            
        except Exception as e:
            print(f"[ContextManager] Error saving context: {e}")
            return False
    
    def get_context(self, session_id: str) -> Dict:
        """
        Lấy context của session từ Redis.
        
        Args:
            session_id: ID của session
            
        Returns:
            Dict: Context data hoặc empty dict nếu không tìm thấy
        """
        if not self.redis_client:
            return {}
        
        try:
            key = f"context:{session_id}"
            data = self.redis_client.get(key)
            
            if data:
                context = json.loads(data)
                print(f"[ContextManager] Loaded context for session {session_id[:8]}... "
                      f"(conversation #{context.get('conversation_count', 0)})")
                return context
            else:
                print(f"[ContextManager] No context found for session {session_id[:8]}...")
                return {}
                
        except Exception as e:
            print(f"[ContextManager] Error loading context: {e}")
            return {}
    
    def merge_entities(self, current_entities: Dict, saved_context: Dict) -> Dict:
        """
        Merge entities hiện tại với context đã lưu.
        
        Quy tắc merge:
        1. Nếu current có entity → dùng current (ưu tiên mới)
        2. Nếu current không có nhưng saved có → dùng saved (fallback)
        3. Đặc biệt với location: nếu current không có location → dùng saved location
        
        Args:
            current_entities: Entities extract từ câu hỏi hiện tại
            saved_context: Context đã lưu từ Redis
            
        Returns:
            Dict: Merged entities
        """
        saved_entities = saved_context.get("entities", {})
        merged = {
            "food": current_entities.get("food", []),
            "location": current_entities.get("location", []),
            "place_type": current_entities.get("place_type", []),
            "raw_query": current_entities.get("raw_query", "")
        }
        
        # Fallback: Nếu current không có, dùng saved
        if not merged["food"] and saved_entities.get("food"):
            merged["food"] = saved_entities["food"]
            print(f"[ContextManager] Using saved food: {merged['food']}")
        
        if not merged["location"] and saved_entities.get("location"):
            merged["location"] = saved_entities["location"]
            print(f"[ContextManager] Using saved location: {merged['location']}")
        
        if not merged["place_type"] and saved_entities.get("place_type"):
            merged["place_type"] = saved_entities["place_type"]
            print(f"[ContextManager] Using saved place_type: {merged['place_type']}")
        
        # Update raw_query nếu đã merge entities
        if (merged["food"] != current_entities.get("food", []) or 
            merged["location"] != current_entities.get("location", [])):
            merged["raw_query"] = " ".join(merged["food"] + merged["location"])
        
        return merged
    
    def get_previous_recommendations(self, session_id: str) -> List[str]:
        """
        Lấy danh sách IDs của các gợi ý đã đưa ra trước đó.
        
        Args:
            session_id: ID của session
            
        Returns:
            List[str]: Danh sách IDs đã gợi ý
        """
        context = self.get_context(session_id)
        return context.get("previous_recommendations", [])
    
    def clear_context(self, session_id: str) -> bool:
        """
        Xóa context của session (khi user bắt đầu chủ đề mới).
        
        Args:
            session_id: ID của session
            
        Returns:
            bool: True nếu xóa thành công
        """
        if not self.redis_client:
            return False
        
        try:
            key = f"context:{session_id}"
            self.redis_client.delete(key)
            print(f"[ContextManager] Cleared context for session {session_id[:8]}...")
            return True
        except Exception as e:
            print(f"[ContextManager] Error clearing context: {e}")
            return False


def is_follow_up_question(message: str) -> bool:
    """
    Kiểm tra xem câu hỏi có phải là follow-up question không.
    
    Follow-up keywords: "còn", "thêm", "nữa", "khác", "tiếp", "và"
    
    Args:
        message: Tin nhắn của user
        
    Returns:
        bool: True nếu là follow-up question
    """
    message_lower = message.lower().strip()
    
    # Danh sách từ khóa follow-up
    follow_up_keywords = [
        # Core follow-up: rõ ràng là hỏi tiếp
        "còn", "con", "thêm", "them", "nữa", "nua",
        "khác", "khac", "tiếp", "tiep",
        # Phrases chính xác
        "còn không", "con khong", "còn gì", "con gi",
        "thế còn", "the con", "vậy còn", "vay con",
        "gợi ý thêm", "cho thêm", "xem thêm", "có gì nữa",
        "cho xem", "gợi ý khác", "quán khác", "chỗ khác",
        "món khác", "cái khác", "nơi khác",
        # Affirmative/Agreement keywords for follow-up suggestions
        "có", "ok", "được", "yes", "ừ", "uh", "dạ có",
        "liệt kê ra", "liệt kê đi", "gợi ý đi", "tìm đi", "xem thử", "lịch trình"
        # NOTE: Đã bỏ "hay", "và", "hoặc" — quá chung chung, gây false positive
        # VD: "Phở hay bún bò?" bị nhận nhầm là follow-up
    ]
    
    # Thêm khoảng trắng hai đầu để tìm chính xác cụm từ (tránh "khác" match "khách sạn")
    message_padded = f" {message_lower} "
    
    # Câu ngắn (≤ 5 từ) + có từ khóa follow-up → likely follow-up
    words = message_lower.split()
    if len(words) <= 5:
        return any(f" {keyword} " in message_padded for keyword in follow_up_keywords)
    
    # Câu dài hơn nhưng bắt đầu bằng từ khóa follow-up
    return any(message_lower.startswith(keyword + " ") for keyword in follow_up_keywords)


def detect_topic_change(current_entities: Dict, saved_context: Dict) -> bool:
    """
    Phát hiện user chuyển chủ đề hoàn toàn.
    
    Rule: Nếu câu hiện tại có food MỚI VÀ location MỚI (khác hẳn context cũ)
    → user đã đổi chủ đề → cần clear context cũ.
    
    Ví dụ:
        Saved: {food: ["cà phê"], location: ["đà lạt"]}
        Current: {food: ["phở"], location: ["hà nội"]}
        → Topic change! (cả food lẫn location đều mới)
        
        Saved: {food: ["cà phê"], location: ["đà lạt"]}
        Current: {food: ["trà sữa"], location: []}
        → KHÔNG phải topic change (chỉ đổi food, location vẫn dùng saved)
    
    Args:
        current_entities: Entities extract từ câu hỏi hiện tại
        saved_context: Context đã lưu từ Redis
        
    Returns:
        bool: True nếu user đã đổi chủ đề hoàn toàn
    """
    saved_entities = saved_context.get("entities", {})
    
    current_food = set(current_entities.get("food", []))
    saved_food = set(saved_entities.get("food", []))
    current_loc = set(current_entities.get("location", []))
    saved_loc = set(saved_entities.get("location", []))
    
    # Chỉ detect topic change khi CẢ HAI đều có giá trị mới
    has_new_food = current_food and saved_food and not current_food.intersection(saved_food)
    has_new_location = current_loc and saved_loc and not current_loc.intersection(saved_loc)
    
    if has_new_food and has_new_location:
        print(f"[ContextManager] 🔄 Topic change detected! "
              f"Food: {saved_food} → {current_food}, "
              f"Location: {saved_loc} → {current_loc}")
        return True
    
    return False
