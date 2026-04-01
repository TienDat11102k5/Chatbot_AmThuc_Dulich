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
# MAPPING THÀNH PHỐ → TỈNH
# Vì database lưu location theo tên TỈNH, nhưng user thường hỏi theo tên THÀNH PHỐ
# Ví dụ: User hỏi "Đà Lạt" nhưng DB lưu "Lâm Đồng"
# ==============================================================================
CITY_TO_PROVINCE_MAPPING = {
    # Thành phố → Tỉnh
    "đà lạt": "lâm đồng",
    "da lat": "lâm đồng",
    "nha trang": "khánh hòa",
    "phan thiết": "bình thuận",
    "mũi né": "bình thuận",
    "vũng tàu": "bà rịa vũng tàu",
    "hội an": "quảng nam",
    "sapa": "lào cai",
    "sa pa": "lào cai",
    "huế": "thừa thiên huế",
    "quy nhơn": "bình định",
    "phan rang": "ninh thuận",
    "buôn ma thuột": "đắk lắk",
    "buon ma thuot": "đắk lắk",
    "pleiku": "gia lai",
    "long xuyên": "an giang",
    "rạch giá": "kiên giang",
    "rach gia": "kiên giang",
    "cà mau": "cà mau",
    "bạc liêu": "bạc liêu",
    "sóc trăng": "sóc trăng",
    "vĩnh long": "vĩnh long",
    "mỹ tho": "tiền giang",
    "my tho": "tiền giang",
    "bến tre": "bến tre",
    "ben tre": "bến tre",
    "trà vinh": "trà vinh",
    "tra vinh": "trà vinh",
    "cao lãnh": "đồng tháp",
    "cao lanh": "đồng tháp",
    "sa đéc": "đồng tháp",
    "sa dec": "đồng tháp",
    "châu đốc": "an giang",
    "chau doc": "an giang",
    "hạ long": "quảng ninh",
    "ha long": "quảng ninh",
    "móng cái": "quảng ninh",
    "mong cai": "quảng ninh",
    "tam kỳ": "quảng nam",
    "tam ky": "quảng nam",
    "đông hà": "quảng trị",
    "dong ha": "quảng trị",
    "đông hới": "quảng bình",
    "dong hoi": "quảng bình",
    "vinh": "nghệ an",
    "thanh hóa": "thanh hóa",
    "ninh bình": "ninh bình",
    "hải dương": "hải dương",
    "hưng yên": "hưng yên",
    "bắc ninh": "bắc ninh",
    "thái nguyên": "thái nguyên",
    "lạng sơn": "lạng sơn",
    "cao bằng": "cao bằng",
}

# ==============================================================================
# 2. TỪ ĐIỂN MÓN ĂN — DANH SÁCH CÁC MÓN/LOẠI THỰC PHẨM PHỔ BIẾN VIỆT NAM
# ==============================================================================
# Tại sao cần danh sách này?
# Khi người dùng gõ "Tìm quán phở ngon", chúng ta cần BẮT được từ "phở" 
# để biết người dùng muốn tìm MÓN ĂN GÌ, từ đó ghép cùng địa điểm để search.
FOOD_DICTIONARY = {
    # ================= PHỞ =================
    "phở", "pho", "phở bò", "phở gà", "phở tái", "phở nạm",
    "phở gân", "phở đặc biệt", "phở cuốn", "phở trộn",
    
    # ================= BÚN =================
    "bún", "bun",
    "bún bò", "bún bò huế", "bun bo hue",
    "bún chả", "bun cha",
    "bún riêu", "bun rieu",
    "bún ốc", "bun oc",
    "bún mắm", "bun mam",
    "bún thái", "bun thai",
    "bún cá", "bun ca",
    "bún đậu", "bún đậu mắm tôm", "bun dau",
    "bún thịt nướng", "bun thit nuong",
    "bún mọc", "bun moc",
    
    # ================= MÌ / HỦ TIẾU =================
    "mì quảng", "mỳ quảng", "mi quang",
    "mì xào", "mỳ xào", "mi xao",
    "mì cay", "mỳ cay", "mi cay",
    "mì hoành thánh", "mỳ hoành thánh", "mi hoanh thanh",
    "cao lầu", "cao lau",
    "hủ tiếu", "hu tieu",
    "hủ tiếu nam vang", "hu tieu nam vang",
    "hủ tiếu sa tế", "hu tieu sate",
    
    # ================= CƠM =================
    "cơm", "com",
    "cơm tấm", "com tam",
    "cơm chiên", "com chien",
    "cơm gà", "com ga",
    "cơm sườn", "com suon",
    "cơm rang", "com rang",
    "cơm niêu", "com nieu",
    "cơm cháy", "com chay",
    
    # ================= BÁNH =================
    "bánh mì", "banh mi",
    "bánh xèo", "banh xeo",
    "bánh cuốn", "banh cuon",
    "bánh canh", "banh canh",
    "bánh bèo", "banh beo",
    "bánh đập", "banh dap",
    "bánh tráng", "banh trang",
    "bánh tráng trộn", "banh trang tron",
    "bánh hỏi", "banh hoi",
    "bánh ướt", "banh uot",
    "bánh căn", "banh can",
    "bánh khọt", "banh khot",
    "bánh pía", "banh pia",
    "bánh tét", "banh tet",
    "bánh chưng", "banh chung",
    "bánh đa cua", "banh da cua",
    "bánh chuối", "bánh flan", "bánh bông lan", "bánh bao",
    "bánh ít", "bánh tráng nướng",
    "bánh nậm", "bánh lọc", "bánh ram ít",
    "bánh in", "bánh đậu xanh", "bánh dẻo", "bánh nướng",
    "bánh tiêu", "bánh cam", "bánh rán", "bánh su kem", "bánh pateso",
    
    # ================= CUỐN / CHIÊN =================
    "gỏi cuốn", "goi cuon",
    "nem rán", "nem ran",
    "chả giò", "cha gio",
    "nem nướng", "nem nuong",
    "chả cá", "cha ca",
    "chả lụa", "cha lua",
    
    # ================= CHÁO / XÔI =================
    "cháo", "chao",
    "cháo lòng", "chao long",
    "cháo gà", "chao ga",
    "cháo vịt", "chao vit",
    "xôi", "xoi",
    "xôi gà", "xoi ga",
    "xôi xéo", "xoi xeo",
    "xôi đậu", "xoi dau",
    
    # ================= LẨU =================
    "lẩu", "lau",
    "lẩu bò", "lau bo",
    "lẩu cá kèo", "lau ca keo",
    "lẩu thái", "lau thai",
    "lẩu hải sản", "lau hai san",
    "lẩu dê", "lau de",
    
    # ================= NƯỚNG / CHIÊN =================
    "thịt nướng", "thit nuong",
    "gà nướng", "ga nuong",
    "bò nướng", "bo nuong",
    "heo quay", "heo quay",
    "vịt quay", "vit quay",
    "gà luộc", "vịt lịm",
    
    # ================= HẢI SẢN =================
    "ốc", "oc", "ốc luộc",
    "nghêu", "ngheu",
    "sò", "so",
    "cua", "cua",
    "tôm", "tom",
    "mực", "muc",
    "hải sản", "hai san",
    
    # ================= MÓN ĐẶC SẢN =================
    "bò kho", "bo kho",
    "cà ri", "ca ri",
    "bún cá hải phòng", "bun ca hai phong",
    "súp cua",
    
    # ================= ĐỒ NGỌT =================
    "chè", "chè huế", "chè bắp", "chè đậu",
    "kem",
    
    # ================= ĐỒ ĂN VẶT =================
    "trà sữa", "tra sua",
    "trà chanh", "tra chanh",
    "cà phê", "ca phe",
    "sinh tố", "sinh to",
    "nước mía", "nuoc mia",
    "bắp xào", "bap xao",
    "khoai tây chiên", "khoai tay chien",
    "xúc xích", "xuc xich",
    
    # ================= STREET FOOD =================
    "phá lấu", "pha lau",
    "bột chiên", "bot chien",
    "há cảo", "ha cao",
    "sủi cảo", "sui cao",
    "dim sum",
    
    # ================= BUFFET =================
    "buffet", "buffet nướng",
    
    # --- Từ khóa liên quan đến ăn uống ---
    "ăn", "ăn gì", "món", "món ăn", "thức ăn", "đồ ăn",
    "đặc sản", "nổi tiếng", "truyền thống",
    "địa phương", "bản địa", "dân dã", "quê nhà",
    "ăn sáng", "ăn trưa", "ăn tối"
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
    "quán cà phê", "quán cafe", "cafe", "cà phê", "coffee", "cà_phê", "ca_phe",
    "quán trà", "quán nước", "quán giải khát",
    "quán bia", "bia hơi", "bar", "pub",
    "quán lẩu", "quán nướng", "quán buffet", "buffet",
    "khách sạn", "hotel", "homestay", "resort", "nhà nghỉ", "villa", "khu nghỉ dưỡng",
    "tiệm", "cửa hàng", "siêu thị", "chợ"
}


# ==============================================================================
# 4. SYNONYM MAP — TỪ ĐỒNG NGHĨA / BIỆT DANH → TỪ CHUẨN
# ==============================================================================
# Purpose: User gõ "lẩu cay ma la" → expand thành "lẩu thái" hoặc "lẩu cay"
# Giúp recommender tìm đúng kết quả hơn vì DB lưu tên chuẩn.
SYNONYM_MAP = {
    # === Đồ uống ===
    "trà đá": "trà",
    "nước chè": "trà",
    "nước đá chanh": "trà chanh",
    "cafe": "cà phê",
    "coffee": "cà phê",
    "caphe": "cà phê",
    "ca phe": "cà phê",
    "milk tea": "trà sữa",
    "tra sua": "trà sữa",
    "smoothie": "sinh tố",
    "juice": "nước ép",
    
    # === Món ăn biệt danh ===
    "spring rolls": "gỏi cuốn",
    "nem cuốn": "gỏi cuốn",
    "fried spring rolls": "nem rán",
    "egg rolls": "chả giò",
    "noodle soup": "phở",
    "pho": "phở",
    "rice paper": "bánh tráng",
    "baguette": "bánh mì",
    "banh mi": "bánh mì",
    "sandwich": "bánh mì",
    "hotpot": "lẩu",
    "hot pot": "lẩu",
    "lau cay": "lẩu cay",
    "lẩu cay ma la": "lẩu cay",
    "grilled": "nướng",
    "bbq": "nướng",
    "barbeque": "nướng",
    "seafood": "hải sản",
    
    # === Biệt danh vùng miền ===
    "phố cổ": "hà nội",
    "thành phố hoa": "đà lạt",
    "đảo ngọc": "phú quốc",
    "thành phố biển": "đà nẵng",
    "cố đô": "huế",
    "thủ đô": "hà nội",
    
    # === Loại hình ===
    "restaurant": "nhà hàng",
    "res": "nhà hàng",
    "quán nhậu": "quán bia",
    "pub": "quán bia",
    "beer": "bia",
    "bia tươi": "bia hơi",
    "beer club": "quán bia",
    "khach san": "khách sạn",
    "khu nghỉ dưỡng": "resort",
    "nha nghi": "nhà nghỉ"
}


# ==============================================================================
# 5. BẢNG SỬA LỖI CHÍNH TẢ MỞ RỘNG — STATIC TYPO MAP
# ==============================================================================
# Purpose: Sửa các lỗi gõ sai phổ biến TRƯỚC khi chạy NER.
# VD: "fở" → "phở", "bùn bò" → "bún bò", "đà lạc" → "đà lạt"
TYPO_MAP = {
    # === Lỗi phụ âm đầu ===
    "fở": "phở",
    "fở bò": "phở bò",
    "fở gà": "phở gà",
    "fở cuốn": "phở cuốn",
    
    # === Lỗi dấu thanh ===
    "bùn bò": "bún bò",
    "bùn bò huế": "bún bò huế",
    "bùn chả": "bún chả",
    "bùn riêu": "bún riêu",
    "bùn đậu": "bún đậu",
    "bùn ốc": "bún ốc",
    "bùn cá": "bún cá",
    "bành mì": "bánh mì",
    "bành xèo": "bánh xèo",
    "bành cuốn": "bánh cuốn",
    "bành canh": "bánh canh",
    "lâu bò": "lẩu bò",
    "lâu thái": "lẩu thái",
    "lâu hải sản": "lẩu hải sản",
    "côm tấm": "cơm tấm",
    "côm gà": "cơm gà",
    "côm chiên": "cơm chiên",
    "côm sườn": "cơm sườn",
    
    # === Lỗi nguyên âm ===
    "mỳ quảng": "mì quảng",  # mỳ → mì (chuẩn hóa)
    "hủ tiểu": "hủ tiếu",
    
    # === Lỗi location phổ biến ===
    "đà lạc": "đà lạt",  # c → t
    "đa lạt": "đà lạt",  # thiếu dấu
    "da lat": "đà lạt",
    "hà nôi": "hà nội",  # ô → ội
    "ha noi": "hà nội",
    "sài gon": "sài gòn",
    "sai gon": "sài gòn",
    "đà nãng": "đà nẵng",  # ã → ẵ
    "da nang": "đà nẵng",
    "nha trag": "nha trang",  # thiếu n
    "phú quốk": "phú quốc",
    "phu quoc": "phú quốc",
    "hội ann": "hội an",
    "hoi an": "hội an",
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
