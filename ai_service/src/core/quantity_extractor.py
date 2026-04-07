"""
File: src/core/quantity_extractor.py
Mục đích: Trích xuất số lượng (quantity) từ câu hỏi người dùng.
          Dùng trong multi-intent để biết user muốn bao nhiêu kết quả cho mỗi sub-intent.

Ví dụ:
    "3 địa điểm du lịch"  → 3
    "vài quán phở"        → 3 (mặc định cho "vài")
    "nhiều khách sạn"     → 5
    "quán cà phê ngon"    → None (không chỉ định → dùng giá trị mặc định)

Author: Antigravity — Multi-Intent Brain Optimization
"""

import re
from typing import Optional


# ==============================================================================
# CẤU HÌNH
# ==============================================================================

DEFAULT_QUANTITY = 3   # Số lượng mặc định khi user không chỉ định (đã chốt)
MAX_QUANTITY = 10      # Giới hạn tối đa để tránh quá tải DB

# Map từ chữ → số (tiếng Việt phổ thông)
WORD_TO_NUMBER = {
    # Số đếm cơ bản
    "một": 1,
    "hai": 2,
    "ba": 3,
    "bốn": 4,
    "bon": 4,           # Không dấu
    "năm": 5,
    "nam": 5,           # Không dấu
    "sáu": 6,
    "sau": 6,           # Không dấu
    "bảy": 7,
    "bay": 7,           # Không dấu
    "tám": 8,
    "tam": 8,           # Không dấu
    "chín": 9,
    "chin": 9,          # Không dấu
    "mười": 10,
    "muoi": 10,         # Không dấu

    # Từ chỉ lượng ước chừng
    "vài": 3,
    "vai": 3,           # Không dấu
    "một vài": 3,
    "mot vai": 3,
    "một số": 3,
    "mot so": 3,
    "mấy": 3,
    "may": 3,           # Không dấu
    "ít": 2,
    "it": 2,            # Không dấu
    "dăm": 3,
    "dam": 3,           # Không dấu
    "dăm ba": 3,
    "dam ba": 3,
    "khoảng": None,     # "khoảng 5" → lấy số sau từ này
    "khoang": None,
    "nhiều": 5,
    "nhieu": 5,         # Không dấu
    "một ít": 2,
    "mot it": 2,
    "vài ba": 3,
    "vai ba": 3,
    "top": None,        # "top 3" → lấy số sau từ này
    "danh sách": 5,
    "danh sach": 5,
    "liệt kê": 5,
    "liet ke": 5,
}


# ==============================================================================
# HÀM CHÍNH
# ==============================================================================

def extract_quantity(text: str) -> Optional[int]:
    """
    Trích xuất số lượng từ đoạn text.

    Chiến lược:
    1. Tìm số ngăn (digit pattern) trước từ chỉ loại (địa điểm, quán, khách sạn...)
    2. Tìm từ chỉ lượng (vài, nhiều, mấy...)
    3. Trả về None nếu không tìm thấy (caller sẽ dùng DEFAULT_QUANTITY)

    Args:
        text: Đoạn text cần phân tích (có thể là 1 clause hoặc cả câu)

    Returns:
        int | None: Số lượng tìm thấy (đã giới hạn MAX_QUANTITY), hoặc None

    Ví dụ:
        >>> extract_quantity("3 địa điểm du lịch nổi tiếng")
        3
        >>> extract_quantity("vài khách sạn")
        3
        >>> extract_quantity("nhiều quán cà phê")
        5
        >>> extract_quantity("quán phở ngon")
        None
    """
    if not text:
        return None

    text_lower = text.lower().strip()

    # --- Ưu tiên 1: Số nguyên trong text ("3 quán", "top 5", "khoảng 4") ---
    # Pattern: [từ modifier tùy chọn] + số + [từ chỉ loại]
    digit_patterns = [
        r'top\s+(\d+)',                    # "top 3"
        r'khoảng\s+(\d+)',                 # "khoảng 3"
        r'khoang\s+(\d+)',
        r'(\d+)\s+(?:địa điểm|nơi|chỗ)',  # "3 địa điểm", "3 nơi"
        r'(\d+)\s+(?:quán|nhà hàng)',      # "4 quán"
        r'(\d+)\s+(?:khách sạn|homestay|resort|villa|nhà nghỉ)',
        r'(\d+)\s+(?:quán cà phê|quán cafe|quán nước|cafe)',
        r'(\d+)\s+(?:món|đặc sản)',
        r'liệt kê\s+(\d+)',                # "liệt kê 3"
        r'liet ke\s+(\d+)',
        r'cho\s+(?:mình|tôi|tao|anh|chị|em)\s+(\d+)',  # "cho mình 3"
        r'gợi ý\s+(\d+)',                  # "gợi ý 5"
        r'goi y\s+(\d+)',
        r'tìm\s+(\d+)',                    # "tìm 3"
        r'(\d+)\s+',                       # Số bất kỳ (pattern cuối cùng — greedy)
    ]

    for pattern in digit_patterns:
        match = re.search(pattern, text_lower)
        if match:
            qty = int(match.group(1))
            return min(qty, MAX_QUANTITY)  # Giới hạn không vượt quá MAX

    # --- Ưu tiên 2: Từ chỉ lượng ước chừng ---
    # Sắp xếp theo độ dài giảm dần để bắt cụm dài trước (ví dụ: "một vài" trước "một")
    sorted_words = sorted(
        [(k, v) for k, v in WORD_TO_NUMBER.items() if v is not None],
        key=lambda x: len(x[0]),
        reverse=True
    )

    for word, qty in sorted_words:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return qty

    # --- Không tìm thấy ---
    return None


def get_quantity_or_default(text: str, default: int = DEFAULT_QUANTITY) -> int:
    """
    Trích xuất số lượng từ text, trả về giá trị mặc định nếu không có.

    Args:
        text: Đoạn text cần phân tích
        default: Giá trị mặc định nếu không tìm thấy số (mặc định = DEFAULT_QUANTITY = 3)

    Returns:
        int: Số lượng đã xác định

    Ví dụ:
        >>> get_quantity_or_default("3 quán phở")
        3
        >>> get_quantity_or_default("quán phở ngon")
        3  # Dùng default
        >>> get_quantity_or_default("quán phở ngon", default=5)
        5
    """
    qty = extract_quantity(text)
    return qty if qty is not None else default
