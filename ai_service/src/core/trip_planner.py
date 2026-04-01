"""
File: src/core/trip_planner.py
Purpose: Module lập kế hoạch chuyến đi (Trip Planner) cho chatbot.

Approach: Template-based (không dùng LLM API).
    - User nói "lập kế hoạch đi Đà Lạt 3 ngày" 
    → Bot tạo lịch trình gợi ý dựa trên data từ DB.

Logic:
    1. Detect intent "lap_ke_hoach" (hoặc keywords "kế hoạch", "lịch trình", "plan")
    2. Extract: destination (location), duration (số ngày)
    3. Query DB lấy top places + foods tại destination
    4. Ghép vào template lịch trình sáng/trưa/tối
"""

import re
from typing import Dict, List, Optional, Tuple


# ==============================================================================
# TRIP PLANNER KEYWORDS — Detect planning intent
# ==============================================================================
PLANNING_KEYWORDS = [
    "kế hoạch", "ke hoach", "lập kế hoạch", "lap ke hoach",
    "lịch trình", "lich trinh", "plan", "planning",
    "hành trình", "hanh trinh", "itinerary", "chuyến đi", "chuyen di"
]

def is_planning_request(text: str) -> bool:
    """
    Kiểm tra xem user có đang hỏi về lập kế hoạch du lịch không.
    
    Args:
        text: Câu chat của user (đã lowercase)
        
    Returns:
        bool: True nếu user muốn lập kế hoạch
    """
    text_lower = text.lower().strip()
    
    # Strong keyword → chắc chắn muốn lập kế hoạch
    has_strong = any(kw in text_lower for kw in PLANNING_KEYWORDS)
    
    # Weak keyword + số ngày → muốn lập kế hoạch
    has_duration = bool(re.search(r'\d+\s*(?:ngày|ngay|day|days)', text_lower))
    WEAK_KW = ["du lịch", "du lich", "đi chơi", "di choi", "travel"]
    has_weak = any(kw in text_lower for kw in WEAK_KW)
    
    # Must contain a location reference (to know where to plan)
    has_destination = any(kw in text_lower for kw in [
        "đi", "di", "tại", "tai", "ở", "o", "về", "ve",
        "đến", "den", "thăm", "tham", "khám phá", "kham pha"
    ])
    
    return (has_strong and has_destination) or (has_weak and has_duration and has_destination)


def extract_duration(text: str) -> int:
    """
    Extract số ngày từ câu text.
    
    VD: "đi Đà Lạt 3 ngày" → 3
        "lịch trình 2 ngày 1 đêm" → 2
        "plan 5 days" → 5
        
    Returns:
        int: Số ngày (default 2 nếu không tìm thấy)
    """
    text_lower = text.lower()
    
    # Pattern: số + "ngày"/"day"/"days"
    match = re.search(r'(\d+)\s*(?:ngày|ngay|day|days)', text_lower)
    if match:
        days = int(match.group(1))
        return min(days, 7)  # Cap at 7 days
    
    # Pattern: "X ngày Y đêm"
    match = re.search(r'(\d+)\s*(?:ngày|ngay)\s*(\d+)\s*(?:đêm|dem)', text_lower)
    if match:
        return min(int(match.group(1)), 7)
    
    return 2  # Default 2 days


def generate_trip_plan(
    destination: str,
    duration: int,
    food_places: List[Dict],
    tourist_spots: List[Dict],
) -> str:
    """
    Tạo lịch trình du lịch template-based.
    
    Args:
        destination: Tên địa điểm (VD: "Đà Lạt")
        duration: Số ngày
        food_places: Danh sách quán ăn tại destination
        tourist_spots: Danh sách địa điểm du lịch tại destination
        
    Returns:
        str: Lịch trình dạng markdown
    """
    destination_title = destination.title()
    
    # Header
    plan = f"🗺️ **Lịch trình {duration} ngày tại {destination_title}**\n"
    plan += "=" * 40 + "\n\n"
    
    # Time slots cho mỗi ngày
    time_slots = [
        ("🌅 Sáng", "Khám phá"),
        ("🌞 Trưa", "Thưởng thức ẩm thực"),
        ("🌆 Chiều", "Tham quan"),
        ("🌙 Tối", "Ăn uống & nghỉ ngơi"),
    ]
    
    # Distribute places across days
    all_spots = tourist_spots.copy()
    all_foods = food_places.copy()
    
    for day in range(1, duration + 1):
        plan += f"### 📅 Ngày {day}\n\n"
        
        for slot_idx, (time_emoji, activity_type) in enumerate(time_slots):
            plan += f"**{time_emoji}**\n"
            
            if slot_idx in (0, 2):  # Morning, Afternoon → tourist spots
                if all_spots:
                    spot = all_spots.pop(0)
                    name = spot.get("name", "Một địa điểm nổi bật")
                    desc = spot.get("description", "")
                    # Truncate description
                    if len(desc) > 100:
                        desc = desc[:100] + "..."
                    plan += f"- 📍 **{name}**\n"
                    if desc:
                        plan += f"  _{desc}_\n"
                else:
                    plan += f"- 📍 Tự do khám phá {destination_title}\n"
                    
            else:  # Lunch, Dinner → food places
                if all_foods:
                    food = all_foods.pop(0)
                    name = food.get("name", "Quán ăn địa phương")
                    desc = food.get("description", "")
                    if len(desc) > 100:
                        desc = desc[:100] + "..."
                    plan += f"- 🍜 **{name}**\n"
                    if desc:
                        plan += f"  _{desc}_\n"
                else:
                    plan += f"- 🍜 Thưởng thức đặc sản {destination_title}\n"
            
            plan += "\n"
        
        plan += "---\n\n"
    
    # Footer tips
    plan += "### 💡 Lưu ý\n"
    plan += f"- Nên book khách sạn/homestay trước khi đi {destination_title}\n"
    plan += "- Mang theo áo khoác nếu đi vùng cao (Đà Lạt, Sa Pa...)\n"
    plan += "- Hỏi mình thêm về từng địa điểm cụ thể để biết chi tiết hơn!\n"
    
    return plan
