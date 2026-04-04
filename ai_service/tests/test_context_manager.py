import pytest
from src.core.context_manager import ContextManager, detect_topic_change

@pytest.fixture
def manager():
    return ContextManager()

def test_save_and_get_context(manager):
    session_id = "test_user_1"
    entities = {"location": ["hà nội"], "food": ["phở"]}
    
    manager.save_context(session_id, entities, intent="tim_mon_an", recommendations=[])
    
    ctx = manager.get_context(session_id)
    assert ctx is not None
    assert ctx["last_intent"] == "tim_mon_an"
    assert "hà nội" in ctx["entities"]["location"]

def test_clear_context(manager):
    session_id = "test_clear"
    manager.save_context(session_id, {}, intent="tim_mon_an", recommendations=[])
    manager.clear_context(session_id)
    
    ctx = manager.get_context(session_id)
    assert ctx == {}

def test_merge_entities(manager):
    old_ctx = {
        "entities": {
            "location": ["hà nội"],
            "food": ["phở"],
            "place_type": []
        }
    }
    new_entities = {
        "location": [],
        "food": ["bún chả"],
        "place_type": []
    }
    
    # Merge context (kế thừa location, ghi đè food)
    merged = manager.merge_entities(new_entities, old_ctx, "tim_mon_an")
    assert "hà nội" in merged["location"]
    assert "bún chả" in merged["food"]
    assert "phở" not in merged["food"]

def test_detect_topic_change():
    old_ctx = {
        "entities": {"location": ["hà nội"], "food": ["phở"]}
    }
    new_entities_diff = {"location": ["đà nẵng"], "food": ["cà phê"]}
    new_entities_same = {"location": []}
    
    assert detect_topic_change(new_entities_diff, old_ctx) is True
    assert detect_topic_change(new_entities_same, old_ctx) is False
