import pytest
import os
from src.core.recommender_postgres import RecommenderSystem

@pytest.fixture(scope="module")
def recommender():
    try:
        rec = RecommenderSystem()
        return rec
    except Exception as e:
        pytest.skip(f"Recommender initialization failed: {e}")

def test_recommender_basic_search(recommender):
    if not recommender or not recommender.ready:
        pytest.skip("Recommender not ready")
        
    entities = {
        "location": ["hà nội"],
        "food": ["phở"],
        "place_type": []
    }
    
    result = recommender.recommend(entities, intent="tim_mon_an", top_k=3, user_message="cho quán phở ngon ở hà nội")
    
    # Kể cả không có CSDL/CSV, hàm vẫn trả về dict có cấu trúc
    assert isinstance(result, dict)
    assert "results" in result
    assert isinstance(result["results"], list)

def test_recommender_empty_entities(recommender):
    if not recommender or not recommender.ready:
        pytest.skip("Recommender not ready")
        
    entities = {
        "location": [],
        "food": [],
        "place_type": []
    }
    
    result = recommender.recommend(entities, intent="tim_mon_an", top_k=3, user_message="cho xin quán ăn")
    assert isinstance(result, dict)
    assert "results" in result
    # Khi trống, có thể trả về default DB hoặc fallback (hoặc rỗng nếu không có dữ liệu)

def test_recommender_fallback_structure(recommender):
    if not recommender or not recommender.ready:
        pytest.skip("Recommender not ready")
        
    entities = {
        "location": ["đà lạt"],
        "food": [],
        "place_type": ["khách sạn"]
    }
    result = recommender.recommend(entities, intent="tim_dia_diem", top_k=2)
    assert isinstance(result, dict)
    
    if len(result["results"]) > 0:
        first_item = result["results"][0]
        assert "id" in first_item
        assert "name" in first_item
        assert "address" in first_item
