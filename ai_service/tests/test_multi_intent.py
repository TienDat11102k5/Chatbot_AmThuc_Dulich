import pytest
from src.api.router import detect_multi_intent

def test_detect_multi_intent_both():
    entities = {
        "food": ["phở"],
        "place_type": ["khách sạn"]
    }
    msg = "tìm khách sạn và quán phở"
    intents = detect_multi_intent(entities, msg)
    
    assert len(intents) == 2
    assert "tim_mon_an" in intents
    assert "tim_dia_diem" in intents

def test_detect_multi_intent_single_food():
    entities = {
        "food": ["bún bò"],
        "place_type": []
    }
    msg = "tìm bún bò"
    intents = detect_multi_intent(entities, msg)
    
    # Should fall back to list of length <= 1, usually the function just returns what corresponds.
    # Actually, detect_multi_intent returns multi intents if conditions are met. 
    # Nếu chỉ có 1, trả về 1 list chứa 1 intent
    assert len(intents) <= 1

def test_detect_multi_intent_single_place():
    entities = {
        "food": [],
        "place_type": ["resort"]
    }
    msg = "tìm resort đà lạt"
    intents = detect_multi_intent(entities, msg)
    
    # Ở đây hàm detect_multi_intent nhận dict entities và kiểm tra. Nếu chỉ có place_type, trả về tim_dia_diem.
    assert "tim_dia_diem" in intents
    assert "tim_mon_an" not in intents

def test_no_entities_fallback():
    entities = {
        "food": [],
        "place_type": []
    }
    msg = "alo"
    intents = detect_multi_intent(entities, msg)
    # Tùy thuộc implementation mà list sẽ fallback về tim_mon_an
    assert isinstance(intents, list)
    assert intents == ["tim_mon_an"]
