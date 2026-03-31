"""
File: src/core/clarification.py
Purpose: Module hỏi lại (Clarification) khi user thiếu thông tin location.

Logic:
    - Nếu user hỏi "Quán cà phê nào ngon?" (có food nhưng KHÔNG có location)
      → Bot hỏi lại: "📍 Bạn muốn tìm quán cà phê ở đâu ạ?"
    - Nếu user hỏi "Tìm phở" (chỉ có food, không có location)
      → Bot hỏi lại thay vì trả kết quả lộn xộn từ mọi tỉnh thành

Usage in router.py:
    if should_ask_clarification(entities, intent):
        return ChatResponse(message=generate_clarification_message(entities), ...)
"""

from typing import Dict


def should_ask_clarification(entities: Dict, intent: str) -> bool:
    """
    Kiểm tra xem có cần hỏi lại user không.
    
    Rule: Nếu intent là tìm kiếm (tim_mon_an/tim_dia_diem) VÀ có food/place_type
    NHƯNG KHÔNG có location → hỏi lại.
    
    NGOẠI LỆ: Nếu entities chứa raw_query có từ khóa tổng quát 
    (VD: "món ăn Việt Nam", "đặc sản") → KHÔNG hỏi lại, trả kết quả luôn.
    
    Args:
        entities: Dict chứa food, location, place_type
        intent: Intent đã classify
        
    Returns:
        bool: True nếu cần hỏi lại user về location
    """
    # Chỉ áp dụng cho intent tìm kiếm
    if intent not in ("tim_mon_an", "tim_dia_diem"):
        return False
    
    has_food = bool(entities.get("food"))
    has_place_type = bool(entities.get("place_type"))
    has_location = bool(entities.get("location"))
    
    # Nếu không có food VÀ không có place_type → user không tìm gì cụ thể → không hỏi lại
    if not has_food and not has_place_type:
        return False
    
    # Nếu đã có location → không cần hỏi lại
    if has_location:
        return False
    
    # Ngoại lệ: Nếu raw_query chứa từ khóa tổng quát → trả kết quả luôn
    raw_query = entities.get("raw_query", "").lower()
    general_keywords = [
        "việt nam", "viet nam", "cả nước", "ca nuoc",
        "nổi tiếng", "noi tieng", "đặc sản", "dac san",
        "truyền thống", "truyen thong", "phổ biến", "pho bien"
    ]
    if any(kw in raw_query for kw in general_keywords):
        return False
    
    # Có food/place_type nhưng KHÔNG có location → hỏi lại
    return True


def generate_clarification_message(entities: Dict) -> str:
    """
    Tạo câu hỏi lại dựa trên entities đã extract.
    
    Args:
        entities: Dict chứa food, location, place_type
        
    Returns:
        str: Câu hỏi lại cho user
    """
    food_list = entities.get("food", [])
    place_type_list = entities.get("place_type", [])
    
    # Xác định đang tìm gì
    search_target = ""
    if food_list:
        search_target = ", ".join(food_list)
    elif place_type_list:
        search_target = ", ".join(place_type_list)
    
    if search_target:
        return (
            f"📍 Bạn muốn tìm **{search_target}** ở đâu ạ?\n"
            f"💡 Hãy cho mình biết tỉnh/thành phố bạn muốn tìm "
            f"(VD: Hà Nội, Đà Lạt, Phú Quốc...)"
        )
    else:
        return (
            "📍 Bạn muốn tìm ở khu vực nào ạ?\n"
            "💡 Hãy cho mình biết tỉnh/thành phố "
            "(VD: Hà Nội, Đà Lạt, Phú Quốc...)"
        )
