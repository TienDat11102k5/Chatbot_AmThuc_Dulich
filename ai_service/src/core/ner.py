"""
File: src/core/ner.py
Mục đích: Trích xuất Thực thể (Named Entity Recognition - NER) từ câu chat của người dùng.
          Thực thể ở đây bao gồm 2 loại:
          1. Địa điểm (Location): Tên tỉnh thành, thành phố, vùng miền Việt Nam.
          2. Món ăn (Food): Tên các loại thức ăn, đồ uống phổ biến.
          
          Phương pháp: Sử dụng Regex (Biểu thức chính quy) kết hợp với Danh sách Từ điển 
          được chuẩn bị sẵn để dò và bắt từ khóa trong câu chat.
          Đây là phương pháp Rule-based (Dựa trên luật), không cần Train ML model.
"""

import re  # Thư viện Biểu thức chính quy để tìm kiếm chuỗi ký tự theo pattern

# ==============================================================================
# 1. TỪ ĐIỂN ĐỊA ĐIỂM — DANH SÁCH 63 TỈNH THÀNH VIỆT NAM + CÁC ĐỊA DANH NỔI TIẾNG
# ==============================================================================
# Tại sao cần danh sách này?
# Khi người dùng gõ "Ở Đà Lạt ăn gì ngon?", chúng ta cần BẮT được từ "Đà Lạt" 
# để biết người dùng đang hỏi về KHU VỰC NÀO, từ đó lọc kết quả tìm kiếm cho đúng.
#
# Lưu ý: Tất cả đều viết THƯỜNG vì ở bước tiền xử lý NLP (nlp_utils.py) 
# chúng ta đã .lower() hết rồi.
LOCATION_DICTIONARY = {
    # --- 63 Tỉnh/Thành phố (viết thường, có dấu) ---
    "hà nội", "hồ chí minh", "tphcm", "sài gòn", "tp hồ chí minh", "tp.hcm", "hcm",
    "hồ chín minh", "hồ chí min", "hcm city", "saigon", "đà nẵng", "hải phòng",
    "cần thơ", "an giang", "bà rịa vũng tàu", "vũng tàu", "bắc giang",
    "bắc kạn", "bạc liêu", "bắc ninh", "bến tre", "bình định",
    "bình dương", "bình phước", "bình thuận", "cà mau", "cao bằng",
    "đắk lắk", "đắk nông", "điện biên", "đồng nai", "đồng tháp",
    "gia lai", "hà giang", "hà nam", "hà tĩnh", "hải dương",
    "hậu giang", "hòa bình", "hưng yên", "khánh hòa", "kiên giang",
    "kon tum", "lai châu", "lâm đồng", "lạng sơn", "lào cai",
    "long an", "nam định", "nghệ an", "ninh bình", "ninh thuận",
    "phú thọ", "phú yên", "quảng bình", "quảng nam", "quảng ngãi",
    "quảng ninh", "quảng trị", "sóc trăng", "sơn la", "tây ninh",
    "thái bình", "thái nguyên", "thanh hóa", "thừa thiên huế",
    "tiền giang", "trà vinh", "tuyên quang", "vĩnh long", "vĩnh phúc",
    "yên bái",
    
    # --- Các quận/huyện TP.HCM ---
    "quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", 
    "quận 8", "quận 9", "quận 10", "quận 11", "quận 12", "quận bình thạnh",
    "quận tân bình", "quận tân phú", "quận phú nhuận", "quận gò vấp",
    "quận bình tân", "thủ đức", "tp thủ đức",
    
    # --- Các địa danh du lịch phổ biến (bổ sung thêm để bắt chuẩn hơn) ---
    "huế", "đà lạt", "hội an", "sapa", "sa pa", "nha trang",
    "phú quốc", "mũi né", "phan thiết", "hạ long", "vịnh hạ long",
    "phong nha", "bà nà", "bà nà hills", "tam đảo", "mộc châu",
    "quy nhơn", "phan rang", "côn đảo", "cát bà", "fansipan",
    "ninh kiều", "lăng cô", "cù lao chàm", "tam cốc", "tràng an",
    
    # --- Các vùng miền tổng quát ---
    "miền bắc", "miền trung", "miền nam", "miền tây", "tây nguyên",
    "đồng bằng sông cửu long", "duyên hải"
}

# ==============================================================================
# 2. TỪ ĐIỂN MÓN ĂN — DANH SÁCH CÁC MÓN/LOẠI THỰC PHẨM PHỔ BIẾN VIỆT NAM
# ==============================================================================
# Tại sao cần danh sách này?
# Khi người dùng gõ "Tìm quán phở ngon", chúng ta cần BẮT được từ "phở" 
# để biết người dùng muốn tìm MÓN ĂN GÌ, từ đó ghép cùng địa điểm để search.
FOOD_DICTIONARY = {
    # --- Các món phổ biến 3 miền ---
    "phở", "bún chả", "bún bò", "bún bò huế", "mì quảng", "cao lầu",
    "cơm tấm", "bánh mì", "bánh xèo", "bánh cuốn", "bánh canh",
    "hủ tiếu", "gỏi cuốn", "nem rán", "chả giò", "bún đậu",
    "bún đậu mắm tôm", "bún thịt nướng", "bún ốc", "bún riêu",
    "xôi", "xôi gà", "cháo lòng", "cháo", "lẩu", "lẩu bò",
    "lẩu cá kèo", "lẩu thái", "bánh đập", "bánh tráng trộn", "bánh tráng",
    
    # --- Các loại bánh ---
    "bánh chuối", "bánh flan", "bánh bông lan", "bánh bao", "bánh chưng",
    "bánh tét", "bánh ít", "bánh căn", "bánh khọt", "bánh tráng nướng",
    "bánh ướt", "bánh bèo", "bánh nậm", "bánh lọc", "bánh ram ít",
    "bánh pía", "bánh in", "bánh đậu xanh", "bánh dẻo", "bánh nướng",
    "bánh tiêu", "bánh cam", "bánh rán", "bánh su kem", "bánh pateso",
    
    # --- Hải sản và đặc sản ---
    "hải sản", "ốc", "ốc luộc", "cua", "tôm", "mực",
    "vịt lịm", "vịt quay", "gà nướng", "gà luộc",
    
    # --- Đồ ngọt, nước uống ---
    "chè", "chè huế", "chè bắp", "chè đậu",
    "trà sữa", "nước mía", "sinh tố", "kem",
    
    # --- Buffet, loại hình ăn uống ---
    "buffet", "buffet nướng", "súp cua", "cơm gà",
    "đặc sản", "đồ ăn", "thức ăn", "ăn sáng", "ăn trưa", "ăn tối",
    
    # --- Từ khóa liên quan đến ăn uống ---
    "ăn", "ăn gì", "món", "món ăn", "thức ăn", "đồ ăn",
    "ngon", "ngon bổ rẻ", "đặc sản", "nổi tiếng", "truyền thống",
    "địa phương", "bản địa", "dân dã", "quê nhà"
}

# ==============================================================================
# 3. TỪ ĐIỂN LOẠI ĐỊA ĐIỂM — DANH SÁCH CÁC LOẠI HÌNH KINH DOANH
# ==============================================================================
# Tại sao cần danh sách này?
# Khi người dùng gõ "nhà hàng nào ở tây ninh ăn ngon?", chúng ta cần BẮT được 
# từ "nhà hàng" để biết người dùng muốn tìm LOẠI ĐỊA ĐIỂM GÌ (place type),
# từ đó lọc kết quả chỉ trả về nhà hàng, không trả về quán cà phê.
PLACE_TYPE_DICTIONARY = {
    "nhà hàng", "quán ăn", "quán", "quán cơm", "cơm bình dân",
    "quán cà phê", "quán cafe", "cafe", "cà phê", "coffee",
    "quán trà", "trà sữa", "quán nước", "quán giải khát",
    "quán bia", "bia hơi", "bar", "pub",
    "quán lẩu", "quán nướng", "quán buffet",
    "tiệm", "cửa hàng", "siêu thị", "chợ"
}


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
    
    # Gọi hàm phụ để tìm kiếm từng loại Thực thể
    found_locations = _find_entities_in_text(text_lower, LOCATION_DICTIONARY)
    found_place_types = _find_entities_in_text(text_lower, PLACE_TYPE_DICTIONARY)
    found_foods = _find_entities_in_text(text_lower, FOOD_DICTIONARY)
    
    # Ghép tất cả chữ tìm được thành 1 câu truy vấn gọn 
    # (được dung làm Input cho hàm Cosine Similarity ở recommender.py)
    raw_query_parts = found_foods + found_locations
    raw_query = " ".join(raw_query_parts) if raw_query_parts else text_lower
    
    return {
        "food": found_foods,
        "location": found_locations,
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
