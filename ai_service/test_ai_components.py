"""
Script test các component AI riêng lẻ
Chạy: python test_ai_components.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.intent_classifier import IntentClassifier
from src.core.ner import extract_entities
from src.core.recommender_postgres import RecommenderSystem

def test_intent_classifier():
    """Test Intent Classification"""
    print("\n" + "="*50)
    print("🧠 TEST INTENT CLASSIFIER")
    print("="*50)
    
    try:
        classifier = IntentClassifier()
        
        test_cases = [
            "Phở Hà Nội ở đâu ngon?",
            "Đà Lạt có gì chơi?", 
            "Gần đây có quán nào không?",
            "Hôm nay thời tiết thế nào?",
            "Xin chào bạn"
        ]
        
        for text in test_cases:
            result = classifier.predict_intent(text)
            print(f"📝 '{text}'")
            print(f"   → Intent: {result['intent']} (confidence: {result['confidence']:.3f})")
            print()
            
        return True
        
    except Exception as e:
        print(f"❌ Lỗi Intent Classifier: {e}")
        return False

def test_ner():
    """Test Named Entity Recognition"""
    print("\n" + "="*50)
    print("🔍 TEST NER (Named Entity Recognition)")
    print("="*50)
    
    try:
        test_cases = [
            "Phở bò Hà Nội ở đâu ngon?",
            "Tìm quán lẩu ở Đà Lạt",
            "Bánh mì Sài Gòn",
            "Gần đây có gì ăn không?",
            "Nha Trang có địa điểm nào đẹp?"
        ]
        
        for text in test_cases:
            entities = extract_entities(text)
            print(f"📝 '{text}'")
            print(f"   → Food: {entities['food']}")
            print(f"   → Location: {entities['location']}")
            print(f"   → Query: '{entities['raw_query']}'")
            print()
            
        return True
        
    except Exception as e:
        print(f"❌ Lỗi NER: {e}")
        return False

def test_recommender():
    """Test Recommender System (PostgreSQL)"""
    print("\n" + "="*50)
    print("🎯 TEST RECOMMENDER SYSTEM (PostgreSQL)")
    print("="*50)
    
    try:
        recommender = RecommenderSystem()
        
        if not recommender.ready:
            print("❌ Recommender không sẵn sàng (có thể do PostgreSQL chưa chạy)")
            return False
        
        test_entities = [
            {"food": ["phở"], "location": ["hà nội"], "raw_query": "phở hà nội"},
            {"food": ["lẩu"], "location": ["đà lạt"], "raw_query": "lẩu đà lạt"},
            {"food": [], "location": ["nha trang"], "raw_query": "nha trang"},
            {"food": ["bánh mì"], "location": [], "raw_query": "bánh mì"}
        ]
        
        for entities in test_entities:
            print(f"🔍 Query: '{entities['raw_query']}'")
            results = recommender.recommend(entities, top_k=3)
            
            if results:
                for i, result in enumerate(results, 1):
                    print(f"   {i}. {result['name']} ({result['location']}) - Score: {result['score']}")
            else:
                print("   → Không tìm thấy kết quả")
            print()
            
        return True
        
    except Exception as e:
        print(f"❌ Lỗi Recommender: {e}")
        return False

def main():
    """Chạy tất cả test"""
    print("🚀 BẮT ĐẦU TEST AI COMPONENTS")
    
    results = []
    results.append(("Intent Classifier", test_intent_classifier()))
    results.append(("NER", test_ner()))
    results.append(("Recommender", test_recommender()))
    
    print("\n" + "="*50)
    print("📊 KẾT QUẢ TEST")
    print("="*50)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {name}")
    
    all_pass = all(result[1] for result in results)
    if all_pass:
        print("\n🎉 TẤT CẢ TEST THÀNH CÔNG! AI Service sẵn sàng.")
    else:
        print("\n⚠️ CÓ TEST THẤT BẠI. Kiểm tra lại cấu hình.")

if __name__ == "__main__":
    main()