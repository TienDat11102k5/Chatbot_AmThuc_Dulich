"""
File: src/core/ner.py
Mục đích: Facade design pattern cho việc trích xuất Thực thể (Named Entity Recognition - NER).
          Thực tế logic đã được tách ra 2 file:
          1. src/core/dictionaries.py: chứa toàn bộ từ điển và patterns.
          2. src/core/extractors.py: chứa logic xử lý regex và chuẩn hóa string.
          File này đóng vai trò cầu nối, đảm bảo backwards compatibility.
"""

from src.core.extractors import extract_entities

# Expose everything to maintain backward compatibility if other modules imported dictionaries directly
from src.core.dictionaries import *
from src.core.extractors import *

if __name__ == "__main__":
    # Danh sách các câu test thử đa dạng để kiểm tra NER có bắt đúng không
    test_sentences = [
        "Ở Đà Lạt ăn lẩu bò chỗ nào ngon?",
        "Gợi ý quán phở ở Hà Nội đi bạn",
        "Tìm quán bún bò huế gần đây",
        "Có gì ăn ở Sài Gòn không",
        "Bánh mì Hội An ngon hay Đà Nẵng ngon hơn",
        "Đặc sản miền Tây là gì",
        "nhà hàng nào ở tây ninh ăn ngon?",
        "quán cà phê nào ở hà nội view đẹp?",
    ]
    
    print("="*55)
    print(" 🔍 DEMO: Trích xuất Thực thể (NER)")
    print("="*55)
    
    for sentence in test_sentences:
        result = extract_entities(sentence)
        print(f"\n📩 Input:      \"{sentence}\"")
        print(f"   🍜 Food:       {result.get('food')}")
        print(f"   📍 Location:   {result.get('location')}")
        print(f"   🏪 PlaceType:  {result.get('place_type')}")
        print(f"   🔗 Query:      \"{result.get('raw_query')}\"")
