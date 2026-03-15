"""
Script test chatbot trực tiếp trên terminal
Chạy: python chat_test.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.core.intent_classifier import IntentClassifier
from src.core.ner import extract_entities
from src.core.recommender import RecommenderSystem

def print_header():
    print("\n" + "="*60)
    print("  🤖 CHATBOT ẨM THỰC & DU LỊCH VIỆT NAM")
    print("="*60)
    print("Gõ 'exit' hoặc 'quit' để thoát")
    print("="*60 + "\n")

def print_result(user_input, result):
    print("\n" + "-"*60)
    print(f"❓ Bạn hỏi: {user_input}")
    print("-"*60)
    
    # Intent
    intent_map = {
        "tim_mon_an": "🍜 Tìm món ăn",
        "tim_dia_diem": "📍 Tìm địa điểm",
        "hoi_thoi_tiet": "🌤️  Hỏi thời tiết",
        "giao_tiep_bot": "💬 Giao tiếp"
    }
    intent_text = intent_map.get(result['intent'], result['intent'])
    print(f"\n🎯 Ý định: {intent_text}")
    print(f"   Độ tự tin: {result['confidence']*100:.1f}%")
    
    # Entities
    if result['entities']['food'] or result['entities']['location']:
        print(f"\n🔍 Từ khóa:")
        if result['entities']['food']:
            print(f"   Món ăn: {', '.join(result['entities']['food'])}")
        if result['entities']['location']:
            print(f"   Địa điểm: {', '.join(result['entities']['location'])}")

    # Recommendations
    if result['recommendations']:
        print(f"\n💡 Gợi ý (Top {len(result['recommendations'])}):")
        for i, rec in enumerate(result['recommendations'], 1):
            icon = "🍜" if rec['type'] == 'food' else "📍"
            print(f"\n   {i}. {icon} {rec['name']}")
            if rec.get('address'):
                print(f"      📍 {rec['address']}")
            else:
                print(f"      📍 {rec['location']}")
            print(f"      📝 {rec['description'][:80]}...")
            print(f"      🎯 Điểm: {rec['score']:.2f}")
    else:
        print("\n💡 Không tìm thấy gợi ý phù hợp")
    
    print("-"*60)

def main():
    print_header()
    
    # Load models
    print("⏳ Đang load AI models...")
    try:
        classifier = IntentClassifier()
        recommender = RecommenderSystem()
        print("✅ Sẵn sàng!\n")
    except Exception as e:
        print(f"❌ Lỗi khi load models: {e}")
        print("\nHãy chạy train_model.bat trước!")
        return
    
    # Chat loop
    while True:
        try:
            user_input = input("👤 Bạn: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['exit', 'quit', 'thoát', 'bye']:
                print("\n👋 Tạm biệt! Hẹn gặp lại!")
                break
            
            # Process
            # 1. Classify intent
            intent_result = classifier.predict_intent(user_input)
            
            # 2. Extract entities
            entities = extract_entities(user_input)
            
            # 3. Get recommendations
            recommendations = []
            if intent_result['intent'] in ['tim_mon_an', 'tim_dia_diem']:
                all_recommendations = recommender.recommend(entities, top_k=10)
                
                # Lọc theo intent
                if intent_result['intent'] == 'tim_mon_an':
                    # Chỉ lấy món ăn
                    recommendations = [r for r in all_recommendations if r['type'] == 'food'][:3]
                elif intent_result['intent'] == 'tim_dia_diem':
                    # Chỉ lấy địa điểm
                    recommendations = [r for r in all_recommendations if r['type'] == 'place'][:3]
            
            # Build result
            result = {
                'intent': intent_result['intent'],
                'confidence': intent_result['confidence'],
                'entities': entities,
                'recommendations': recommendations
            }
            
            # Print result
            print_result(user_input, result)
            
        except KeyboardInterrupt:
            print("\n\n👋 Tạm biệt!")
            break
        except Exception as e:
            print(f"\n❌ Lỗi: {e}")
            continue

if __name__ == "__main__":
    main()
