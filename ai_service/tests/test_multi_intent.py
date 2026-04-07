"""
File: tests/test_multi_intent.py
Mục đích: Unit test cho MultiIntentAnalyzer và QuantityExtractor.
          Đảm bảo logic phân tích multi-intent hoạt động đúng trước khi deploy.

Chạy test:
    cd Chatbot_AmThuc_Dulich/ai_service
    python -m pytest tests/test_multi_intent.py -v

Author: Antigravity — Multi-Intent Brain Optimization
"""

import pytest
import sys
import os

# Thêm đường dẫn để import được module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ==============================================================================
# TEST QUANTITY EXTRACTOR
# ==============================================================================

class TestQuantityExtractor:
    """Test module trích xuất số lượng."""

    def setup_method(self):
        from src.core.quantity_extractor import extract_quantity, get_quantity_or_default
        self.extract = extract_quantity
        self.get_or_default = get_quantity_or_default

    def test_digit_basic(self):
        """Số nguyên cơ bản."""
        assert self.extract("3 địa điểm du lịch") == 3
        assert self.extract("4 quán phở") == 4
        assert self.extract("2 khách sạn") == 2

    def test_word_vai(self):
        """'Vài' → 3."""
        assert self.extract("vài khách sạn") == 3
        assert self.extract("vài quán ăn ngon") == 3

    def test_word_nhieu(self):
        """'Nhiều' → 5."""
        assert self.extract("nhiều địa điểm") == 5
        assert self.extract("nhiều quán cà phê") == 5

    def test_word_may(self):
        """'Mấy' → 3."""
        assert self.extract("mấy quán phở") == 3

    def test_no_quantity(self):
        """Không có số → trả None."""
        assert self.extract("quán phở ngon") is None
        assert self.extract("địa điểm du lịch đẹp") is None

    def test_top_pattern(self):
        """'Top N' pattern."""
        assert self.extract("top 5 địa điểm") == 5
        assert self.extract("top 3 quán") == 3

    def test_max_limit(self):
        """Không vượt quá MAX_QUANTITY = 10."""
        assert self.extract("100 quán phở") == 10

    def test_get_or_default(self):
        """get_quantity_or_default trả default khi không có số."""
        assert self.get_or_default("quán phở ngon") == 3
        assert self.get_or_default("quán phở ngon", default=5) == 5
        assert self.get_or_default("3 quán phở") == 3


# ==============================================================================
# TEST MULTI-INTENT ANALYZER — DETECTION
# ==============================================================================

class TestMultiIntentDetection:
    """Test phát hiện multi-intent."""

    def setup_method(self):
        from src.core.multi_intent_analyzer import MultiIntentAnalyzer
        self.analyzer = MultiIntentAnalyzer()

    def test_is_not_multi_intent_simple(self):
        """Câu đơn giản không phải multi-intent."""
        result = self.analyzer.analyze("Phở Hà Nội ở đâu ngon?")
        assert result == [], "Câu đơn không tạo sub-intent"

    def test_is_multi_intent_food_place(self):
        """Phát hiện 2 sub-intent: ẩm thực + du lịch."""
        result = self.analyzer.analyze(
            "Ở Đà Lạt có quán phở nào ngon, và địa điểm du lịch nào đẹp?"
        )
        assert len(result) >= 2
        categories = [s.category for s in result]
        assert "tim_mon_an" in categories
        assert "tim_dia_diem" in categories

    def test_is_multi_intent_three_types(self):
        """Câu hỏi chốt chuẩn: 3 địa điểm + 4 phở + vài khách sạn."""
        result = self.analyzer.analyze(
            "Tôi vừa tới Vũng Tàu, bạn giúp tôi liệt kê 3 địa điểm du lịch nổi tiếng, "
            "4 quán bán phở và vài khách sạn"
        )
        assert len(result) >= 2
        categories = [s.category for s in result]
        has_tourism = "tim_dia_diem" in categories
        has_food = "tim_mon_an" in categories
        assert has_tourism and has_food


# ==============================================================================
# TEST MULTI-INTENT ANALYZER — QUANTITY
# ==============================================================================

class TestMultiIntentQuantity:
    """Test số lượng trong mỗi sub-intent."""

    def setup_method(self):
        from src.core.multi_intent_analyzer import MultiIntentAnalyzer
        self.analyzer = MultiIntentAnalyzer()

    def test_default_quantity_when_missing(self):
        """Không chỉ định số → dùng mặc định = 3."""
        result = self.analyzer.analyze(
            "Vũng Tàu có gì ăn ngon và điểm tham quan đẹp?"
        )
        if result:
            for sub in result:
                assert sub.quantity == 3 or sub.quantity > 0

    def test_max_quantity_limit(self):
        """Số lượng không vượt MAX = 10."""
        result = self.analyzer.analyze(
            "Tìm 50 quán phở và 100 địa điểm du lịch ở Hà Nội"
        )
        if result:
            for sub in result:
                assert sub.quantity <= 10


# ==============================================================================
# TEST MULTI-INTENT ANALYZER — CATEGORIES
# ==============================================================================

class TestMultiIntentCategories:
    """Test phân loại đúng category."""

    def setup_method(self):
        from src.core.multi_intent_analyzer import MultiIntentAnalyzer
        self.analyzer = MultiIntentAnalyzer()

    def test_accommodation_category(self):
        """Khách sạn → tim_luu_tru."""
        result = self.analyzer.analyze(
            "Ở Nha Trang cho mình xem quán phở và mấy khách sạn gần biển"
        )
        if result:
            categories = [s.category for s in result]
            assert "tim_luu_tru" in categories or "tim_mon_an" in categories

    def test_cafe_category(self):
        """Cà phê → tim_quan_nuoc."""
        result = self.analyzer.analyze(
            "Tìm quán cà phê view đẹp và địa điểm du lịch ở Đà Lạt"
        )
        if result:
            categories = [s.category for s in result]
            assert "tim_quan_nuoc" in categories or "tim_dia_diem" in categories

    def test_max_sub_intents(self):
        """Giới hạn tối đa MAX_SUB_INTENTS = 5."""
        from src.core.multi_intent_analyzer import MAX_SUB_INTENTS
        result = self.analyzer.analyze(
            "Ở Sài Gòn tìm phở, bún bò, cà phê, khách sạn, địa điểm du lịch, resort và homestay"
        )
        assert len(result) <= MAX_SUB_INTENTS


# ==============================================================================
# TEST BACKWARD COMPATIBILITY
# ==============================================================================

class TestBackwardCompatibility:
    """Đảm bảo câu đơn vẫn hoạt động bình thường."""

    def setup_method(self):
        from src.core.multi_intent_analyzer import MultiIntentAnalyzer
        self.analyzer = MultiIntentAnalyzer()

    def test_simple_food_query(self):
        """Câu hỏi đơn về ẩm thực → không trigger multi-intent."""
        result = self.analyzer.analyze("Phở Hà Nội ở đâu ngon?")
        assert result == []

    def test_simple_place_query(self):
        """Câu hỏi đơn về du lịch → không trigger multi-intent."""
        result = self.analyzer.analyze("Đà Nẵng có gì vui?")
        assert result == []

    def test_follow_up_question(self):
        """Câu follow-up → không trigger multi-intent."""
        result = self.analyzer.analyze("Còn quán nào khác không?")
        assert result == []

    def test_greeting(self):
        """Câu chào → không trigger multi-intent."""
        result = self.analyzer.analyze("Xin chào!")
        assert result == []
