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
    # ========================================================================
    # A. 63 TỈNH/THÀNH PHỐ HIỆN TẠI (có dấu, viết thường)
    # ========================================================================
    "hà nội", "hồ chí minh", "tphcm", "sài gòn", "tp hồ chí minh", "tp.hcm", "hcm",
    "hồ chín minh", "hồ chí min", "hcm city", "saigon", "thành phố hồ chí minh",
    "đà nẵng", "hải phòng", "cần thơ",
    "an giang", "bà rịa vũng tàu", "bắc giang", "bắc kạn", "bạc liêu",
    "bắc ninh", "bến tre", "bình định", "bình dương", "bình phước",
    "bình thuận", "cà mau", "cao bằng", "đắk lắk", "đắk nông",
    "điện biên", "đồng nai", "đồng tháp", "gia lai", "hà giang",
    "hà nam", "hà tĩnh", "hải dương", "hậu giang", "hòa bình",
    "hưng yên", "khánh hòa", "kiên giang", "kon tum", "lai châu",
    "lâm đồng", "lạng sơn", "lào cai", "long an", "nam định",
    "nghệ an", "ninh bình", "ninh thuận", "phú thọ", "phú yên",
    "quảng bình", "quảng nam", "quảng ngãi", "quảng ninh", "quảng trị",
    "sóc trăng", "sơn la", "tây ninh", "thái bình", "thái nguyên",
    "thanh hóa", "thừa thiên huế", "tiền giang", "trà vinh", "tuyên quang",
    "vĩnh long", "vĩnh phúc", "yên bái",

    # ========================================================================
    # B. QUẬN/HUYỆN TP.HCM (22 quận/huyện + thành phố Thủ Đức)
    # ========================================================================
    "quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7",
    "quận 8", "quận 9", "quận 10", "quận 11", "quận 12",
    "quận bình thạnh", "bình thạnh",
    "quận tân bình", "tân bình",
    "quận tân phú", "tân phú",
    "quận phú nhuận", "phú nhuận",
    "quận gò vấp", "gò vấp",
    "quận bình tân", "bình tân",
    "thủ đức", "tp thủ đức", "thành phố thủ đức",
    "huyện bình chánh", "bình chánh",
    "huyện hóc môn", "hóc môn",
    "huyện củ chi", "củ chi",
    "huyện nhà bè", "nhà bè",
    "huyện cần giờ", "cần giờ",

    # ========================================================================
    # C. QUẬN/HUYỆN HÀ NỘI (30 quận/huyện)
    # ========================================================================
    "quận hoàn kiếm", "hoàn kiếm",
    "quận ba đình", "ba đình",
    "quận đống đa", "đống đa",
    "quận hai bà trưng", "hai bà trưng",
    "quận cầu giấy", "cầu giấy",
    "quận thanh xuân", "thanh xuân",
    "quận hoàng mai", "hoàng mai",
    "quận long biên", "long biên",
    "quận tây hồ", "tây hồ",
    "quận nam từ liêm", "nam từ liêm",
    "quận bắc từ liêm", "bắc từ liêm",
    "quận hà đông", "hà đông",
    "huyện đông anh", "đông anh",
    "huyện gia lâm", "gia lâm",
    "huyện sóc sơn", "sóc sơn",
    "huyện thanh trì", "thanh trì",
    "huyện thường tín", "thường tín",
    "huyện hoài đức", "hoài đức",
    "huyện đan phượng", "đan phượng",
    "huyện chương mỹ", "chương mỹ",
    "thị xã sơn tây", "sơn tây",

    # ========================================================================
    # D. QUẬN/HUYỆN ĐÀ NẴNG (8 quận/huyện)
    # ========================================================================
    "quận hải châu", "hải châu",
    "quận thanh khê", "thanh khê",
    "quận sơn trà", "sơn trà",
    "quận ngũ hành sơn", "ngũ hành sơn",
    "quận liên chiểu", "liên chiểu",
    "quận cẩm lệ", "cẩm lệ",
    "huyện hòa vang", "hòa vang",
    "huyện hoàng sa", "hoàng sa",

    # ========================================================================
    # E. QUẬN/HUYỆN CẦN THƠ (9 quận/huyện)
    # ========================================================================
    "quận ninh kiều", "ninh kiều",
    "quận bình thủy", "bình thủy",
    "quận cái răng", "cái răng",
    "quận ô môn", "ô môn",
    "quận thốt nốt", "thốt nốt",
    "huyện phong điền", "phong điền",
    "huyện cờ đỏ", "cờ đỏ",
    "huyện thới lai", "thới lai",
    "huyện vĩnh thạnh",

    # ========================================================================
    # F. QUẬN/HUYỆN HẢI PHÒNG
    # ========================================================================
    "quận hồng bàng", "hồng bàng",
    "quận lê chân", "lê chân",
    "quận ngô quyền", "ngô quyền",
    "quận kiến an", "kiến an",
    "quận đồ sơn", "đồ sơn",
    "huyện thủy nguyên", "thủy nguyên",

    # ========================================================================
    # G. ĐỊA DANH DU LỊCH NỔI TIẾNG
    # ========================================================================
    "huế", "đà lạt", "hội an", "sapa", "sa pa", "nha trang",
    "phú quốc", "mũi né", "phan thiết", "hạ long", "vịnh hạ long",
    "phong nha", "bà nà", "bà nà hills", "tam đảo", "mộc châu",
    "quy nhơn", "phan rang", "côn đảo", "cát bà", "fansipan",
    "ninh kiều", "lăng cô", "cù lao chàm", "tam cốc", "tràng an",
    "bãi cháy", "tuần châu", "cô tô", "vân đồn", "bái đính",
    "tam chúc", "tây thiên", "yên tử", "ba vì", "tam đảo",
    "cúc phương", "bến en", "phong nha kẻ bàng",
    "bảo lộc", "cam ranh", "dốc lết", "vịnh vân phong",
    "an bàng", "cửa đại", "mỹ khê", "non nước",
    "bãi dài", "vinpearl", "long hải", "hồ tràm", "bình châu",
    "mũi kê gà", "đồi cát đỏ", "đồi cát vàng",

    # ========================================================================
    # H. THÀNH PHỐ THUỘC TỈNH (TP loại I, II, III)
    # ========================================================================
    "vũng tàu", "biên hòa", "thủ dầu một", "mỹ tho", "long xuyên",
    "rạch giá", "cà mau", "bạc liêu", "sóc trăng", "vĩnh long",
    "trà vinh", "bến tre", "cao lãnh", "sa đéc", "châu đốc",
    "hạ long", "móng cái", "uông bí", "cẩm phả",
    "tam kỳ", "đông hà", "đông hới", "vinh", "hà tĩnh",
    "buôn ma thuột", "pleiku", "kon tum", "đà lạt", "bảo lộc",
    "phan rang", "phan thiết", "cam ranh", "nha trang",
    "quy nhơn", "tuy hòa",
    "thái nguyên", "việt trì", "lạng sơn", "cao bằng",
    "lào cai", "yên bái", "tuyên quang", "hà giang",
    "sơn la", "điện biên phủ", "lai châu",
    "nam định", "ninh bình", "hải dương", "hưng yên", "bắc ninh",
    "thái bình", "thanh hóa",

    # ========================================================================
    # I. TỈNH CŨ ĐÃ SÁP NHẬP (Lịch sử hành chính Việt Nam)
    # ========================================================================
    # Hà Tây (sáp nhập vào Hà Nội 2008)
    "hà tây",
    # Hà Sơn Bình (chia thành Hà Tây + Hòa Bình 1991)
    "hà sơn bình",
    # Nghĩa Bình (chia thành Quảng Ngãi + Bình Định 1989)
    "nghĩa bình",
    # Phú Khánh (chia thành Phú Yên + Khánh Hòa 1989)
    "phú khánh",
    # Thuận Hải (chia thành Ninh Thuận + Bình Thuận 1992)
    "thuận hải",
    # Sông Bé (đổi thành Bình Dương + Bình Phước 1997)
    "sông bé",
    # Đắk Lắk cũ (chia thành Đắk Lắk + Đắk Nông 2004)
    "đắk lắk cũ",
    # Cần Thơ cũ (chia thành TP Cần Thơ + Hậu Giang 2004)
    "cần thơ cũ",
    # Lai Châu cũ (chia thành Lai Châu + Điện Biên 2004)
    "lai châu cũ",
    # Vĩnh Phú (chia thành Vĩnh Phúc + Phú Thọ 1997)
    "vĩnh phú",
    # Hà Bắc (chia thành Bắc Giang + Bắc Ninh 1997)
    "hà bắc",
    # Minh Hải (chia thành Cà Mau + Bạc Liêu 1997)
    "minh hải",
    # Nam Hà (chia thành Nam Định + Hà Nam 1997)
    "nam hà",
    # Hải Hưng (chia thành Hải Dương + Hưng Yên 1997)
    "hải hưng",
    # Quảng Nam - Đà Nẵng (chia thành Quảng Nam + TP Đà Nẵng 1997)
    "quảng nam đà nẵng",

    # ========================================================================
    # J. VÙNG MIỀN TỔNG QUÁT
    # ========================================================================
    "miền bắc", "miền trung", "miền nam", "miền tây", "tây nguyên",
    "đồng bằng sông cửu long", "duyên hải", "đông nam bộ", "tây nam bộ",
    "bắc trung bộ", "nam trung bộ", "đồng bằng bắc bộ", "đông bắc bộ",
    "tây bắc bộ",
}


# ==============================================================================
# MAPPING THÀNH PHỐ → TỈNH
# Vì database lưu location theo tên TỈNH, nhưng user thường hỏi theo tên THÀNH PHỐ
# Ví dụ: User hỏi "Đà Lạt" nhưng DB lưu "Lâm Đồng"
# ==============================================================================
CITY_TO_PROVINCE_MAPPING = {
    # ========================================================================
    # A. THÀNH PHỐ → TỈNH (cơ bản)
    # ========================================================================
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
    "biên hòa": "đồng nai",
    "bien hoa": "đồng nai",
    "thủ dầu một": "bình dương",
    "thu dau mot": "bình dương",
    "bảo lộc": "lâm đồng",
    "bao loc": "lâm đồng",
    "cam ranh": "khánh hòa",
    "uông bí": "quảng ninh",
    "cẩm phả": "quảng ninh",
    "tuy hòa": "phú yên",
    "tuy hoa": "phú yên",
    "việt trì": "phú thọ",
    "viet tri": "phú thọ",
    "điện biên phủ": "điện biên",
    "dien bien phu": "điện biên",

    # ========================================================================
    # B. QUẬN/HUYỆN TP.HCM → hồ chí minh
    # ========================================================================
    "quận 1": "hồ chí minh", "quận 2": "hồ chí minh", "quận 3": "hồ chí minh",
    "quận 4": "hồ chí minh", "quận 5": "hồ chí minh", "quận 6": "hồ chí minh",
    "quận 7": "hồ chí minh", "quận 8": "hồ chí minh", "quận 9": "hồ chí minh",
    "quận 10": "hồ chí minh", "quận 11": "hồ chí minh", "quận 12": "hồ chí minh",
    "bình thạnh": "hồ chí minh", "quận bình thạnh": "hồ chí minh",
    "tân bình": "hồ chí minh", "quận tân bình": "hồ chí minh",
    "tân phú": "hồ chí minh", "quận tân phú": "hồ chí minh",
    "phú nhuận": "hồ chí minh", "quận phú nhuận": "hồ chí minh",
    "gò vấp": "hồ chí minh", "quận gò vấp": "hồ chí minh",
    "bình tân": "hồ chí minh", "quận bình tân": "hồ chí minh",
    "thủ đức": "hồ chí minh", "tp thủ đức": "hồ chí minh", "thành phố thủ đức": "hồ chí minh",
    "bình chánh": "hồ chí minh", "huyện bình chánh": "hồ chí minh",
    "hóc môn": "hồ chí minh", "huyện hóc môn": "hồ chí minh",
    "củ chi": "hồ chí minh", "huyện củ chi": "hồ chí minh",
    "nhà bè": "hồ chí minh", "huyện nhà bè": "hồ chí minh",
    "cần giờ": "hồ chí minh", "huyện cần giờ": "hồ chí minh",

    # ========================================================================
    # C. QUẬN/HUYỆN HÀ NỘI → hà nội
    # ========================================================================
    "hoàn kiếm": "hà nội", "quận hoàn kiếm": "hà nội",
    "ba đình": "hà nội", "quận ba đình": "hà nội",
    "đống đa": "hà nội", "quận đống đa": "hà nội",
    "hai bà trưng": "hà nội", "quận hai bà trưng": "hà nội",
    "cầu giấy": "hà nội", "quận cầu giấy": "hà nội",
    "thanh xuân": "hà nội", "quận thanh xuân": "hà nội",
    "hoàng mai": "hà nội", "quận hoàng mai": "hà nội",
    "long biên": "hà nội", "quận long biên": "hà nội",
    "tây hồ": "hà nội", "quận tây hồ": "hà nội",
    "nam từ liêm": "hà nội", "quận nam từ liêm": "hà nội",
    "bắc từ liêm": "hà nội", "quận bắc từ liêm": "hà nội",
    "hà đông": "hà nội", "quận hà đông": "hà nội",
    "đông anh": "hà nội", "huyện đông anh": "hà nội",
    "gia lâm": "hà nội", "huyện gia lâm": "hà nội",
    "sóc sơn": "hà nội", "huyện sóc sơn": "hà nội",
    "thanh trì": "hà nội", "huyện thanh trì": "hà nội",
    "sơn tây": "hà nội", "thị xã sơn tây": "hà nội",

    # ========================================================================
    # D. QUẬN/HUYỆN ĐÀ NẴNG → đà nẵng
    # ========================================================================
    "hải châu": "đà nẵng", "quận hải châu": "đà nẵng",
    "thanh khê": "đà nẵng", "quận thanh khê": "đà nẵng",
    "sơn trà": "đà nẵng", "quận sơn trà": "đà nẵng",
    "ngũ hành sơn": "đà nẵng", "quận ngũ hành sơn": "đà nẵng",
    "liên chiểu": "đà nẵng", "quận liên chiểu": "đà nẵng",
    "cẩm lệ": "đà nẵng", "quận cẩm lệ": "đà nẵng",

    # ========================================================================
    # E. QUẬN/HUYỆN CẦN THƠ → cần thơ
    # ========================================================================
    "ninh kiều": "cần thơ", "quận ninh kiều": "cần thơ",
    "bình thủy": "cần thơ", "quận bình thủy": "cần thơ",
    "cái răng": "cần thơ", "quận cái răng": "cần thơ",
    "ô môn": "cần thơ", "quận ô môn": "cần thơ",
    "thốt nốt": "cần thơ", "quận thốt nốt": "cần thơ",

    # ========================================================================
    # F. QUẬN/HUYỆN HẢI PHÒNG → hải phòng
    # ========================================================================
    "đồ sơn": "hải phòng", "quận đồ sơn": "hải phòng",
    "hồng bàng": "hải phòng", "quận hồng bàng": "hải phòng",
    "lê chân": "hải phòng", "quận lê chân": "hải phòng",
    "cát bà": "hải phòng",

    # ========================================================================
    # G. ĐỊA DANH DU LỊCH → TỈNH
    # ========================================================================
    "mỹ khê": "đà nẵng",
    "non nước": "đà nẵng",
    "bà nà": "đà nẵng", "bà nà hills": "đà nẵng",
    "cù lao chàm": "quảng nam",
    "an bàng": "quảng nam", "cửa đại": "quảng nam",
    "lăng cô": "thừa thiên huế",
    "tam cốc": "ninh bình", "tràng an": "ninh bình", "bái đính": "ninh bình",
    "tam chúc": "hà nam",
    "bãi cháy": "quảng ninh", "tuần châu": "quảng ninh",
    "cô tô": "quảng ninh", "vân đồn": "quảng ninh",
    "yên tử": "quảng ninh",
    "ba vì": "hà nội",
    "fansipan": "lào cai",
    "cúc phương": "ninh bình",
    "phong nha": "quảng bình", "phong nha kẻ bàng": "quảng bình",
    "bến en": "thanh hóa",
    "tây thiên": "vĩnh phúc",
    "tam đảo": "vĩnh phúc",
    "mộc châu": "sơn la",
    "bãi dài": "khánh hòa", "vinpearl": "khánh hòa",
    "dốc lết": "khánh hòa", "vịnh vân phong": "khánh hòa",
    "long hải": "bà rịa vũng tàu", "hồ tràm": "bà rịa vũng tàu",
    "bình châu": "bà rịa vũng tàu",
    "côn đảo": "bà rịa vũng tàu",
    "mũi kê gà": "bình thuận",
    "đồi cát đỏ": "bình thuận", "đồi cát vàng": "bình thuận",
    "phú quốc": "kiên giang",

    # ========================================================================
    # H. SÁP NHẬP 2025 (NQ 202/2025/QH15) → Mapping tỉnh cũ → tỉnh mới
    # ========================================================================
    # HCM mở rộng
    "bình dương": "hồ chí minh",
    "bà rịa vũng tàu": "hồ chí minh",
    # Hải Phòng mở rộng
    "hải dương": "hải phòng",
    # Đà Nẵng mở rộng
    "quảng nam": "đà nẵng",
    # Cần Thơ mở rộng
    "hậu giang": "cần thơ",
    "sóc trăng": "cần thơ",
    # Tuyên Quang mới
    "hà giang": "tuyên quang",
    # Lào Cai mới
    "yên bái": "lào cai",
    # Thái Nguyên mới
    "bắc kạn": "thái nguyên",
    # Phú Thọ mới
    "vĩnh phúc": "phú thọ",
    "hòa bình": "phú thọ",
    # Bắc Ninh mới
    "bắc giang": "bắc ninh",
    # Hưng Yên mới
    "thái bình": "hưng yên",
    # Ninh Bình mới
    "nam định": "ninh bình",
    "hà nam": "ninh bình",
    # Quảng Trị mới
    "quảng bình": "quảng trị",
    # Quảng Ngãi mới
    "kon tum": "quảng ngãi",
    # Khánh Hòa mới
    "ninh thuận": "khánh hòa",
    "bình thuận": "khánh hòa",
    "phú yên": "khánh hòa",
    # Gia Lai mới
    "bình định": "gia lai",
    # Lâm Đồng mới
    "đắk nông": "lâm đồng",
    # Đồng Nai mới
    "bình phước": "đồng nai",
    # Tây Ninh mới
    "long an": "tây ninh",
    # Vĩnh Long mới
    "trà vinh": "vĩnh long",
    "bến tre": "vĩnh long",
    # Đồng Tháp mới
    "tiền giang": "đồng tháp",
    # An Giang mới
    "kiên giang": "an giang",
    # Cà Mau mới
    "bạc liêu": "cà mau",

    # ========================================================================
    # I. SÁP NHẬP LỊCH SỬ (trước 2025)
    # ========================================================================
    "hà tây": "hà nội",
    "hà sơn bình": "hà nội",
}

# ==============================================================================
# TỈNH CŨ ĐÃ SÁP NHẬP — THÔNG TIN THÔNG BÁO CHO USER
# ==============================================================================
# Key: tên tỉnh cũ (lowercase), Value: dict chứa thông tin sáp nhập
# Dùng trong router.py: nếu user hỏi tỉnh cũ → chatbot thông báo đã sáp nhập
# và tự động search tỉnh mới.
MERGED_PROVINCES = {
    # ========================================================================
    # A. SÁP NHẬP 2025 — Nghị quyết 202/2025/QH15 (hiệu lực 01/07/2025)
    #    63 tỉnh/thành → 34 tỉnh/thành (6 TP trực thuộc TW + 28 tỉnh)
    #    11 giữ nguyên, 52 sáp nhập thành 23 đơn vị mới
    # ========================================================================

    # --- TP.HCM mở rộng: HCM + Bình Dương + Bà Rịa-Vũng Tàu ---
    "bình dương": {
        "current": "hồ chí minh",
        "year": 2025,
        "note": "Tỉnh Bình Dương đã sáp nhập vào Thành phố Hồ Chí Minh từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "bà rịa vũng tàu": {
        "current": "hồ chí minh",
        "year": 2025,
        "note": "Tỉnh Bà Rịa - Vũng Tàu đã sáp nhập vào Thành phố Hồ Chí Minh từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "vũng tàu": {
        "current": "hồ chí minh",
        "year": 2025,
        "note": "Thành phố Vũng Tàu (thuộc Bà Rịa - Vũng Tàu cũ) đã sáp nhập vào Thành phố Hồ Chí Minh từ ngày 01/07/2025"
    },

    # --- Hải Phòng mở rộng: Hải Phòng + Hải Dương ---
    "hải dương": {
        "current": "hải phòng",
        "year": 2025,
        "note": "Tỉnh Hải Dương đã sáp nhập vào Thành phố Hải Phòng từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Đà Nẵng mở rộng: Đà Nẵng + Quảng Nam ---
    "quảng nam": {
        "current": "đà nẵng",
        "year": 2025,
        "note": "Tỉnh Quảng Nam đã sáp nhập vào Thành phố Đà Nẵng từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "hội an": {
        "current": "đà nẵng",
        "year": 2025,
        "note": "Thành phố Hội An (thuộc Quảng Nam cũ) nay thuộc Thành phố Đà Nẵng từ ngày 01/07/2025"
    },

    # --- Cần Thơ mở rộng: Cần Thơ + Hậu Giang + Sóc Trăng ---
    "hậu giang": {
        "current": "cần thơ",
        "year": 2025,
        "note": "Tỉnh Hậu Giang đã sáp nhập vào Thành phố Cần Thơ từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "sóc trăng": {
        "current": "cần thơ",
        "year": 2025,
        "note": "Tỉnh Sóc Trăng đã sáp nhập vào Thành phố Cần Thơ từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Tuyên Quang mới: Tuyên Quang + Hà Giang ---
    "hà giang": {
        "current": "tuyên quang",
        "year": 2025,
        "note": "Tỉnh Hà Giang đã sáp nhập vào tỉnh Tuyên Quang từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Lào Cai mới: Lào Cai + Yên Bái ---
    "yên bái": {
        "current": "lào cai",
        "year": 2025,
        "note": "Tỉnh Yên Bái đã sáp nhập vào tỉnh Lào Cai từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Thái Nguyên mới: Thái Nguyên + Bắc Kạn ---
    "bắc kạn": {
        "current": "thái nguyên",
        "year": 2025,
        "note": "Tỉnh Bắc Kạn đã sáp nhập vào tỉnh Thái Nguyên từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Phú Thọ mới: Phú Thọ + Vĩnh Phúc + Hòa Bình ---
    "vĩnh phúc": {
        "current": "phú thọ",
        "year": 2025,
        "note": "Tỉnh Vĩnh Phúc đã sáp nhập vào tỉnh Phú Thọ từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "hòa bình": {
        "current": "phú thọ",
        "year": 2025,
        "note": "Tỉnh Hòa Bình đã sáp nhập vào tỉnh Phú Thọ từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Bắc Ninh mới: Bắc Ninh + Bắc Giang ---
    "bắc giang": {
        "current": "bắc ninh",
        "year": 2025,
        "note": "Tỉnh Bắc Giang đã sáp nhập vào tỉnh Bắc Ninh từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Hưng Yên mới: Hưng Yên + Thái Bình ---
    "thái bình": {
        "current": "hưng yên",
        "year": 2025,
        "note": "Tỉnh Thái Bình đã sáp nhập vào tỉnh Hưng Yên từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Ninh Bình mới: Ninh Bình + Nam Định + Hà Nam ---
    "nam định": {
        "current": "ninh bình",
        "year": 2025,
        "note": "Tỉnh Nam Định đã sáp nhập vào tỉnh Ninh Bình từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "hà nam": {
        "current": "ninh bình",
        "year": 2025,
        "note": "Tỉnh Hà Nam đã sáp nhập vào tỉnh Ninh Bình từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Quảng Trị mới: Quảng Trị + Quảng Bình ---
    "quảng bình": {
        "current": "quảng trị",
        "year": 2025,
        "note": "Tỉnh Quảng Bình đã sáp nhập vào tỉnh Quảng Trị từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Quảng Ngãi mới: Quảng Ngãi + Kon Tum ---
    "kon tum": {
        "current": "quảng ngãi",
        "year": 2025,
        "note": "Tỉnh Kon Tum đã sáp nhập vào tỉnh Quảng Ngãi từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Khánh Hòa mới: Khánh Hòa + Ninh Thuận + Bình Thuận + Phú Yên ---
    "ninh thuận": {
        "current": "khánh hòa",
        "year": 2025,
        "note": "Tỉnh Ninh Thuận đã sáp nhập vào tỉnh Khánh Hòa từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "bình thuận": {
        "current": "khánh hòa",
        "year": 2025,
        "note": "Tỉnh Bình Thuận đã sáp nhập vào tỉnh Khánh Hòa từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "phú yên": {
        "current": "khánh hòa",
        "year": 2025,
        "note": "Tỉnh Phú Yên đã sáp nhập vào tỉnh Khánh Hòa từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "phan thiết": {
        "current": "khánh hòa",
        "year": 2025,
        "note": "Thành phố Phan Thiết (thuộc Bình Thuận cũ) nay thuộc tỉnh Khánh Hòa từ ngày 01/07/2025"
    },

    # --- Gia Lai mới: Gia Lai + Bình Định ---
    "bình định": {
        "current": "gia lai",
        "year": 2025,
        "note": "Tỉnh Bình Định đã sáp nhập vào tỉnh Gia Lai từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "quy nhơn": {
        "current": "gia lai",
        "year": 2025,
        "note": "Thành phố Quy Nhơn (thuộc Bình Định cũ) nay thuộc tỉnh Gia Lai từ ngày 01/07/2025"
    },

    # --- Lâm Đồng mới: Lâm Đồng + Đắk Nông ---
    "đắk nông": {
        "current": "lâm đồng",
        "year": 2025,
        "note": "Tỉnh Đắk Nông đã sáp nhập vào tỉnh Lâm Đồng từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Đắk Lắk giữ nguyên ---

    # --- Đồng Nai mới: Đồng Nai + Bình Phước ---
    "bình phước": {
        "current": "đồng nai",
        "year": 2025,
        "note": "Tỉnh Bình Phước đã sáp nhập vào tỉnh Đồng Nai từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Tây Ninh mới: Tây Ninh + Long An ---
    "long an": {
        "current": "tây ninh",
        "year": 2025,
        "note": "Tỉnh Long An đã sáp nhập vào tỉnh Tây Ninh từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Vĩnh Long mới: Vĩnh Long + Trà Vinh + Bến Tre ---
    "trà vinh": {
        "current": "vĩnh long",
        "year": 2025,
        "note": "Tỉnh Trà Vinh đã sáp nhập vào tỉnh Vĩnh Long từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "bến tre": {
        "current": "vĩnh long",
        "year": 2025,
        "note": "Tỉnh Bến Tre đã sáp nhập vào tỉnh Vĩnh Long từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- Đồng Tháp mới: Đồng Tháp + Tiền Giang ---
    "tiền giang": {
        "current": "đồng tháp",
        "year": 2025,
        "note": "Tỉnh Tiền Giang đã sáp nhập vào tỉnh Đồng Tháp từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # --- An Giang mới: An Giang + Kiên Giang ---
    "kiên giang": {
        "current": "an giang",
        "year": 2025,
        "note": "Tỉnh Kiên Giang đã sáp nhập vào tỉnh An Giang từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },
    "phú quốc": {
        "current": "an giang",
        "year": 2025,
        "note": "Đảo Phú Quốc (thuộc Kiên Giang cũ) nay thuộc tỉnh An Giang từ ngày 01/07/2025"
    },

    # --- Cà Mau mới: Cà Mau + Bạc Liêu ---
    "bạc liêu": {
        "current": "cà mau",
        "year": 2025,
        "note": "Tỉnh Bạc Liêu đã sáp nhập vào tỉnh Cà Mau từ ngày 01/07/2025 (NQ 202/2025/QH15)"
    },

    # ========================================================================
    # B. SÁP NHẬP LỊCH SỬ (trước 2025) — vẫn giữ để tham khảo
    # ========================================================================
    "hà tây": {
        "current": "hà nội",
        "year": 2008,
        "note": "Tỉnh Hà Tây đã sáp nhập vào thành phố Hà Nội từ năm 2008"
    },
    "hà sơn bình": {
        "current": "hà nội",
        "year": 1991,
        "note": "Tỉnh Hà Sơn Bình đã chia tách thành Hà Tây (nay thuộc Hà Nội) và Hòa Bình từ năm 1991"
    },
}


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

    # ==================================================================
    # MAPPING KHÔNG DẤU → CÓ DẤU  (63 tỉnh/thành + quận + địa danh du lịch)
    # ==================================================================
    # --- Tỉnh / Thành phố ---
    "hue": "huế",
    "ho chi minh": "hồ chí minh",
    "tp ho chi minh": "hồ chí minh",
    "thanh pho ho chi minh": "hồ chí minh",
    "can tho": "cần thơ",
    "hai phong": "hải phòng",
    "an giang": "an giang",
    "ba ria vung tau": "bà rịa vũng tàu",
    "vung tau": "vũng tàu",
    "bac giang": "bắc giang",
    "bac kan": "bắc kạn",
    "bac lieu": "bạc liêu",
    "bac ninh": "bắc ninh",
    "ben tre": "bến tre",
    "binh dinh": "bình định",
    "binh duong": "bình dương",
    "binh phuoc": "bình phước",
    "binh thuan": "bình thuận",
    "ca mau": "cà mau",
    "cao bang": "cao bằng",
    "dak lak": "đắk lắk",
    "dak nong": "đắk nông",
    "dien bien": "điện biên",
    "dong nai": "đồng nai",
    "dong thap": "đồng tháp",
    "gia lai": "gia lai",
    "ha giang": "hà giang",
    "ha nam": "hà nam",
    "ha tinh": "hà tĩnh",
    "hai duong": "hải dương",
    "hau giang": "hậu giang",
    "hoa binh": "hòa bình",
    "hung yen": "hưng yên",
    "khanh hoa": "khánh hòa",
    "kien giang": "kiên giang",
    "kon tum": "kon tum",
    "lai chau": "lai châu",
    "lam dong": "lâm đồng",
    "lang son": "lạng sơn",
    "lao cai": "lào cai",
    "long an": "long an",
    "nam dinh": "nam định",
    "nghe an": "nghệ an",
    "ninh binh": "ninh bình",
    "ninh thuan": "ninh thuận",
    "phu tho": "phú thọ",
    "phu yen": "phú yên",
    "quang binh": "quảng bình",
    "quang nam": "quảng nam",
    "quang ngai": "quảng ngãi",
    "quang ninh": "quảng ninh",
    "quang tri": "quảng trị",
    "soc trang": "sóc trăng",
    "son la": "sơn la",
    "tay ninh": "tây ninh",
    "thai binh": "thái bình",
    "thai nguyen": "thái nguyên",
    "thanh hoa": "thanh hóa",
    "thua thien hue": "thừa thiên huế",
    "tien giang": "tiền giang",
    "tra vinh": "trà vinh",
    "tuyen quang": "tuyên quang",
    "vinh long": "vĩnh long",
    "vinh phuc": "vĩnh phúc",
    "yen bai": "yên bái",
    
    # --- Quận / Huyện TP.HCM (không dấu) ---
    "quan 1": "quận 1", "quan 2": "quận 2", "quan 3": "quận 3",
    "quan 4": "quận 4", "quan 5": "quận 5", "quan 6": "quận 6",
    "quan 7": "quận 7", "quan 8": "quận 8", "quan 9": "quận 9",
    "quan 10": "quận 10", "quan 11": "quận 11", "quan 12": "quận 12",
    "go vap": "gò vấp", "quan go vap": "quận gò vấp",
    "binh thanh": "bình thạnh", "quan binh thanh": "quận bình thạnh",
    "tan binh": "tân bình", "quan tan binh": "quận tân bình",
    "tan phu": "tân phú", "quan tan phu": "quận tân phú",
    "phu nhuan": "phú nhuận", "quan phu nhuan": "quận phú nhuận",
    "binh tan": "bình tân", "quan binh tan": "quận bình tân",
    "thu duc": "thủ đức",
    
    # --- Quận / Huyện Hà Nội (không dấu) ---
    "hoan kiem": "hoàn kiếm", "ba dinh": "ba đình",
    "dong da": "đống đa", "hai ba trung": "hai bà trưng",
    "cau giay": "cầu giấy", "thanh xuan": "thanh xuân",
    "hoang mai": "hoàng mai", "long bien": "long biên",
    "tay ho": "tây hồ", "nam tu liem": "nam từ liêm",
    "bac tu liem": "bắc từ liêm", "ha dong": "hà đông",
    
    # --- Địa danh du lịch nổi tiếng (không dấu) ---
    "phan thiet": "phan thiết",
    "mui ne": "mũi né",
    "quy nhon": "quy nhơn",
    "ha long": "hạ long", "vinh ha long": "vịnh hạ long",
    "sa pa": "sa pa", "sapa": "sa pa",
    "tam dao": "tam đảo",
    "moc chau": "mộc châu",
    "con dao": "côn đảo",
    "cat ba": "cát bà",
    "phan rang": "phan rang",
    "cu lao cham": "cù lao chàm",
    "lang co": "lăng cô",
    "tam coc": "tam cốc",
    "trang an": "tràng an",
    "phong nha": "phong nha",
    "ba na": "bà nà", "ba na hills": "bà nà hills",
    "ninh kieu": "ninh kiều",
    
    # --- Thành phố thuộc tỉnh (không dấu) ---
    "buon ma thuot": "buôn ma thuột",
    "my tho": "mỹ tho",
    "rach gia": "rạch giá",
    "cao lanh": "cao lãnh",
    "sa dec": "sa đéc",
    "chau doc": "châu đốc",
    "mong cai": "móng cái",
    "tam ky": "tam kỳ",
    "dong ha": "đông hà",
    "dong hoi": "đông hới",
    "bien hoa": "biên hòa",
    "bao loc": "bảo lộc",
    "cam ranh": "cam ranh",
    "long xuyen": "long xuyên",
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
