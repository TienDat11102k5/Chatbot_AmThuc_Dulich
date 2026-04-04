import re
from src.core.dictionaries import *

def extract_entities(text: str) -> dict:
    """
    Hàm chính: Trích xuất Thực thể (Entity Extraction) từ câu chat.
    
    Thuật toán hoạt động:
    1. Chuyển câu chat về chữ thường (lowercase) để so khớp với từ điển.
    2. Duyệt qua Từ điển Địa điểm, kiểm tra từng từ có xuất hiện trong câu không.
    3. Duyệt qua Từ điển Món ăn, kiểm tra từng từ có xuất hiện trong câu không.
    4. Duyệt qua Từ điển Loại địa điểm (place type), kiểm tra loại hình kinh doanh.
    5. Ưu tiên từ DÀI HƠN trước (ví dụ: "bún bò huế" > "bún bò" > "bún").
       Lý do: Nếu không ưu tiên dài → "bún bò huế" sẽ bị tách thành "bún" và "bò" riêng → sai nghĩa.
    6. Trả về Dict chứa 3 mảng: danh sách food[], location[], và place_type[] tìm được.
    
    Tham số:
        text (str): Câu chat gốc của người dùng (chưa qua xử lý nặng).
                    Ví dụ: "Ở Đà Lạt ăn lẩu bò chỗ nào ngon?"
                    
    Trả về:
        dict: {
            "food": ["lẩu bò"],        ← Mảng các món ăn phát hiện được
            "location": ["đà lạt"],     ← Mảng các địa điểm phát hiện được
            "place_type": ["nhà hàng"], ← Mảng các loại địa điểm (nhà hàng, quán cà phê...)
            "raw_query": "lẩu bò đà lạt" ← Chuỗi truy vấn ghép từ food+location (dùng cho Recommender)
        }
    """
    # Chuẩn hóa: Chuyển hết về chữ thường để so sánh công bằng
    text_lower = text.lower().strip()
    
    # Step 0: Spelling Correction — sửa lỗi chính tả TRƯỚC khi tìm entities
    text_lower = _apply_typo_correction(text_lower)
    
    # Step 0.5: Synonym Expansion — thay thế từ đồng nghĩa bằng từ chuẩn
    text_lower = _apply_synonym_expansion(text_lower)
    
    # Gọi hàm phụ để tìm kiếm từng loại Thực thể
    found_locations = _find_entities_in_text(text_lower, LOCATION_DICTIONARY)
    found_place_types = _find_entities_in_text(text_lower, PLACE_TYPE_DICTIONARY)
    found_foods = _find_entities_in_text(text_lower, FOOD_DICTIONARY)
    
    # MAP THÀNH PHỐ → TỈNH
    # Vì database lưu location theo tên TỈNH, cần convert tên thành phố sang tên tỉnh
    # Ví dụ: "đà lạt" → "lâm đồng"
    mapped_locations = []
    for loc in found_locations:
        # Nếu location là thành phố, map sang tỉnh
        if loc in CITY_TO_PROVINCE_MAPPING:
            province = CITY_TO_PROVINCE_MAPPING[loc]
            # Thêm cả tỉnh vào list (để search)
            if province not in mapped_locations:
                mapped_locations.append(province)
            # Giữ lại tên thành phố gốc để hiển thị cho user
            if loc not in mapped_locations:
                mapped_locations.append(loc)
        else:
            # Nếu đã là tỉnh hoặc không có trong mapping, giữ nguyên
            if loc not in mapped_locations:
                mapped_locations.append(loc)
    
    # Nếu không có mapping nào, giữ nguyên found_locations
    if not mapped_locations:
        mapped_locations = found_locations
    
    # Lọc bỏ các tính từ chung chung không phải món ăn thực sự
    # Ví dụ: "ngon", "tốt", "hay", "đẹp" không phải món ăn
    adjective_filter = {"ngon", "tốt", "hay", "đẹp", "rẻ", "bổ", "ngon bổ rẻ", 
                       "nổi tiếng", "truyền thống", "địa phương", "bản địa", "dân dã", "quê nhà",
                       "nhất", "tốt nhất", "ngon nhất", "hay nhất"}
    found_foods = [f for f in found_foods if f not in adjective_filter]
    
    # Phase 4: Lọc bỏ từ khóa giao tiếp bị nhầm thành món ăn
    # Ngăn "chào"/"chao" bị typo_corrections sửa thành "cháo" (món ăn)
    # → tránh rule-based override sai intent về tim_mon_an khi user chỉ chào hỏi
    CONVERSATION_KEYWORDS = {
        "chao", "chào",           # chào hỏi ≠ cháo (món ăn)
        "cam", "cám",             # cảm ơn ≠ cam (trái cây) - phòng hờ
    }
    found_foods = [f for f in found_foods if f not in CONVERSATION_KEYWORDS]
    
    # Chuẩn hóa các lỗi chính tả phổ biến
    # Map các biến thể sai dấu về dạng chuẩn
    typo_corrections = {
        "pho": "phở",
        "bun": "bún",
        "com": "cơm",
        "banh": "bánh",
        "cha": "chả",
        "chao": "cháo",
        "xoi": "xôi",
        "lau": "lẩu",
        "oc": "ốc",
        "tom": "tôm",
        "muc": "mực",
        "ca": "cá",
        "ga": "gà",
        "bo": "bò",
        "de": "dê",
        "nem": "nem",
        "che": "chè",
        "kem": "kem",
        "nuong": "nướng",
        "chien": "chiên",
        "luoc": "luộc",
        "hap": "hấp",
        "xao": "xào",
    }
    found_foods = [typo_corrections.get(f, f) for f in found_foods]
    
    # Ghép tất cả chữ tìm được thành 1 câu truy vấn gọn 
    # (được dung làm Input cho hàm Cosine Similarity ở recommender.py)
    # QUAN TRỌNG: Nếu user hỏi tên quán cụ thể (ví dụ: "Phở Thìn Bờ Hồ"),
    # cần giữ nguyên toàn bộ text thay vì chỉ lấy "phở"
    raw_query_parts = found_foods + mapped_locations
    
    # Nếu chỉ có món ăn đơn giản (phở, bún...) mà text gốc dài hơn nhiều
    # → có thể là tên quán cụ thể, giữ nguyên text
    # HOẶC nếu không có food entity nào → giữ nguyên text để search
    if (len(found_foods) == 1 and len(text_lower.split()) > 3) or len(found_foods) == 0:
        # Loại bỏ các từ dừng và giữ lại phần quan trọng
        words_to_remove = ["ở", "tại", "ở đâu", "như thế nào", "thế nào", "ra sao", "?", ".", "!", "quán"]
        cleaned_text = text_lower
        for word in words_to_remove:
            cleaned_text = cleaned_text.replace(word, "")
        raw_query = cleaned_text.strip()
    else:
        raw_query = " ".join(raw_query_parts) if raw_query_parts else text_lower
    
    return {
        "food": found_foods,
        "location": mapped_locations,  # Dùng mapped_locations thay vì found_locations
        "place_type": found_place_types,
        "raw_query": raw_query
    }


def _find_entities_in_text(text: str, dictionary: set) -> list:
    """
    Hàm phụ (Private): Tìm các từ/cụm từ trong Từ điển có xuất hiện trong câu chat.
    
    Thuật toán quan trọng: SẮP XẾP TỪ DÀI NHẤT TRƯỚC.
    Ví dụ với từ điển chứa: {"bún", "bún bò", "bún bò huế"}
    Câu chat: "tìm quán bún bò huế ngon"
    - Nếu không sort → có thể bắt được "bún" trước → bỏ mất "bún bò huế" → SAI!
    - Nếu sort dài trước → bắt được "bún bò huế" trước → ĐÚNG!
    
    Sau khi bắt được "bún bò huế", đánh dấu vùng đó đã dùng rồi, 
    các từ ngắn hơn trùng vị trí sẽ bị bỏ qua (tránh trùng lặp).
    
    Tham số:
        text (str): Câu chat đã chuyển về chữ thường.
        dictionary (set): Tập hợp các từ khóa cần tìm (LOCATION hoặc FOOD).
        
    Trả về:
        list: Danh sách các từ khóa đã tìm thấy, không trùng lặp.
    """
    found = []
    
    # Bước 1: Sắp xếp từ điển theo độ dài giảm dần (dài nhất lên đầu)
    sorted_dict = sorted(dictionary, key=len, reverse=True)
    
    # Bước 2: Tạo bản copy của text để đánh dấu vùng đã dùng
    # Mỗi khi tìm thấy 1 từ, thay nó bằng dấu sao (*) để không bắt trùng
    working_text = text
    
    for term in sorted_dict:
        # Dùng regex Vietnamese-safe word boundary thay vì substring match
        # Lý do: `\b` của Python không nhận ký tự có dấu tiếng Việt (ă, â, ê, ô, ơ, ư)
        # nên dùng negative lookbehind/lookahead với bộ ký tự Việt đầy đủ.
        # Ví dụ: "ốc" sẽ KHÔNG match trong "Bitcoin" nhưng VẪN match trong "Bún ốc"
        vn_char = r'a-zA-ZÀ-ỹ'
        pattern = r'(?<![' + vn_char + r'])' + re.escape(term) + r'(?![' + vn_char + r'])'
        if re.search(pattern, working_text):
            found.append(term)
            # Đánh dấu vùng đã bắt bằng cách thay thế bằng ký tự placeholder
            working_text = working_text.replace(term, "◆" * len(term), 1)
    
    return found


def _apply_typo_correction(text: str) -> str:
    """
    Áp dụng sửa lỗi chính tả từ TYPO_MAP trước khi chạy NER.
    Ưu tiên cụm từ dài nhất trước (same strategy as _find_entities_in_text).
    """
    sorted_typos = sorted(TYPO_MAP.keys(), key=len, reverse=True)
    for typo in sorted_typos:
        if typo in text:
            text = text.replace(typo, TYPO_MAP[typo])
    return text


def _apply_synonym_expansion(text: str) -> str:
    """
    Thay thế từ đồng nghĩa bằng từ chuẩn từ SYNONYM_MAP.
    Ưu tiên cụm từ dài nhất trước.
    """
    sorted_synonyms = sorted(SYNONYM_MAP.keys(), key=len, reverse=True)
    for synonym in sorted_synonyms:
        if synonym in text:
            text = text.replace(synonym, SYNONYM_MAP[synonym])
    return text


# ==============================================================================
# DEMO: Chạy thử trực tiếp file này bằng lệnh `python -m src.core.ner`
# ==============================================================================
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
        print(f"   🍜 Food:       {result['food']}")
        print(f"   📍 Location:   {result['location']}")
        print(f"   🏪 PlaceType:  {result['place_type']}")
        print(f"   🔗 Query:      \"{result['raw_query']}\")")
