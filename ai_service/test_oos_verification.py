"""
OOS Verification Test — Full suite (v3)
Tests intent classifier + gibberish detector + NER word boundary
"""
import sys
import os

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8')

import re

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.core.intent_classifier import IntentClassifier

CONFIDENCE_THRESHOLD = 0.4
CONVERSATION_INTENTS = {"chao_hoi", "cam_on", "tam_biet", "hoi_thong_tin"}


def _is_gibberish(text: str) -> bool:
    """Mirror of router.py gibberish detector for standalone test."""
    cleaned = text.strip()

    # Rule 1: Quá ngắn (< 2 ký tự chữ cái)
    alpha_chars = re.sub(r'[^a-zA-ZÀ-ỹ]', '', cleaned)
    if len(alpha_chars) < 2:
        return True

    # Rule 2: Không chứa nguyên âm tiếng Việt nào
    vietnamese_vowels = set(
        'aeiouyàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệ'
        'ìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữự'
        'ỳýỷỹỵ'
    )
    lower_text = cleaned.lower()
    if not any(ch in vietnamese_vowels for ch in lower_text):
        return True

    # Rule 3: Cluster phụ âm liên tiếp > 3 ký tự
    consonant_pattern = re.compile(r'[bcdfghjklmnpqrstvwxz]{4,}', re.IGNORECASE)
    if consonant_pattern.search(lower_text):
        return True

    # Rule 4: String ngắn (≤ 6 chữ cái) có tỷ lệ phụ âm quá cao (>= 60%)
    if len(alpha_chars) <= 6:
        consonants = set('bcdfghjklmnpqrstvwxz')
        cons_count = sum(1 for ch in alpha_chars.lower() if ch in consonants)
        if len(alpha_chars) > 0 and cons_count / len(alpha_chars) >= 0.6:
            return True

    return False


# Test cases: (input_text, expected_behavior)
# "OOS" = should be rejected, "OK" = should pass through
TEST_CASES = [
    # ===== OUT-OF-SCOPE: Should be rejected =====
    ("Ai là tổng thống Mỹ", "OOS"),
    ("Giải phương trình x^2 = 4", "OOS"),
    ("Bitcoin giá bao nhiêu", "OOS"),
    ("Tôi bị đau đầu uống thuốc gì", "OOS"),
    ("MU đá mấy giờ hôm nay", "OOS"),
    ("Bạn có người yêu không", "OOS"),
    ("ChatGPT là gì", "OOS"),
    ("IELTS 7.0 khó không", "OOS"),
    ("Cổ phiếu nào nên mua", "OOS"),

    # ===== GIBBERISH: Should be rejected by detector =====
    ("asdfgh", "OOS"),
    ("xyz123", "OOS"),
    ("!!!", "OOS"),
    ("bcdfg", "OOS"),

    # ===== EDGE CASES OOS =====
    ("Uống thuốc gì trị cảm cúm", "OOS"),
    ("Ai phát minh ra điện", "OOS"),

    # ===== IN-SCOPE: Should pass through =====
    ("Phở Hà Nội ở đâu ngon", "OK"),
    ("Gợi ý quán cà phê ở Đà Lạt", "OK"),
    ("Tìm địa điểm du lịch ở Phú Quốc", "OK"),
    ("Bánh mì Sài Gòn", "OK"),
    ("Bún chả Hà Nội", "OK"),

    # ===== REGRESSION: NER word boundary =====
    ("Bún ốc Hà Nội", "OK"),

    # ===== CONVERSATION: Should pass through =====
    ("Xin chào", "OK"),
    ("Cảm ơn bạn", "OK"),
    ("Tạm biệt", "OK"),
    ("Bot biết gì", "OK"),
]


def main():
    print("=" * 60)
    print("🧪 OOS VERIFICATION TEST v3 (Full Suite)")
    print("=" * 60)

    classifier = IntentClassifier()

    passed = 0
    failed = 0

    for text, expected in TEST_CASES:
        # Step 0: Gibberish check (mirrors router.py)
        if _is_gibberish(text):
            intent = "gibberish"
            confidence = 0.0
            is_oos = True
        else:
            result = classifier.predict_intent(text)
            intent = result["intent"]
            confidence = result["confidence"]

            # OOS guard logic (mirrors router.py)
            is_oos = False
            if intent == "out_of_scope":
                is_oos = True
            elif confidence < CONFIDENCE_THRESHOLD and intent not in CONVERSATION_INTENTS:
                is_oos = True

        actual = "OOS" if is_oos else "OK"
        status = "PASS" if actual == expected else "FAIL"

        if status == "PASS":
            passed += 1
            icon = "✅"
        else:
            failed += 1
            icon = "❌"

        print(
            f"  {icon} [{status}] \"{text}\"\n"
            f"       Intent={intent}, Confidence={confidence:.3f}, "
            f"Result={actual}, Expected={expected}"
        )

    total = passed + failed
    pct = passed * 100 // total if total > 0 else 0
    print(f"\n{'=' * 60}")
    print(f"📊 RESULTS: {passed}/{total} passed ({pct}%)")

    if failed > 0:
        print(f"⚠️  {failed} test(s) FAILED — review results above")
        return 1
    else:
        print("✅ All tests PASSED!")
        return 0


if __name__ == "__main__":
    sys.exit(main())
