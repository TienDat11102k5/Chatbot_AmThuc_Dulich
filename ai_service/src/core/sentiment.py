"""
File: src/core/sentiment.py
Purpose: Module phân tích cảm xúc (Sentiment Analysis) Rule-based cho chatbot.

Logic:
    - Phân tích câu hỏi/phản hồi của user để detect cảm xúc
    - Positive: "ngon quá", "tuyệt vời", "hay lắm" → Bot phản hồi vui
    - Negative: "dở", "tệ", "không ngon", "thất vọng" → Bot xin lỗi + gợi ý khác
    - Neutral: Các câu hỏi bình thường → xử lý bình thường

Approach: Rule-based (keyword matching) — nhanh, miễn phí, không cần LLM.
    Ưu điểm: Chính xác tuyệt đối cho các từ khóa đã define.
    Nhược điểm: Không bắt được ngữ cảnh phức tạp (đã chấp nhận trade-off).
"""

from typing import Tuple, Optional


# ==============================================================================
# KEYWORD DICTIONARIES
# ==============================================================================

POSITIVE_KEYWORDS = [
    # Direct praise
    "ngon", "ngon quá", "ngon lắm", "tuyệt vời", "tuyệt", "xuất sắc",
    "hay", "hay quá", "hay lắm", "giỏi", "giỏi quá",
    "thích", "thích quá", "yêu", "yêu thích",
    "tốt", "tốt quá", "tốt lắm", "ổn", "ổn lắm",
    "chuẩn", "chuẩn luôn", "đỉnh", "đỉnh cao", "max",
    "perfect", "great", "good", "nice", "amazing", "awesome",
    
    # Gratitude
    "cảm ơn", "cám ơn", "cam on", "thank", "thanks",
    "hữu ích", "có ích", "giúp ích",
    
    # Approval
    "ok", "okay", "được", "được rồi", "oke", "okie",
    "đúng rồi", "chính xác", "phải rồi",
    
    # Excitement
    "wow", "wao", "ồ", "oa", "quá đã",
    "siêu", "siêu ngon", "siêu tuyệt",
    "10 điểm", "5 sao", "đỉnh nóc",
]

NEGATIVE_KEYWORDS = [
    # Direct criticism
    "dở", "dở quá", "tệ", "tệ quá", "tệ lắm",
    "không ngon", "ko ngon", "hông ngon", "khum ngon",
    "không hay", "ko hay", "không tốt", "ko tốt",
    "không hữu ích", "chẳng giúp gì",
    
    # Disappointment
    "thất vọng", "chán", "buồn", "tiếc",
    "sai", "sai rồi", "nhầm", "nhầm rồi",
    
    # Complaint
    "tệ hại", "kinh khủng", "khủng khiếp",
    "chất lượng kém", "tồi", "tồi tệ",
    "phí tiền", "lãng phí",
    
    # Anger
    "bực", "bực mình", "bực quá", "tức", "giận",
    "ghét", "ghê", "ghê quá",
    "ngu", "dốt", "đần",
    
    # Request for alternatives
    "không phù hợp", "ko phù hợp",
    "đổi", "đổi cái khác", "không muốn",
]

# Intensifiers that amplify sentiment
INTENSIFIERS = [
    "quá", "lắm", "cực", "cực kỳ", "vô cùng", "siêu",
    "rất", "thật sự", "thực sự", "hoàn toàn",
]


def analyze_sentiment(text: str) -> Tuple[str, float]:
    """
    Phân tích cảm xúc của câu text.
    
    Args:
        text: Câu text cần phân tích
        
    Returns:
        Tuple[str, float]:
            - sentiment: "positive", "negative", hoặc "neutral"
            - score: Điểm sentiment (0.0 → 1.0), càng cao càng mạnh
    """
    text_lower = text.lower().strip()
    
    pos_count = 0
    neg_count = 0
    has_intensifier = False
    
    # Check intensifiers
    for intensifier in INTENSIFIERS:
        if intensifier in text_lower:
            has_intensifier = True
            break
    
    # Check negative keywords (ưu tiên cụm dài trước)
    sorted_neg = sorted(NEGATIVE_KEYWORDS, key=len, reverse=True)
    for keyword in sorted_neg:
        if keyword in text_lower:
            neg_count += 1
    
    # Check positive keywords (ưu tiên cụm dài trước)
    sorted_pos = sorted(POSITIVE_KEYWORDS, key=len, reverse=True)
    for keyword in sorted_pos:
        if keyword in text_lower:
            pos_count += 1
    
    # Determine sentiment
    if neg_count > pos_count:
        score = min(1.0, neg_count * 0.3 + (0.2 if has_intensifier else 0))
        return "negative", score
    elif pos_count > neg_count:
        score = min(1.0, pos_count * 0.3 + (0.2 if has_intensifier else 0))
        return "positive", score
    elif pos_count > 0 and neg_count > 0:
        # Mixed sentiment — neutral by default
        return "neutral", 0.5
    else:
        return "neutral", 0.0


def get_sentiment_response(sentiment: str, score: float) -> Optional[str]:
    """
    Tạo phản hồi dựa trên cảm xúc đã phát hiện.
    Chỉ tạo phản hồi khi cảm xúc mạnh (score >= 0.3).
    
    Args:
        sentiment: "positive", "negative", hoặc "neutral"
        score: Điểm sentiment
        
    Returns:
        Optional[str]: Câu phản hồi cảm xúc, hoặc None nếu neutral/yếu
    """
    if score < 0.3:
        return None
    
    if sentiment == "positive":
        return (
            "😊 Cảm ơn bạn nhiều! Rất vui vì mình đã giúp được. "
            "Nếu cần tìm thêm gì, cứ hỏi mình nhé!"
        )
    elif sentiment == "negative":
        return (
            "😔 Mình xin lỗi vì kết quả chưa như ý bạn. "
            "Bạn thử mô tả cụ thể hơn để mình gợi ý chính xác hơn nhé! "
            "VD: \"Tìm quán phở ngon ở quận 1\""
        )
    
    return None
