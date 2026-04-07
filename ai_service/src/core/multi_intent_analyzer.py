"""
File: src/core/multi_intent_analyzer.py
Mục đích: Phân tích câu hỏi phức tạp chứa nhiều yêu cầu và tách thành
          danh sách các sub-intent riêng biệt.

Ví dụ câu phức tạp:
    "Tôi vừa tới Vũng Tàu, bạn giúp tôi liệt kê 3 địa điểm du lịch, 4 quán phở và vài khách sạn"

    → SubIntent(category="tim_dia_diem", label="Địa điểm du lịch", qty=3, keywords=[], location=["vũng tàu"])
    → SubIntent(category="tim_mon_an",   label="Quán ăn",           qty=4, keywords=["phở"], location=["vũng tàu"])
    → SubIntent(category="tim_luu_tru",  label="Khách sạn",         qty=3, keywords=["khách sạn"], location=["vũng tàu"])

Author: Antigravity — Multi-Intent Brain Optimization
"""

import re
from dataclasses import dataclass, field
from typing import Optional
from src.core.quantity_extractor import get_quantity_or_default, DEFAULT_QUANTITY

# ==============================================================================
# CẤU HÌNH
# ==============================================================================

MAX_SUB_INTENTS = 5  # Giới hạn tối đa sub-intent trong 1 câu (đã chốt)


# ==============================================================================
# CÁC TỪ TÁCH CÂU (Clause Splitters)
# ==============================================================================

# Regex tách câu thành các clause nhỏ
CLAUSE_SPLIT_PATTERN = re.compile(
    r'\s*[,;]\s*|\s+(?:và|với|cùng với|ngoài ra|rồi|thêm|kèm theo|cùng|đồng thời|bên cạnh đó)\s+',
    re.IGNORECASE | re.UNICODE
)


# ==============================================================================
# KEYWORD MAPS CHO TỪNG CATEGORY
# ==============================================================================

# 1. Du lịch & Địa điểm tham quan
TOURISM_KEYWORDS = [
    # Cụm từ dài trước (để match greedy)
    "địa điểm du lịch", "dia diem du lich",
    "địa điểm tham quan", "dia diem tham quan",
    "điểm tham quan", "diem tham quan",
    "điểm du lịch", "diem du lich",
    "nơi du lịch", "noi du lich",
    "điểm check-in", "diem check-in",
    "điểm check in", "diem check in",
    "danh lam thắng cảnh", "danh lam thang canh",
    "thắng cảnh", "thang canh",
    # Từ đơn
    "du lịch", "du lich",
    "tham quan",
    "check-in", "check in",
    "vui chơi", "vui choi",
    "khám phá", "kham pha",
    "leo núi", "leo nui",
    "bãi biển", "bai bien",
    "bảo tàng", "bao tang",
    "công viên", "cong vien",
    "hồ", "thác", "thac",
    "cảnh đẹp", "canh dep",
]

# 2. Ẩm thực (món ăn, quán ăn)
FOOD_KEYWORDS = [
    # Cụm từ dài trước
    "quán ăn", "quan an",
    "nhà hàng", "nha hang",
    "đặc sản", "dac san",
    "món ngon", "mon ngon",
    "ăn ngon", "an ngon",
    "ẩm thực", "am thuc",
    # Loại món ăn phổ biến
    "phở", "pho",
    "bún bò", "bun bo",
    "bún chả", "bun cha",
    "bún mắm", "bun mam",
    "bún riêu", "bun rieu",
    "cơm", "com",
    "bánh mì", "banh mi",
    "bánh xèo", "banh xeo",
    "bánh cuốn", "banh cuon",
    "hủ tiếu", "hu tieu",
    "mì quảng", "mi quang",
    "cao lầu", "cao lau",
    "bánh bèo", "banh beo",
    "bò kho", "bo kho",
    "lẩu", "lau",
    "nướng", "nuong",
    "hải sản", "hai san",
    "thịt nướng", "thit nuong",
    "dimsum", "dim sum",
    "sushi",
    "pizza",
    "burger",
    "ốc", "oc",
    "cháo", "chao",
    "xôi", "xoi",
    "bánh tráng", "banh trang",
    "nem", "chả giò", "cha gio",
    "gỏi", "goi",
]

# 3. Lưu trú (khách sạn, homestay...)
ACCOMMODATION_KEYWORDS = [
    # Cụm từ dài trước
    "khách sạn", "khach san",
    "nhà nghỉ", "nha nghi",
    "nhà khách", "nha khach",
    "khu nghỉ dưỡng", "khu nghi duong",
    # Từ đơn / vay mượn
    "homestay",
    "resort",
    "villa",
    "hotel",
    "motel",
    "hostel",
    "airbnb",
    "lưu trú", "luu tru",
    "nơi ở", "noi o",
    "chỗ nghỉ", "cho nghi",
    "chỗ ở", "cho o",
    "phòng trọ", "phong tro",
    "căn hộ", "can ho",
]

# 4. Quán nước (café, trà sữa...)
DRINK_KEYWORDS = [
    # Cụm từ dài trước
    "quán cà phê", "quan ca phe",
    "quán cafe", "quan cafe",
    "quán trà sữa", "quan tra sua",
    "quán nước", "quan nuoc",
    "quán giải khát", "quan giai khat",
    "tiệm trà", "tiem tra",
    "tiệm cà phê", "tiem ca phe",
    # Từ đơn
    "cà phê", "ca phe",
    "cafe",
    "coffee",
    "trà sữa", "tra sua",
    "sinh tố", "sinh to",
    "nước ép", "nuoc ep",
    "trà chanh", "tra chanh",
    "bubble tea",
    "boba",
    "smoothie",
    "cocktail",
    "beer",
    "bia",
    "bar",
    "pub",
    "rooftop bar",
    "sky bar",
]

# ==============================================================================
# CATEGORY DEFINITIONS
# ==============================================================================

CATEGORIES = {
    "tim_dia_diem": {
        "label": "Địa điểm du lịch",
        "emoji": "🏖️",
        "keywords": TOURISM_KEYWORDS,
        "recommender_intent": "tim_dia_diem",
        "filter_type": None,
    },
    "tim_mon_an": {
        "label": "Quán ăn",
        "emoji": "🍜",
        "keywords": FOOD_KEYWORDS,
        "recommender_intent": "tim_mon_an",
        "filter_type": None,
    },
    "tim_luu_tru": {
        "label": "Khách sạn & Lưu trú",
        "emoji": "🏨",
        "keywords": ACCOMMODATION_KEYWORDS,
        "recommender_intent": "tim_dia_diem",  # Map sang tim_dia_diem để query DB
        "filter_type": "accommodation",
    },
    "tim_quan_nuoc": {
        "label": "Quán nước & Cà phê",
        "emoji": "☕",
        "keywords": DRINK_KEYWORDS,
        "recommender_intent": "tim_mon_an",  # Map sang tim_mon_an để query DB
        "filter_type": "drink",
    },
}

# Thứ tự ưu tiên khi classify (category dài/cụ thể hơn → ưu tiên cao hơn)
CATEGORY_PRIORITY = ["tim_luu_tru", "tim_quan_nuoc", "tim_mon_an", "tim_dia_diem"]


# ==============================================================================
# DATACLASS
# ==============================================================================

@dataclass
class SubIntent:
    """
    Biểu diễn 1 ý định con trong câu hỏi multi-intent.

    Ví dụ:
        SubIntent(
            category="tim_mon_an",
            category_label="Quán ăn",
            category_emoji="🍜",
            quantity=4,
            keywords=["phở"],
            location=["vũng tàu"],
            recommender_intent="tim_mon_an",
            filter_type=None,
            original_clause="4 quán bán phở"
        )
    """
    category: str                    # Mã category: tim_dia_diem | tim_mon_an | tim_luu_tru | tim_quan_nuoc
    category_label: str              # Nhãn hiển thị: "Địa điểm du lịch"
    category_emoji: str              # Emoji: 🏖️ / 🍜 / 🏨 / ☕
    quantity: int                    # Số lượng kết quả mong muốn
    keywords: list[str]              # Các từ khóa tìm kiếm cụ thể (ví dụ: ["phở"])
    location: list[str]              # Địa điểm áp dụng (ví dụ: ["vũng tàu"])
    recommender_intent: str          # Intent dùng để gọi Recommender
    filter_type: Optional[str]       # Filter type cho Recommender (None | "accommodation" | "drink")
    original_clause: str = ""        # Clause gốc (để debug)


# ==============================================================================
# MULTI-INTENT ANALYZER
# ==============================================================================

class MultiIntentAnalyzer:
    """
    Phân tích câu hỏi phức tạp (multi-intent) thành danh sách SubIntent.

    Thuật toán:
    1. Phát hiện tín hiệu multi-intent (từ nối, số keyword categories ≥ 2)
    2. Tách câu thành clauses
    3. Classify từng clause → category
    4. Extract quantity + keywords + location cho từng clause
    5. Location inheritance nếu clause con thiếu location
    6. Giới hạn MAX_SUB_INTENTS

    Usage:
        analyzer = MultiIntentAnalyzer()
        sub_intents = analyzer.analyze("Tôi vừa tới Vũng Tàu, 3 địa điểm du lịch và 4 quán phở")
        # → [SubIntent(tim_dia_diem, qty=3, loc=["vũng tàu"]), SubIntent(tim_mon_an, qty=4, ...)]
    """

    def __init__(self):
        # Pre-compile keyword patterns cho tốc độ
        self._compiled_patterns = {}
        for cat_id, cat_info in CATEGORIES.items():
            # Sắp xếp keyword dài trước để match greedy
            sorted_kws = sorted(cat_info["keywords"], key=len, reverse=True)
            pattern = r'\b(?:' + '|'.join(re.escape(k) for k in sorted_kws) + r')\b'
            self._compiled_patterns[cat_id] = re.compile(pattern, re.IGNORECASE | re.UNICODE)

    # --------------------------------------------------------------------------
    # API chính
    # --------------------------------------------------------------------------

    def analyze(self, user_message: str, entities: dict = None) -> list[SubIntent]:
        """
        Phân tích câu hỏi và trả về danh sách sub-intent.

        Args:
            user_message: Câu hỏi gốc của user
            entities: Entities đã được NER extract (dùng để lấy location sẵn có)

        Returns:
            list[SubIntent]: Danh sách sub-intent. Rỗng nếu là câu đơn.

        Lưu ý: Trả về list RỖNG (không phải 1 item) khi là single intent.
               Caller sẽ kiểm tra: if not sub_intents → dùng pipeline cũ
        """
        if not user_message:
            return []

        msg_lower = user_message.lower().strip()

        # Bước 1: Kiểm tra nhanh có tín hiệu multi-intent không
        if not self._has_multi_intent_signals(msg_lower):
            return []

        # Bước 2: Tách câu thành các clause
        clauses = self._split_clauses(user_message)
        if len(clauses) < 2:
            return []

        # Bước 3: Lấy location tổng từ entities hoặc từ câu đầu tiên
        global_location = self._extract_global_location(entities, clauses)

        # Bước 4: Classify + extract từng clause
        sub_intents = []
        seen_categories = []  # Tránh trùng lặp category

        for clause in clauses:
            sub = self._process_clause(clause, global_location, seen_categories)
            if sub:
                # Kiểm tra trùng category (cho phép tối đa 2 item cùng category với keyword khác nhau)
                same_cat_count = sum(1 for s in sub_intents if s.category == sub.category)
                if same_cat_count < 2:
                    sub_intents.append(sub)
                    if sub.category not in seen_categories:
                        seen_categories.append(sub.category)

        # Bước 5: Giới hạn số lượng sub-intent
        sub_intents = sub_intents[:MAX_SUB_INTENTS]

        # Trả rỗng nếu chỉ có 1 sub-intent (không phải multi-intent thực sự)
        if len(sub_intents) < 2:
            return []

        return sub_intents

    def is_multi_intent(self, user_message: str, entities: dict = None) -> bool:
        """Kiểm tra nhanh xem câu có phải multi-intent không."""
        return len(self.analyze(user_message, entities)) >= 2

    # --------------------------------------------------------------------------
    # Private methods
    # --------------------------------------------------------------------------

    def _has_multi_intent_signals(self, msg_lower: str) -> bool:
        """
        Kiểm tra nhanh xem câu có tín hiệu multi-intent không.
        Điều kiện: có dấu phân tách VÀ có ít nhất 2 category keywords.
        """
        # Phải có dấu phân tách
        has_separator = bool(re.search(
            r'[,;]|\b(?:và|với|cùng với|ngoài ra|rồi|thêm|kèm theo|đồng thời|bên cạnh đó)\b',
            msg_lower
        ))
        if not has_separator:
            return False

        # Đếm số category có keyword xuất hiện trong câu
        categories_found = 0
        for cat_id, pattern in self._compiled_patterns.items():
            if pattern.search(msg_lower):
                categories_found += 1
                if categories_found >= 2:
                    return True

        return False

    def _split_clauses(self, text: str) -> list[str]:
        """
        Tách câu thành danh sách clauses theo dấu phân tách.
        Lọc bỏ các clause quá ngắn (< 3 ký tự) hoặc rỗng.
        """
        parts = CLAUSE_SPLIT_PATTERN.split(text)
        clauses = [p.strip() for p in parts if p and len(p.strip()) >= 3]
        return clauses

    def _extract_global_location(self, entities: dict, clauses: list[str]) -> list[str]:
        """
        Lấy location tổng để kế thừa cho các clause không có location riêng.
        Ưu tiên: entities NER (đã được xử lý) → từ clause đầu tiên.
        """
        # Ưu tiên 1: Từ entities đã extract
        if entities and entities.get("location"):
            return [loc.lower() for loc in entities["location"]]

        # Ưu tiên 2: Phân tích clause đầu tiên
        if clauses:
            first_clause_loc = self._extract_location_from_text(clauses[0])
            if first_clause_loc:
                return first_clause_loc

        return []

    def _extract_location_from_text(self, text: str) -> list[str]:
        """
        Trích xuất tên địa điểm từ text bằng các pattern phổ biến.
        (Phiên bản đơn giản hóa — dùng khi entities chưa có location)
        """
        # Import local để tránh circular dependency
        try:
            from src.core.ner import extract_entities
            ents = extract_entities(text)
            if ents.get("location"):
                return [loc.lower() for loc in ents["location"]]
        except Exception:
            pass
        return []

    def _classify_clause(self, text: str) -> Optional[str]:
        """
        Phân loại 1 clause vào category phù hợp.
        Dùng CATEGORY_PRIORITY để ưu tiên category cụ thể hơn.
        """
        text_lower = text.lower()
        for cat_id in CATEGORY_PRIORITY:
            pattern = self._compiled_patterns[cat_id]
            if pattern.search(text_lower):
                return cat_id
        return None

    def _extract_keywords_from_clause(self, text: str, category: str) -> list[str]:
        """
        Trích xuất các từ khóa tìm kiếm cụ thể từ 1 clause.
        Ví dụ: clause="4 quán bán phở" → keywords=["phở"]
        """
        text_lower = text.lower()
        found_keywords = []
        cat_info = CATEGORIES.get(category, {})
        keywords_list = cat_info.get("keywords", [])

        # Sắp xếp từ dài trước để ưu tiên match cụm
        sorted_kws = sorted(keywords_list, key=len, reverse=True)

        for kw in sorted_kws:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                # Bỏ qua nếu keyword quá chung chung (ít hơn 3 ký tự)
                if len(kw) >= 3:
                    # Tránh thêm trùng
                    if kw not in found_keywords:
                        found_keywords.append(kw)
                        # Không thêm quá nhiều keyword 1 clause (tối đa 3)
                        if len(found_keywords) >= 3:
                            break

        return found_keywords

    def _process_clause(
        self,
        clause: str,
        global_location: list[str],
        seen_categories: list[str]
    ) -> Optional[SubIntent]:
        """
        Xử lý 1 clause → trả về SubIntent hoặc None nếu không classify được.

        Args:
            clause: Đoạn câu cần xử lý
            global_location: Location tổng để kế thừa nếu clause không có
            seen_categories: Các category đã thấy (để tránh trùng quá nhiều)
        """
        # Bỏ qua clause quá chung chung hoặc chỉ là câu chào
        generic_phrases = [
            "cho mình", "cho tôi", "cho anh", "cho chị",
            "bạn giúp", "bạn hãy", "giúp mình", "giúp tôi",
            "tôi vừa", "tôi đang", "tôi muốn", "mình muốn",
            "tôi cần", "mình cần", "bạn có thể",
        ]
        clause_lower = clause.lower()
        is_generic = any(phrase in clause_lower for phrase in generic_phrases)
        if is_generic and len(clause.split()) <= 5:
            return None

        # 1. Classify category
        category = self._classify_clause(clause)
        if not category:
            return None

        cat_info = CATEGORIES[category]

        # 2. Extract quantity
        quantity = get_quantity_or_default(clause)

        # 3. Extract keywords cụ thể
        keywords = self._extract_keywords_from_clause(clause, category)

        # 4. Extract location riêng của clause này
        clause_location = self._extract_location_from_text(clause)

        # 5. Location inheritance: nếu clause không có → dùng global
        final_location = clause_location if clause_location else global_location

        return SubIntent(
            category=category,
            category_label=cat_info["label"],
            category_emoji=cat_info["emoji"],
            quantity=quantity,
            keywords=keywords,
            location=final_location,
            recommender_intent=cat_info["recommender_intent"],
            filter_type=cat_info["filter_type"],
            original_clause=clause.strip(),
        )


# ==============================================================================
# MODULE-LEVEL INSTANCE (Singleton — tiết kiệm memory)
# ==============================================================================

_analyzer_instance: Optional[MultiIntentAnalyzer] = None


def get_multi_intent_analyzer() -> MultiIntentAnalyzer:
    """Lấy singleton instance của MultiIntentAnalyzer."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = MultiIntentAnalyzer()
    return _analyzer_instance
