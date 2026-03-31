"""
Script test các tính năng nâng cao (Phase 2, 3, 4) của AI Service
Chạy: python test_advanced_features.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.sentiment import analyze_sentiment
from src.core.clarification import should_ask_clarification, generate_clarification_message
from src.core.trip_planner import is_planning_request, extract_duration, generate_trip_plan
from src.core.ner import extract_entities

def test_sentiment():
    """Test Sentiment Analysis"""
    print("\n" + "="*50)
    print("🔵 TEST SENTIMENT ANALYSIS")
    print("="*50)
    
    test_cases = [
        "Quán này dở quá, không ngon.",
        "Phở ở đây ngon tuyệt vời, rất đáng tiền!",
        "Tìm quán cà phê ở đà lạt",
        "Đồ ăn bình thường, không quá tệ",
        "Tôi cực kỳ thất vọng với dịch vụ."
    ]
    
    success = True
    for text in test_cases:
        try:
            sentiment, score = analyze_sentiment(text)
            print(f"📝 '{text}'")
            print(f"   → Sentiment: {sentiment} (score: {score:.2f})")
            print()
        except Exception as e:
            print(f"❌ Lỗi với '{text}': {e}")
            success = False
            
    return success

def test_clarification():
    """Test Clarification Logic"""
    print("\n" + "="*50)
    print("🟢 TEST CLARIFICATION LOGIC")
    print("="*50)
    
    test_cases = [
        # Missing location -> Should ask
        ({"food": ["phở"], "location": [], "place_type": []}, "tim_mon_an"),
        ({"food": [], "location": [], "place_type": ["cà phê"]}, "tim_dia_diem"),
        
        # Have location -> Should NOT ask
        ({"food": ["bún bò"], "location": ["hà nội"], "place_type": []}, "tim_mon_an"),
        ({"food": [], "location": ["đà lạt"], "place_type": ["khách sạn"]}, "tim_dia_diem"),
        
        # Non-search intent -> Should NOT ask
        ({"food": ["phở"], "location": [], "place_type": []}, "giao_tiep_bot")
    ]
    
    success = True
    for entities, intent in test_cases:
        try:
            should_ask = should_ask_clarification(entities, intent)
            print(f"📝 Entities: {entities} | Intent: {intent}")
            print(f"   → Should Ask? {should_ask}")
            if should_ask:
                msg = generate_clarification_message(entities)
                print(f"   → Message: '{msg}'")
            print()
        except Exception as e:
            print(f"❌ Lỗi: {e}")
            success = False
            
    return success

def test_trip_planner():
    """Test Trip Planner Logic"""
    print("\n" + "="*50)
    print("🟣 TEST TRIP PLANNER LOGIC")
    print("="*50)
    
    # Test intent detection
    intent_cases = [
        "Lập kế hoạch đi đà lạt 3 ngày 2 đêm",
        "Gợi ý cho mình lịch trình vi vu hà nội 2 ngày nhé",
        "Phở hà nội ngon không?" # Not planning
    ]
    
    print("--- 1. Detect Planning Intent ---")
    for msg in intent_cases:
        is_planning = is_planning_request(msg)
        duration = extract_duration(msg)
        print(f"📝 '{msg}'")
        print(f"   → Is Planning? {is_planning} | Duration: {duration} ngày")
        
    print("\n--- 2. Generate Plan ---")
    # Mock data
    food_results = [
        {"name": "Phở Thìn", "location": "Hà Nội", "type": "nhà hàng"},
        {"name": "Bún chả Hương Liên", "location": "Hà Nội", "type": "quán ăn"},
        {"name": "Cà phê Giảng", "location": "Hà Nội", "type": "cà phê"}
    ]
    tourist_results = [
        {"name": "Hồ Hoàn Kiếm", "location": "Hà Nội", "type": "tham quan"},
        {"name": "Văn Miếu", "location": "Hà Nội", "type": "di tích"},
        {"name": "Lăng Bác", "location": "Hà Nội", "type": "di tích"}
    ]
    
    try:
        plan = generate_trip_plan("Hà Nội", 2, food_results, tourist_results)
        print("MOCK PLAN GENERATED:")
        print(plan[:200] + "...\n(truncated for brevity)")
        success = True
    except Exception as e:
        print(f"❌ Lỗi Plan Generation: {e}")
        success = False
        
    return success

def test_typo_synonym():
    """Test NER Typo Correction and Synonym Expansion"""
    print("\n" + "="*50)
    print("🟢 TEST TYPO & SYNONYM (NER)")
    print("="*50)
    
    test_cases = [
        "fở bò hà lội",           # Typo check
        "đà lạc có ks nào rẻ",      # Typo check
        "càfe đà nẽng",           # Typo check
        "quán nước gần đây",      # Synonym check
        "chỗ ngủ đà lạt",         # Synonym check
        "đồ ăn tphcm"             # Synonym check
    ]
    
    success = True
    for text in test_cases:
        try:
            entities = extract_entities(text)
            print(f"📝 Original: '{text}'")
            print(f"   → Processed Query: '{entities['raw_query']}'")
            print(f"   → Food: {entities['food']}")
            print(f"   → Location: {entities['location']}")
            print(f"   → Place Type: {entities['place_type']}")
            print()
        except Exception as e:
            print(f"❌ Lỗi với '{text}': {e}")
            success = False
            
    return success

def main():
    """Chạy tất cả test cho tính năng nâng cao"""
    print("🚀 BẮT ĐẦU TEST ADVANCED FEATURES")
    
    results = []
    results.append(("Sentiment Analysis", test_sentiment()))
    results.append(("Clarification Logic", test_clarification()))
    results.append(("Trip Planner", test_trip_planner()))
    results.append(("Typo & Synonym (NER)", test_typo_synonym()))
    
    print("\n" + "="*50)
    print("📊 KẾT QUẢ TEST NÂNG CAO")
    print("="*50)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {name}")
    
    all_pass = all(result[1] for result in results)
    if all_pass:
        print("\n🎉 TẤT CẢ TEST NÂNG CAO THÀNH CÔNG!")
    else:
        print("\n⚠️ CÓ TEST THẤT BẠI. Kiểm tra lại code.")

if __name__ == "__main__":
    main()
