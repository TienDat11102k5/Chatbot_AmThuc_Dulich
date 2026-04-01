"""
File: src/core/response_generator.py
Purpose: Module sinh câu trả lời đa dạng, tự nhiên, có ngữ cảnh.
         Thay thế hệ thống response template cứng nhắc (1 mẫu/intent)
         bằng 20+ mẫu mỗi loại, có tính cá nhân hóa theo context.

Author: AI Brain Optimization — Phase 1
"""

import random
from typing import List, Optional


# ==============================================================================
# 1. RESPONSE TEMPLATES — Đa dạng cho từng intent
# ==============================================================================

FOOD_GREETING_RESPONSES = [
    "🍜 Đây là một số món ngon mà mình tìm được cho bạn:",
    "🍲 Mình gợi ý một vài đặc sản cực kỳ hấp dẫn nè:",
    "😋 Wow, đây là những quán ăn bạn nhất định phải thử:",
    "🥢 Mình tìm được mấy quán ngon lắm, bạn xem nha:",
    "🍛 Đây là top gợi ý ẩm thực cho bạn:",
    "🔥 Mấy quán này ngon lắm luôn, bạn ghi note lại nhé:",
    "🍽️ Mình chọn được mấy địa chỉ ăn uống chất lượng nè:",
    "😍 Ăn ở đây là không hối hận đâu, xem thử nha:",
    "🥇 Top gợi ý ẩm thực hôm nay cho bạn:",
    "👨‍🍳 Mình đề xuất mấy quán ăn xịn sò này nè:",
]

FOOD_WITH_LOCATION_RESPONSES = [
    "🍜 {location} có rất nhiều món ngon! Mình gợi ý cho bạn nè:",
    "😋 Đặc sản {location} nổi tiếng lắm! Đây là top gợi ý:",
    "🍲 Đến {location} mà không thử mấy món này thì phí lắm:",
    "🥢 {location} ẩm thực phong phú cực! Bạn nên thử:",
    "🔥 Nói đến ăn uống ở {location}, bạn không thể bỏ qua:",
    "🍛 {location} — thiên đường ẩm thực! Mình gợi ý cho bạn:",
    "👨‍🍳 Góc ẩm thực {location} nhé! Đây là những quán đáng thử:",
    "😍 Wow, {location} có mấy quán này ngon lắm luôn:",
]

FOOD_WITH_SPECIFIC_RESPONSES = [
    "🍜 Mình tìm thấy mấy quán {food} ngon lắm nè:",
    "😋 {food} hả? Tuyệt vời! Đây là gợi ý cho bạn:",
    "🥢 Nói đến {food} thì phải thử mấy chỗ này:",
    "🔥 Fan {food} hả? Mấy quán này bạn sẽ thích lắm:",
    "👨‍🍳 {food} ngon nhất phải kể đến:",
]

PLACE_GREETING_RESPONSES = [
    "📍 Đây là một số địa điểm du lịch hấp dẫn mình gợi ý cho bạn:",
    "🏖️ Mình tìm được mấy địa điểm cực đẹp nè:",
    "🗺️ Du lịch ở đây thú vị lắm! Đây là top gợi ý:",
    "⭐ Mấy địa điểm này được nhiều du khách yêu thích:",
    "🌄 Đây là những địa điểm bạn nên ghé thăm:",
    "📸 Check-in mấy chỗ này là chuẩn luôn:",
    "✨ Mình đề xuất mấy điểm đến siêu đẹp nè:",
    "🧳 Gợi ý du lịch hôm nay cho bạn:",
]

PLACE_WITH_LOCATION_RESPONSES = [
    "📍 {location} có rất nhiều điểm đẹp! Đây là top gợi ý:",
    "🏖️ Du lịch {location} tuyệt lắm! Bạn nên ghé:",
    "🗺️ Đến {location} nhất định phải check-in mấy chỗ này:",
    "⭐ {location} — điểm đến lý tưởng! Mình gợi ý cho bạn:",
    "🌄 {location} đẹp lắm luôn! Đây là những nơi nên đi:",
    "📸 {location} — có mấy chỗ này chụp ảnh đẹp mê luôn:",
    "✨ Khám phá {location} thôi! Mình gợi ý nè:",
]

FOLLOW_UP_FOOD_RESPONSES = [
    "🍜 Ngoài ra bạn cũng nên thử mấy quán này nữa:",
    "😋 Còn mấy quán hay lắm nè, bạn xem thêm:",
    "🥢 Đây là thêm một số gợi ý khác cho bạn:",
    "🔥 Mấy quán này cũng ngon không kém đâu:",
    "👨‍🍳 Thêm gợi ý nữa cho bạn đây:",
    "🍛 Bạn cũng nên thử mấy chỗ này:",
]

FOLLOW_UP_PLACE_RESPONSES = [
    "📍 Ngoài ra bạn cũng nên ghé mấy chỗ này:",
    "🏖️ Còn mấy điểm đẹp nữa nè, xem thêm:",
    "🗺️ Đây là thêm một số địa điểm khác:",
    "⭐ Mấy chỗ này cũng đáng ghé lắm:",
    "✨ Thêm vài gợi ý nữa cho bạn:",
]

# ==============================================================================
# 2. CONVERSATION RESPONSES — Giao tiếp tự nhiên
# ==============================================================================

GREETING_RESPONSES = [
    "👋 Xin chào! Mình là Chatbot SavoryTrip — chuyên gia ẩm thực & du lịch Việt Nam!\n"
    "Bạn muốn tìm **món ăn ngon** hay **địa điểm du lịch** hấp dẫn nhé?",

    "🤗 Chào bạn! Mình ở đây để giúp bạn khám phá ẩm thực và du lịch Việt Nam!\n"
    "Hỏi mình bất cứ điều gì, ví dụ: \"Phở Hà Nội ở đâu ngon?\"",

    "👋 Hello! Mình là trợ lý ẩm thực & du lịch của bạn!\n"
    "Thử hỏi: \"Gợi ý quán cà phê ở Đà Lạt\" hoặc \"Đà Nẵng có gì chơi?\"",

    "😊 Chào bạn nè! Mình sẵn sàng giúp bạn tìm kiếm!\n"
    "• 🍜 Món ăn ngon → \"Tìm phở ở Sài Gòn\"\n"
    "• 📍 Du lịch → \"Nha Trang có gì vui?\"",

    "🌟 Xin chào! Chào mừng bạn đến với SavoryTrip!\n"
    "Mình biết hơn 27,000 địa điểm ẩm thực & du lịch khắp Việt Nam. Hỏi mình đi!",
]

THANKS_RESPONSES = [
    "😊 Không có gì đâu! Rất vui vì đã giúp được bạn.\n"
    "Nếu cần tìm thêm, cứ hỏi mình nhé!",

    "🥰 Bạn quá khen! Mình vui lắm khi gợi ý đúng ý bạn.\n"
    "Lần sau cần gì cứ gọi mình nha!",

    "😄 Cảm ơn bạn! Chúc bạn ăn ngon và du lịch vui vẻ!\n"
    "Khi nào cần gợi ý thêm thì hỏi mình nhé!",

    "🙏 Không sao đâu! Mình luôn sẵn sàng giúp bạn.\n"
    "Hẹn gặp lại lần sau nhé! 👋",

    "😊 Rất vui vì bạn thích! Mình ở đây bất cứ khi nào bạn cần.",
]

GOODBYE_RESPONSES = [
    "👋 Tạm biệt bạn! Chúc bạn có những trải nghiệm ẩm thực & du lịch thật tuyệt vời!\n"
    "Hẹn gặp lại nhé! 😊",

    "🌟 Bye bye! Chúc bạn chuyến đi vui vẻ!\n"
    "Quay lại hỏi mình bất cứ khi nào nha! 👋",

    "😊 Tạm biệt! Nhớ thử mấy quán mình gợi ý nhé!\n"
    "Khi nào cần, cứ quay lại hỏi mình. Bye! ✨",

    "👋 Hẹn gặp lại! Chúc bạn một ngày tuyệt vời!\n"
    "Mình luôn ở đây để giúp bạn khám phá ẩm thực Việt Nam 🍜",
]

INFO_RESPONSES = [
    "ℹ️ Mình là Chatbot **SavoryTrip** — chuyên hỗ trợ tìm kiếm **món ăn ngon** "
    "và **địa điểm du lịch** trên khắp Việt Nam.\n"
    "📊 Mình biết hơn **27,000 địa điểm** từ 63 tỉnh thành!\n\n"
    "Bạn có thể hỏi mình ví dụ:\n"
    "• \"Phở Hà Nội ở đâu ngon?\"\n"
    "• \"Gợi ý quán cà phê ở Đà Lạt\"\n"
    "• \"Đà Nẵng có gì chơi?\"",

    "🤖 Mình là trợ lý AI chuyên về **ẩm thực & du lịch Việt Nam**!\n\n"
    "💡 Mình có thể giúp bạn:\n"
    "• 🍜 Tìm món ăn ngon theo vùng miền\n"
    "• 📍 Gợi ý địa điểm du lịch\n"
    "• 🗺️ Lập kế hoạch chuyến đi\n"
    "• 📍 Tìm quán gần đây",
]

WEATHER_RESPONSES = [
    "🌤️ Mình chưa hỗ trợ tra cứu thời tiết trực tiếp. "
    "Bạn có thể tra trên **weather.com** hoặc **thoitiet.vn** nhé!\n"
    "💡 Nhưng mình có thể gợi ý **món ăn** hoặc **địa điểm** phù hợp với thời tiết đó!",

    "☁️ Xin lỗi, mình không tra được thời tiết. "
    "Nhưng nếu trời mưa thì ăn **phở nóng** rất hợp, hay trời nắng thì uống **nước mía** đã khát lắm! 😄\n"
    "Bạn muốn mình gợi ý món gì không?",
]

# ==============================================================================
# 3. OUT-OF-SCOPE RESPONSES
# ==============================================================================

OUT_OF_SCOPE_RESPONSES = [
    "🤔 Câu hỏi này nằm ngoài khả năng của mình rồi! "
    "Mình chỉ hỗ trợ về **ẩm thực** và **du lịch Việt Nam** thôi nhé.\n"
    "💡 Thử hỏi: *\"Phở Hà Nội ở đâu ngon?\"*",

    "😅 Xin lỗi, mình chưa được huấn luyện để trả lời câu hỏi này. "
    "Mình chuyên về **món ăn ngon** và **địa điểm du lịch** thôi!\n"
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

    "😅 Hmm, câu này mình chịu rồi! Mình chỉ rành về **đồ ăn ngon** và **du lịch** thôi.\n"
    "💡 Thử hỏi: *\"Đà Nẵng có gì chơi?\"*",
]

# ==============================================================================
# 4. SPECIAL RESPONSES
# ==============================================================================

NO_RESULTS_RESPONSES = [
    "😅 Mình chưa tìm thấy kết quả phù hợp. Bạn thử mô tả cụ thể hơn nhé!\n"
    "💡 Ví dụ: \"Phở bò ở quận 1\" hoặc \"Quán cà phê view đẹp Đà Lạt\"",

    "🔍 Hmm, mình chưa tìm được kết quả. Thử đổi cách hỏi xem sao?\n"
    "💡 Ví dụ: thêm tên món + địa điểm cụ thể",

    "😅 Xin lỗi, mình không tìm thấy gì phù hợp lắm.\n"
    "💡 Bạn có thể thử: \"Ăn gì ở Đà Nẵng?\" hoặc \"Nha Trang có gì vui?\"",
]

NO_MORE_RESULTS_RESPONSES = [
    "😅 Mình đã gợi ý hết các địa điểm phù hợp rồi!\n"
    "Bạn thử hỏi về địa phương khác hoặc loại món ăn khác xem sao?",

    "🔍 Hết gợi ý rồi bạn ơi! Thử tìm kiếm khác nha.\n"
    "Ví dụ: đổi sang vùng miền khác hoặc loại hình khác",

    "😊 Mình đã liệt kê hết rồi! Bạn muốn tìm ở nơi khác không?\n"
    "Hay thử hỏi một món ăn/ địa điểm khác đi!",
]

LOCATION_NOT_FOUND_RESPONSES = [
    "😅 Mình không tìm thấy kết quả phù hợp tại **{location}**.\n"
    "Đây là một số gợi ý từ các tỉnh thành khác:",

    "🔍 Hmm, **{location}** chưa có nhiều dữ liệu trong hệ thống.\n"
    "Mình gợi ý từ nơi khác cho bạn nhé:",

    "😅 Kết quả tại **{location}** hơi ít. Mình bổ sung thêm gợi ý từ nơi khác:",
]

# ==============================================================================
# 5. FOLLOW-UP SUGGESTIONS — Gợi ý câu hỏi tiếp theo
# ==============================================================================

FOOD_FOLLOW_UP_SUGGESTIONS = [
    ("\n\n💡 Bạn muốn xem thêm quán khác không? Hỏi \"*còn quán nào?*\"", "none"),
    ("\n\n☕ Ngoài ra bạn có muốn tìm quán **cà phê** gần đây không?", "cafe"),
    ("\n\n📍 Bạn muốn tìm thêm **địa điểm du lịch** ở đây không?", "place"),
    ("", "none"),
    ("", "none"),
]

PLACE_FOLLOW_UP_SUGGESTIONS = [
    ("\n\n💡 Bạn muốn xem thêm điểm đến khác không? Hỏi \"*còn chỗ nào?*\"", "none"),
    ("\n\n🍜 Ngoài ra bạn có muốn tìm **món ăn đặc sản** ở đây không?", "food"),
    ("\n\n🏨 Bạn cần mình gợi ý **khách sạn** gần đây không?", "hotel"),
    ("", "none"),
    ("", "none"),
]

# ==============================================================================
# 6. SENTIMENT RESPONSES — Đa dạng phản hồi cảm xúc
# ==============================================================================

POSITIVE_SENTIMENT_RESPONSES = [
    "😊 Cảm ơn bạn nhiều! Rất vui vì gợi ý hữu ích nha!",
    "🥰 Bạn khen mình vui ghê! Tìm thêm gì không nào?",
    "😄 Yay! Vui quá khi bạn thích! Mình luôn sẵn sàng giúp!",
    "🌟 Cảm ơn bạn! Chúc bạn ăn ngon và chơi vui nhé!",
    "😊 Tuyệt vời! Mình rất vui vì đã giúp được bạn!",
]

NEGATIVE_SENTIMENT_RESPONSES = [
    "😔 Mình xin lỗi vì kết quả chưa như ý. "
    "Bạn thử mô tả cụ thể hơn nhé! VD: \"Tìm quán phở ngon ở quận 1\"",

    "🙏 Xin lỗi bạn! Mình sẽ cố gắng gợi ý tốt hơn. "
    "Thử nói rõ hơn về loại món ăn hoặc khu vực bạn muốn nhé!",

    "😅 Mình hiểu, kết quả chưa ổn lắm. "
    "Bạn thử hỏi cụ thể hơn, mình sẽ tìm chính xác hơn!",

    "🔍 Mình xin lỗi! Thử đổi cách hỏi xem sao? "
    "Ví dụ: thêm **tên món** + **địa điểm** cụ thể nhé.",
]

# ==============================================================================
# 7. PRICE RESPONSES — Cho intent hoi_gia (Phase 3)
# ==============================================================================

PRICE_RESPONSES = [
    "💰 Thông tin giá cả tham khảo:",
    "🏷️ Đây là khoảng giá mình tìm được:",
    "💵 Giá tham khảo cho bạn nè:",
]

COMPARISON_RESPONSES = [
    "⚖️ So sánh cho bạn nè:",
    "🔍 Mình so sánh giúp bạn nhé:",
    "📊 Hai món này khác nhau như sau:",
]

REVIEW_RESPONSES = [
    "⭐ Đây là đánh giá tổng hợp:",
    "📝 Review cho bạn tham khảo:",
    "🌟 Thông tin đánh giá:",
]


# ==============================================================================
# 8. MAIN FUNCTIONS — API chính
# ==============================================================================

def generate_greeting_response(intent: str, entities: dict = None,
                                is_follow_up: bool = False,
                                location_not_found: bool = False,
                                searched_location: str = None) -> str:
    """
    Sinh câu chào mở đầu cho response dựa trên intent và context.
    
    Args:
        intent: Intent đã phân loại
        entities: Thực thể đã trích xuất
        is_follow_up: Có phải câu hỏi tiếp nối không
        location_not_found: Không tìm thấy ở địa phương user hỏi
        searched_location: Tên địa phương đã tìm
    
    Returns:
        str: Câu chào mở đầu
    """
    # Conversation intents
    if intent == "chao_hoi":
        return random.choice(GREETING_RESPONSES)
    elif intent == "cam_on":
        return random.choice(THANKS_RESPONSES)
    elif intent == "tam_biet":
        return random.choice(GOODBYE_RESPONSES)
    elif intent == "hoi_thong_tin":
        return random.choice(INFO_RESPONSES)
    elif intent == "hoi_thoi_tiet":
        return random.choice(WEATHER_RESPONSES)
    elif intent == "out_of_scope":
        return random.choice(OUT_OF_SCOPE_RESPONSES)
    
    # Location not found
    if location_not_found and searched_location:
        return random.choice(LOCATION_NOT_FOUND_RESPONSES).format(location=searched_location)
    
    # Search intents
    locations = entities.get("location", []) if entities else []
    foods = entities.get("food", []) if entities else []
    location_str = ", ".join(locations) if locations else ""
    food_str = ", ".join(f for f in foods if f not in ["ăn gì", "ăn", "gì", "ngon", "quán"]) if foods else ""
    
    if intent == "tim_mon_an":
        if is_follow_up:
            return random.choice(FOLLOW_UP_FOOD_RESPONSES)
        elif location_str and food_str:
            return random.choice(FOOD_WITH_SPECIFIC_RESPONSES).format(food=food_str)
        elif location_str:
            return random.choice(FOOD_WITH_LOCATION_RESPONSES).format(location=location_str)
        else:
            return random.choice(FOOD_GREETING_RESPONSES)
    
    elif intent == "tim_dia_diem":
        if is_follow_up:
            return random.choice(FOLLOW_UP_PLACE_RESPONSES)
        elif location_str:
            return random.choice(PLACE_WITH_LOCATION_RESPONSES).format(location=location_str)
        else:
            return random.choice(PLACE_GREETING_RESPONSES)
    
    # Fallback
    return "Mình tìm được kết quả cho bạn nè:"


def format_recommendation_item(rec, index: int) -> str:
    """
    Format 1 kết quả recommendation đẹp hơn.
    
    Args:
        rec: RecommendationItem object hoặc dict
        index: Thứ tự (1-based)
    
    Returns:
        str: Formatted string cho 1 item
    """
    # Support both dict and object
    name = rec.name if hasattr(rec, 'name') else rec.get('name', '')
    location = rec.location if hasattr(rec, 'location') else rec.get('location', '')
    address = rec.address if hasattr(rec, 'address') else rec.get('address', '')
    description = rec.description if hasattr(rec, 'description') else rec.get('description', '')
    rating = rec.rating if hasattr(rec, 'rating') else rec.get('rating', 0)
    price_range = rec.price_range if hasattr(rec, 'price_range') else rec.get('price_range', '')
    
    # Medal emoji for top 3
    medal = {1: "🥇", 2: "🥈", 3: "🥉"}.get(index, f"{index}.")
    
    # Rating stars
    rating_str = ""
    if rating and float(rating) > 0:
        stars = float(rating)
        rating_str = f" ⭐{stars:.1f}"
    
    # Location info
    location_info = location
    if address and address.strip() and address != location:
        location_info = f"{address}"
    
    # Price info
    price_str = ""
    if price_range and price_range.strip():
        price_str = f"\n   💰 {price_range}"
    
    # Truncate description if too long
    desc = description
    if len(desc) > 120:
        desc = desc[:117] + "..."
    
    return (
        f"\n\n{medal} **{name}**{rating_str} "
        f"📍 **Địa chỉ:** {location_info}{price_str} "
        f"📝 **Mô tả:** {desc}"
    )


def format_recommendations(recommendations: list, intent: str,
                           is_follow_up: bool = False) -> tuple[str, str]:
    """
    Format toàn bộ danh sách recommendations.
    
    Args:
        recommendations: List of RecommendationItem
        intent: Intent hiện tại
        is_follow_up: Có phải follow-up không
    
    Returns:
        tuple[str, str]: (Formatted string for all items, suggestion_type)
    """
    if not recommendations:
        return "", "none"
    
    items_text = ""
    for i, rec in enumerate(recommendations, 1):
        items_text += format_recommendation_item(rec, i)
    
    suggestion_type = "none"
    # Add follow-up suggestion (random, sometimes empty)
    if not is_follow_up:
        if intent == "tim_mon_an":
            suggestion_msg, suggestion_type = random.choice(FOOD_FOLLOW_UP_SUGGESTIONS)
            items_text += suggestion_msg
        elif intent == "tim_dia_diem":
            suggestion_msg, suggestion_type = random.choice(PLACE_FOLLOW_UP_SUGGESTIONS)
            items_text += suggestion_msg
    
    return items_text, suggestion_type


def generate_no_results_response(is_follow_up: bool = False,
                                  had_previous: bool = False) -> str:
    """Sinh response khi không có kết quả."""
    if is_follow_up and had_previous:
        return random.choice(NO_MORE_RESULTS_RESPONSES)
    return random.choice(NO_RESULTS_RESPONSES)


def generate_pagination_message(remaining: int) -> str:
    """Sinh thông báo còn thêm kết quả."""
    if remaining <= 0:
        return ""
    
    templates = [
        f"\n\n📄 Còn **{remaining}** kết quả khác. Hỏi \"*còn quán nào?*\" để xem tiếp!",
        f"\n\n🔍 Mình còn **{remaining}** gợi ý nữa. Muốn xem thêm không?",
        f"\n\n💡 Còn {remaining} kết quả! Hỏi \"*gợi ý thêm*\" để mình hiện tiếp nhé.",
    ]
    return random.choice(templates)


def get_sentiment_response_text(sentiment: str, score: float) -> str:
    """Sinh response dựa trên sentiment đã phân tích."""
    if score < 0.3:
        return ""
    
    if sentiment == "positive":
        return random.choice(POSITIVE_SENTIMENT_RESPONSES)
    elif sentiment == "negative":
        return random.choice(NEGATIVE_SENTIMENT_RESPONSES)
    
    return ""
"""
Module sinh câu trả lời tự nhiên, đa dạng — hết file.
"""
