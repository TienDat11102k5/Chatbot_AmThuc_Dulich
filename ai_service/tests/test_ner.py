from src.core.ner import extract_entities

def test_extract_location_basic():
    text = "tôi muốn đi hà nội hoặc đà nẵng chơi"
    entities = extract_entities(text)
    locations = entities.get("location", [])
    assert len(locations) > 0
    assert "hà nội" in locations or "đà nẵng" in locations

def test_extract_food_basic():
    text = "cho mình xin quán phở bò và bún chả"
    entities = extract_entities(text)
    foods = entities.get("food", [])
    assert "phở" in foods or "phở bò" in foods
    assert "bún chả" in foods

def test_extract_place_type_basic():
    text = "tìm khách sạn bình dân gần đây"
    entities = extract_entities(text)
    places = entities.get("place_type", [])
    assert "khách sạn" in places

def test_extract_entities_comprehensive():
    text = "tìm giúp quán phở ở quận 1 hồ chí minh"
    entities = extract_entities(text)
    
    # Food check
    assert "phở" in entities.get("food", [])
    
    # Location check
    locs = entities.get("location", [])
    assert "quận 1" in locs
    assert "hồ chí minh" in locs
