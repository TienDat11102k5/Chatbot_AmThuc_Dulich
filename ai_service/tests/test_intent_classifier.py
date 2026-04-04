import pytest
from src.core.intent_classifier import IntentClassifier

@pytest.fixture(scope="module")
def classifier():
    try:
        return IntentClassifier()
    except Exception:
        pytest.skip("Model chưa được train, bỏ qua test IntentClassifier")

def test_predict_empty(classifier):
    res = classifier.predict_intent("   ")
    assert res["intent"] == "out_of_scope"
    assert res["confidence"] == 0.0

def test_calculate_confidence(classifier):
    conf = classifier._calculate_confidence([1.5, 0.5])
    assert isinstance(conf, float)
    assert 0 <= conf <= 1.0

def test_rule_based_food(classifier):
    # Dù NLP có thể đoán sai, rule-based sẽ override khi có đủ pattern cụ thể
    res = classifier.predict_intent("mình muốn tìm quán ăn ngon có phở")
    assert res["intent"] == "tim_mon_an"
    assert res["confidence"] >= 0.9

def test_rule_based_place(classifier):
    res = classifier.predict_intent("gợi ý vài khách sạn đẹp để nghỉ dưỡng")
    assert res["intent"] == "tim_dia_diem"
    assert res["confidence"] >= 0.9

def test_out_of_scope(classifier):
    res = classifier.predict_intent("giá vàng hôm nay bao nhiêu")
    assert res["intent"] == "out_of_scope"
