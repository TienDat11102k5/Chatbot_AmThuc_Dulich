"""
Script: expand_dataset.py
Purpose: Expand intent_dataset.csv with:
  1. More samples for underrepresented classes (chao_hoi, cam_on, tam_biet, hoi_thong_tin)
  2. Three new intents: hoi_gia, so_sanh, danh_gia
  3. Teen-code and emoji variations
  4. More out_of_scope examples

Run: python -m scripts.expand_dataset (from ai_service/)
"""

import os
import csv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, "..", "data")
DATASET_PATH = os.path.join(DATA_DIR, "intent_dataset.csv")

# ==============================================================================
# NEW DATA — Each list contains (text, intent) tuples
# ==============================================================================

CHAO_HOI_SAMPLES = [
    # Formal greetings
    ("xin chào", "chao_hoi"),
    ("chào bạn", "chao_hoi"),
    ("hello", "chao_hoi"),
    ("hi", "chao_hoi"),
    ("hey", "chao_hoi"),
    ("xin chào bạn nhé", "chao_hoi"),
    ("chào buổi sáng", "chao_hoi"),
    ("chào buổi chiều", "chao_hoi"),
    ("chào buổi tối", "chao_hoi"),
    ("good morning", "chao_hoi"),
    
    # Informal / teen-code
    ("hii", "chao_hoi"),
    ("helu", "chao_hoi"),
    ("ê chào", "chao_hoi"),
    ("yo", "chao_hoi"),
    ("chào nha", "chao_hoi"),
    ("chào nhé", "chao_hoi"),
    ("alo", "chao_hoi"),
    ("ê ê", "chao_hoi"),
    ("chào bạn nha", "chao_hoi"),
    ("helu bạn", "chao_hoi"),

    # With context
    ("chào bot", "chao_hoi"),
    ("chào chatbot", "chao_hoi"),
    ("hello bot ơi", "chao_hoi"),
    ("ê bot", "chao_hoi"),
    ("chào SavoryTrip", "chao_hoi"),
    ("hi bot ơi", "chao_hoi"),
    ("chào mình là khách du lịch", "chao_hoi"),
    ("xin chào tôi muốn hỏi", "chao_hoi"),
    ("chào bạn mình mới vào", "chao_hoi"),
    ("hello mình cần giúp đỡ", "chao_hoi"),

    # With emoji
    ("chào 👋", "chao_hoi"),
    ("hi 😊", "chao_hoi"),
    ("hello 🤗", "chao_hoi"),
    ("xin chào 🌟", "chao_hoi"),
    ("yo 🙋", "chao_hoi"),

    # Question format
    ("có ai ở đây không", "chao_hoi"),
    ("bot ơi", "chao_hoi"),
    ("bạn ơi", "chao_hoi"),
    ("ai đó giúp mình với", "chao_hoi"),
    ("có ai không ạ", "chao_hoi"),

    # More variations
    ("lô lô", "chao_hoi"),
    ("chào mừng", "chao_hoi"),
    ("xin chào bạn ơi", "chao_hoi"),
    ("chào mọi người", "chao_hoi"),
    ("hê lô", "chao_hoi"),
    ("chào xin chào", "chao_hoi"),
    ("mình chào bạn", "chao_hoi"),
    ("tui chào", "chao_hoi"),
    ("chào ạ", "chao_hoi"),
    ("dạ chào", "chao_hoi"),

    # More diverse
    ("mình mới biết bot này", "chao_hoi"),
    ("lần đầu dùng chatbot", "chao_hoi"),
    ("bạn là ai vậy", "chao_hoi"),
    ("mình có thể hỏi gì được", "chao_hoi"),
    ("bạn giúp được gì cho mình", "chao_hoi"),
    ("chào bạn tốt quá", "chao_hoi"),
    ("hi hi", "chao_hoi"),
    ("chào chào", "chao_hoi"),
    ("bạn khỏe không", "chao_hoi"),
    ("hôm nay bạn thế nào", "chao_hoi"),

    # Edge cases
    ("chào em", "chao_hoi"),
    ("chào anh", "chao_hoi"),
    ("chào chị", "chao_hoi"),
    ("gặp lại rồi", "chao_hoi"),
    ("lâu rồi không gặp", "chao_hoi"),
    ("mình quay lại nè", "chao_hoi"),
    ("ê mày ơi", "chao_hoi"),
    ("cậu ơi", "chao_hoi"),
    ("hê lô bạn hiền", "chao_hoi"),
    ("xin chào mình muốn tìm đồ ăn", "chao_hoi"),

    # Vietnamese slang
    ("ê ê ê", "chao_hoi"),
    ("chào xìn", "chao_hoi"),
    ("hế lô hế lô", "chao_hoi"),
    ("hí hí chào", "chao_hoi"),
    ("ê hello", "chao_hoi"),
    ("yo yo", "chao_hoi"),
    ("hê nhô", "chao_hoi"),
    ("alô alô", "chao_hoi"),
    ("chào bạn yêu", "chao_hoi"),
    ("mình vào đây lần đầu", "chao_hoi"),

    # English mix
    ("hello bạn", "chao_hoi"),
    ("hi there", "chao_hoi"),
    ("hey hey", "chao_hoi"),
    ("hiii", "chao_hoi"),
    ("hola", "chao_hoi"),
    ("bonjour", "chao_hoi"),
    ("nihao", "chao_hoi"),
    ("konnichiwa", "chao_hoi"),
    ("xin chào hello", "chao_hoi"),
    ("hai", "chao_hoi"),

    # More formal
    ("kính chào", "chao_hoi"),
    ("kính chào quý khách", "chao_hoi"),
    ("chào quý vị", "chao_hoi"),
    ("dạ xin chào", "chao_hoi"),
    ("dạ chào ạ", "chao_hoi"),
    ("em chào anh", "chao_hoi"),
    ("em chào chị", "chao_hoi"),
    ("tôi muốn bắt đầu", "chao_hoi"),
    ("bắt đầu nào", "chao_hoi"),
    ("ra mắt thôi", "chao_hoi"),

    # Continued variations
    ("chào nhé bạn", "chao_hoi"),
    ("ê bot sống không", "chao_hoi"),
    ("bot có nghe không", "chao_hoi"),
    ("bạn ơi giúp mình", "chao_hoi"),
    ("alo bot ơi", "chao_hoi"),
    ("ping", "chao_hoi"),
    ("pong", "chao_hoi"),
    ("test", "chao_hoi"),
    ("cho mình hỏi", "chao_hoi"),
    ("mình muốn hỏi", "chao_hoi"),

    # Additional
    ("chào buổi trưa", "chao_hoi"),
    ("good afternoon", "chao_hoi"),
    ("good evening", "chao_hoi"),
    ("xin chào tôi cần tìm quán ăn", "chao_hoi"),
    ("chào bạn giúp mình tìm đồ ăn", "chao_hoi"),
    ("hi mình muốn tìm địa điểm", "chao_hoi"),
    ("hello cho mình hỏi", "chao_hoi"),
    ("ê có ai hỗ trợ không", "chao_hoi"),
    ("mình cần tư vấn", "chao_hoi"),
    ("bạn tư vấn giúp mình", "chao_hoi"),
]

CAM_ON_SAMPLES = [
    ("cảm ơn", "cam_on"),
    ("cám ơn", "cam_on"),
    ("cảm ơn bạn", "cam_on"),
    ("cám ơn nha", "cam_on"),
    ("thank you", "cam_on"),
    ("thanks", "cam_on"),
    ("tks", "cam_on"),
    ("cảm ơn nhiều", "cam_on"),
    ("cảm ơn rất nhiều", "cam_on"),
    ("cảm ơn bạn nhé", "cam_on"),
    ("thank bạn", "cam_on"),
    ("đa tạ", "cam_on"),
    ("cam on ban", "cam_on"),
    ("cam on nhieu", "cam_on"),
    ("cam on nha", "cam_on"),
    ("ok cảm ơn", "cam_on"),
    ("ok thanks", "cam_on"),
    ("oke cảm ơn", "cam_on"),
    ("cảm ơn bạn rất nhiều", "cam_on"),
    ("thanks a lot", "cam_on"),

    ("cảm ơn nè", "cam_on"),
    ("tenks", "cam_on"),
    ("thankiu", "cam_on"),
    ("thenks", "cam_on"),
    ("tks bạn", "cam_on"),
    ("cảm ơn bạn đã giúp", "cam_on"),
    ("cảm ơn thông tin", "cam_on"),
    ("cảm ơn gợi ý", "cam_on"),
    ("cảm ơn bạn gợi ý hay lắm", "cam_on"),
    ("mình cảm ơn bạn", "cam_on"),

    ("tuyệt cảm ơn bạn", "cam_on"),
    ("quá hay cảm ơn", "cam_on"),
    ("ngon lắm cảm ơn", "cam_on"),
    ("hay quá cảm ơn nhé", "cam_on"),
    ("được lắm cảm ơn bạn", "cam_on"),
    ("cảm ơn bạn nhiều nha", "cam_on"),
    ("cảm ơn đã giúp mình", "cam_on"),
    ("cảm ơn rất hữu ích", "cam_on"),
    ("rất hữu ích cảm ơn bạn", "cam_on"),
    ("cảm ơn bạn vì gợi ý hay", "cam_on"),

    ("cảm ơn 😊", "cam_on"),
    ("thanks 🙏", "cam_on"),
    ("cảm ơn bạn 🥰", "cam_on"),
    ("tks nha 👍", "cam_on"),
    ("cảm ơn nhiều 💕", "cam_on"),
    ("cam ơn bạn hiền", "cam_on"),
    ("tốt quá cảm ơn", "cam_on"),
    ("perfect cảm ơn", "cam_on"),
    ("mình biết ơn bạn", "cam_on"),
    ("biết ơn nha", "cam_on"),

    ("cảm ơn mình sẽ thử", "cam_on"),
    ("hay lắm cảm ơn nha", "cam_on"),
    ("giỏi quá cảm ơn", "cam_on"),
    ("siêu cảm ơn", "cam_on"),
    ("quá đỉnh cảm ơn bạn", "cam_on"),
    ("oke tks", "cam_on"),
    ("noted thanks", "cam_on"),
    ("thank u", "cam_on"),
    ("thx", "cam_on"),
    ("cảm ơn bạn lần nữa", "cam_on"),

    ("ok cảm ơn rất nhiều", "cam_on"),
    ("vâng cảm ơn", "cam_on"),
    ("dạ cảm ơn", "cam_on"),
    ("dạ cảm ơn ạ", "cam_on"),
    ("em cảm ơn", "cam_on"),
    ("em cảm ơn anh", "cam_on"),
    ("xin cảm ơn", "cam_on"),
    ("cảm ơn quá trời", "cam_on"),
    ("cảm ơn tui nhận được rồi", "cam_on"),
    ("cảm ơn bạn mình hiểu rồi", "cam_on"),

    # More variations
    ("mình thích quá cảm ơn bạn nhiều", "cam_on"),
    ("ok tuyệt vời thanks", "cam_on"),
    ("good cảm ơn", "cam_on"),
    ("nice cảm ơn bạn", "cam_on"),
    ("wonderful thank you", "cam_on"),
    ("mình sẽ đi thử cảm ơn bạn", "cam_on"),
    ("mình ghi nhận cảm ơn", "cam_on"),
    ("rõ rồi cảm ơn bạn", "cam_on"),
    ("hiểu rồi cảm ơn nha", "cam_on"),
    ("cảm ơn bot nhé", "cam_on"),

    # Additional
    ("ừ cảm ơn", "cam_on"),
    ("à ờ cảm ơn", "cam_on"),
    ("ừa cảm ơn nha", "cam_on"),
    ("ok ok cảm ơn", "cam_on"),
    ("phải rồi cảm ơn bạn", "cam_on"),
    ("chuẩn luôn cảm ơn", "cam_on"),
    ("10 điểm cảm ơn", "cam_on"),
    ("5 sao cảm ơn", "cam_on"),
    ("cảm ơn lần sau mình hỏi tiếp", "cam_on"),
    ("cảm ơn hẹn gặp lại", "cam_on"),
]

TAM_BIET_SAMPLES = [
    ("tạm biệt", "tam_biet"),
    ("bye", "tam_biet"),
    ("bye bye", "tam_biet"),
    ("goodbye", "tam_biet"),
    ("chào nhé", "tam_biet"),
    ("đi nhé", "tam_biet"),
    ("hẹn gặp lại", "tam_biet"),
    ("mai gặp lại", "tam_biet"),
    ("mình đi đây", "tam_biet"),
    ("tôi đi đây", "tam_biet"),

    ("bai bai", "tam_biet"),
    ("bai", "tam_biet"),
    ("tạm biệt nhé", "tam_biet"),
    ("tạm biệt bạn", "tam_biet"),
    ("see you", "tam_biet"),
    ("see ya", "tam_biet"),
    ("lát nữa quay lại", "tam_biet"),
    ("mình đi nghe", "tam_biet"),
    ("tui đi đây", "tam_biet"),
    ("thôi nhé", "tam_biet"),

    ("byeee", "tam_biet"),
    ("bay bay", "tam_biet"),
    ("bái bai", "tam_biet"),
    ("chào tạm biệt", "tam_biet"),
    ("tạm biệt nha", "tam_biet"),
    ("mình offline đây", "tam_biet"),
    ("tắt máy đây", "tam_biet"),
    ("hẹn gặp lại nhé", "tam_biet"),
    ("lần sau nói chuyện tiếp", "tam_biet"),
    ("ok tạm biệt", "tam_biet"),

    ("bye nhé", "tam_biet"),
    ("bye nha", "tam_biet"),
    ("bye bot", "tam_biet"),
    ("tạm biệt bot", "tam_biet"),
    ("good bye", "tam_biet"),
    ("mình chào tạm biệt", "tam_biet"),
    ("tus đi đây", "tam_biet"),
    ("thôi bye", "tam_biet"),
    ("ok bye", "tam_biet"),
    ("oke bye", "tam_biet"),

    ("hẹn gặp", "tam_biet"),
    ("gặp lại sau", "tam_biet"),
    ("lần sau nhé", "tam_biet"),
    ("cảm ơn bye", "tam_biet"),
    ("cảm ơn tạm biệt", "tam_biet"),
    ("thanks bye", "tam_biet"),
    ("ok cảm ơn bye", "tam_biet"),
    ("chào bye", "tam_biet"),
    ("pa", "tam_biet"),
    ("pa pa", "tam_biet"),

    ("mình ra ngoại đây bye", "tam_biet"),
    ("tạm biệt chúc ngủ ngon", "tam_biet"),
    ("bye chúc bạn vui", "tam_biet"),
    ("tạm biệt 👋", "tam_biet"),
    ("bye 😊", "tam_biet"),
    ("hẹn gặp lại 🌟", "tam_biet"),
    ("tạm biệt bot nhé", "tam_biet"),
    ("mình không hỏi nữa đâu", "tam_biet"),
    ("thôi đủ rồi bye", "tam_biet"),
    ("ok thôi bye", "tam_biet"),

    # More
    ("bye bạn", "tam_biet"),
    ("bye bye bạn", "tam_biet"),
    ("bye nhé bạn", "tam_biet"),
    ("chào bạn nhé mình đi", "tam_biet"),
    ("tạm biệt bạn mình đi nhé", "tam_biet"),
    ("ok mình xong rồi bye", "tam_biet"),
    ("hết câu hỏi rồi bye", "tam_biet"),
    ("đủ rồi tạm biệt", "tam_biet"),
    ("xong rồi bye", "tam_biet"),
    ("ok xong tạm biệt", "tam_biet"),

    # Additional
    ("tạm biệt ạ", "tam_biet"),
    ("dạ tạm biệt", "tam_biet"),
    ("mình đi ngủ đây bye", "tam_biet"),
    ("mình tắt đây nhé", "tam_biet"),
    ("kết thúc nhé", "tam_biet"),
    ("stop", "tam_biet"),
    ("end", "tam_biet"),
    ("thôi nha", "tam_biet"),
    ("dừng lại nhé", "tam_biet"),
    ("tạm ngưng nhé", "tam_biet"),

    ("peace out", "tam_biet"),
    ("catch you later", "tam_biet"),
    ("see you later", "tam_biet"),
    ("gặp bạn sau nhé", "tam_biet"),
    ("chào thân ái", "tam_biet"),
    ("tạm biệt thân ái", "tam_biet"),
    ("mình sẽ quay lại sau", "tam_biet"),
    ("lát nữa mình hỏi tiếp", "tam_biet"),
    ("ok goodbye", "tam_biet"),
    ("goodbye nha", "tam_biet"),
]

HOI_THONG_TIN_SAMPLES = [
    ("bạn là ai", "hoi_thong_tin"),
    ("bot này là gì", "hoi_thong_tin"),
    ("chatbot này làm gì", "hoi_thong_tin"),
    ("bạn có thể làm gì", "hoi_thong_tin"),
    ("bạn giúp được gì", "hoi_thong_tin"),
    ("mình hỏi gì được", "hoi_thong_tin"),
    ("chức năng của bot", "hoi_thong_tin"),
    ("hướng dẫn sử dụng", "hoi_thong_tin"),
    ("cách dùng chatbot", "hoi_thong_tin"),
    ("cách hỏi chatbot", "hoi_thong_tin"),

    ("giới thiệu về bot", "hoi_thong_tin"),
    ("ai tạo ra bạn", "hoi_thong_tin"),
    ("bạn biết gì", "hoi_thong_tin"),
    ("bot biết những gì", "hoi_thong_tin"),
    ("mình có thể hỏi gì", "hoi_thong_tin"),
    ("hỏi cái gì được vậy", "hoi_thong_tin"),
    ("bạn smart không", "hoi_thong_tin"),
    ("bạn thông minh không", "hoi_thong_tin"),
    ("SavoryTrip là gì", "hoi_thong_tin"),
    ("chatbot SavoryTrip", "hoi_thong_tin"),

    ("help", "hoi_thong_tin"),
    ("trợ giúp", "hoi_thong_tin"),
    ("menu", "hoi_thong_tin"),
    ("tính năng", "hoi_thong_tin"),
    ("bạn hỗ trợ gì", "hoi_thong_tin"),
    ("liệt kê chức năng", "hoi_thong_tin"),
    ("bot này dùng để làm gì", "hoi_thong_tin"),
    ("mục đích của chatbot", "hoi_thong_tin"),
    ("chatbot hoạt động như nào", "hoi_thong_tin"),
    ("bot dùng AI gì", "hoi_thong_tin"),

    ("bạn là chatbot gì", "hoi_thong_tin"),
    ("bạn tên gì", "hoi_thong_tin"),
    ("bot có tên không", "hoi_thong_tin"),
    ("giải thích cách dùng", "hoi_thong_tin"),
    ("mình mới dùng lần đầu hướng dẫn đi", "hoi_thong_tin"),
    ("làm sao để tìm quán", "hoi_thong_tin"),
    ("làm sao để hỏi", "hoi_thong_tin"),
    ("cách tìm quán ăn", "hoi_thong_tin"),
    ("cách tìm địa điểm", "hoi_thong_tin"),
    ("bot tìm được bao nhiêu chỗ", "hoi_thong_tin"),

    ("bao nhiêu dữ liệu", "hoi_thong_tin"),
    ("database có bao nhiêu", "hoi_thong_tin"),
    ("có bao nhiêu địa điểm", "hoi_thong_tin"),
    ("có bao nhiêu quán ăn", "hoi_thong_tin"),
    ("bot cover bao nhiêu tỉnh", "hoi_thong_tin"),
    ("hỗ trợ những tỉnh nào", "hoi_thong_tin"),
    ("bot có hỗ trợ tiếng anh không", "hoi_thong_tin"),
    ("sử dụng ngôn ngữ gì", "hoi_thong_tin"),
    ("bot free không", "hoi_thong_tin"),
    ("miễn phí không", "hoi_thong_tin"),

    # More
    ("cách sử dụng", "hoi_thong_tin"),
    ("sử dụng thế nào", "hoi_thong_tin"),
    ("hướng dẫn", "hoi_thong_tin"),
    ("cho mình xin hướng dẫn", "hoi_thong_tin"),
    ("mình muốn biết thêm về bot", "hoi_thong_tin"),
    ("giới thiệu chatbot", "hoi_thong_tin"),
    ("about", "hoi_thong_tin"),
    ("info", "hoi_thong_tin"),
    ("thông tin", "hoi_thong_tin"),
    ("tìm hiểu chatbot", "hoi_thong_tin"),

    ("bot này có gì đặc biệt", "hoi_thong_tin"),
    ("ưu điểm của bot", "hoi_thong_tin"),
    ("bot làm được những gì", "hoi_thong_tin"),
    ("khả năng của bot", "hoi_thong_tin"),
    ("bạn có thông minh không", "hoi_thong_tin"),
    ("chatbot AI phải không", "hoi_thong_tin"),
    ("dùng công nghệ gì", "hoi_thong_tin"),
    ("bạn được lập trình bằng gì", "hoi_thong_tin"),
    ("bạn có hiểu tiếng Việt không", "hoi_thong_tin"),
    ("bot có thể recommend không", "hoi_thong_tin"),
]

# ==============================================================================
# 3 NEW INTENTS
# ==============================================================================

HOI_GIA_SAMPLES = [
    ("phở bao nhiêu tiền", "hoi_gia"),
    ("giá phở ở đây khoảng bao nhiêu", "hoi_gia"),
    ("bún bò huế giá bao nhiêu", "hoi_gia"),
    ("quán này giá cả thế nào", "hoi_gia"),
    ("giá cơm tấm khoảng bao nhiêu", "hoi_gia"),
    ("tầm giá bao nhiêu", "hoi_gia"),
    ("có đắt không", "hoi_gia"),
    ("quán ăn nào rẻ ở Hà Nội", "hoi_gia"),
    ("quán ăn bình dân ở Đà Nẵng", "hoi_gia"),
    ("tìm quán ăn giá rẻ", "hoi_gia"),

    ("giá ăn ở đây bao nhiêu", "hoi_gia"),
    ("tầm giá ăn uống ở Sài Gòn", "hoi_gia"),
    ("quán nào giá rẻ mà ngon", "hoi_gia"),
    ("ăn phở tầm bao nhiêu tiền", "hoi_gia"),
    ("chi phí ăn uống ở Đà Lạt", "hoi_gia"),
    ("vé vào cửa bao nhiêu", "hoi_gia"),
    ("giá vé tham quan bao nhiêu", "hoi_gia"),
    ("chi phí du lịch Nha Trang", "hoi_gia"),
    ("tốn bao nhiêu tiền ăn uống", "hoi_gia"),
    ("ngân sách ăn uống bao nhiêu", "hoi_gia"),

    ("quán này đắt hay rẻ", "hoi_gia"),
    ("giá menu quán này", "hoi_gia"),
    ("bao nhiêu một tô phở", "hoi_gia"),
    ("1 tô bún bò bao nhiêu", "hoi_gia"),
    ("1 phần cơm tấm giá bao nhiêu", "hoi_gia"),
    ("giá bánh mì Sài Gòn", "hoi_gia"),
    ("bao nhiêu tiền 1 ly cà phê", "hoi_gia"),
    ("giá cà phê ở Đà Lạt", "hoi_gia"),
    ("quán ăn tầm trung ở Hà Nội", "hoi_gia"),
    ("quán ăn cao cấp giá bao nhiêu", "hoi_gia"),

    ("giá bao nhiêu vậy", "hoi_gia"),
    ("mắc không", "hoi_gia"),
    ("rẻ không", "hoi_gia"),
    ("khoảng bao nhiêu tiền", "hoi_gia"),
    ("budget bao nhiêu đủ", "hoi_gia"),
    ("túi tiền sinh viên ăn được không", "hoi_gia"),
    ("quán nào phù hợp túi tiền", "hoi_gia"),
    ("ăn 100k có đủ không", "hoi_gia"),
    ("200k ăn được gì ở Sài Gòn", "hoi_gia"),
    ("50k ăn gì ngon", "hoi_gia"),

    ("quán ăn dưới 100k ở Hà Nội", "hoi_gia"),
    ("quán ăn dưới 50k", "hoi_gia"),
    ("nhà hàng giá rẻ", "hoi_gia"),
    ("nhà hàng bình dân", "hoi_gia"),
    ("quán ăn sinh viên", "hoi_gia"),
    ("quán ăn giá học sinh", "hoi_gia"),
    ("ăn vặt bao nhiêu tiền", "hoi_gia"),
    ("street food giá bao nhiêu", "hoi_gia"),
    ("đồ ăn vỉa hè tầm bao nhiêu", "hoi_gia"),
    ("chi phí ăn sáng ở đây", "hoi_gia"),

    # More
    ("giá cả ở Phú Quốc thế nào", "hoi_gia"),
    ("ăn uống ở Hội An đắt không", "hoi_gia"),
    ("du lịch Đà Nẵng tốn bao nhiêu", "hoi_gia"),
    ("chi phí 1 ngày du lịch", "hoi_gia"),
    ("tiền ăn 1 ngày bao nhiêu", "hoi_gia"),
    ("giá mấy quán này thế nào", "hoi_gia"),
    ("menu giá bao nhiêu", "hoi_gia"),
    ("price range", "hoi_gia"),
    ("khoảng giá", "hoi_gia"),
    ("bảng giá", "hoi_gia"),

    ("quán ăn luxury giá bao nhiêu", "hoi_gia"),
    ("fine dining ở Sài Gòn giá bao nhiêu", "hoi_gia"),
    ("buffet giá bao nhiêu", "hoi_gia"),
    ("giá buffet hải sản", "hoi_gia"),
    ("ăn hải sản tầm bao nhiêu", "hoi_gia"),
    ("giá trung bình ăn uống Nha Trang", "hoi_gia"),
    ("mức giá ăn uống ở Huế", "hoi_gia"),
    ("chi phí ăn uống trung bình", "hoi_gia"),
    ("quán nào vừa túi tiền", "hoi_gia"),
    ("quán rẻ mà chất lượng", "hoi_gia"),

    # Teen code
    ("bao nhiu tiền vậy", "hoi_gia"),
    ("giá bao nhiu", "hoi_gia"),
    ("bnhiu tiền vậy", "hoi_gia"),
    ("đắt hok", "hoi_gia"),
    ("rẻ hok", "hoi_gia"),
    ("mắc hk", "hoi_gia"),
    ("bao nhieu tien", "hoi_gia"),
    ("gia bao nhieu", "hoi_gia"),
    ("tầm bao nhiu", "hoi_gia"),
    ("cost bao nhiêu", "hoi_gia"),
]

SO_SANH_SAMPLES = [
    ("so sánh bún bò và phở", "so_sanh"),
    ("phở hay bún chả ngon hơn", "so_sanh"),
    ("nên ăn phở hay bún bò", "so_sanh"),
    ("so sánh Đà Nẵng và Nha Trang", "so_sanh"),
    ("nên đi Đà Lạt hay Sapa", "so_sanh"),
    ("Phú Quốc hay Côn Đảo đẹp hơn", "so_sanh"),
    ("bánh mì hay cơm tấm ngon hơn", "so_sanh"),
    ("quán A hay quán B ngon hơn", "so_sanh"),
    ("chỗ nào ngon hơn", "so_sanh"),
    ("nên chọn cái nào", "so_sanh"),

    ("nên đi đâu Hà Nội hay Sài Gòn", "so_sanh"),
    ("Hà Nội với Đà Nẵng đâu vui hơn", "so_sanh"),
    ("so sánh ẩm thực Bắc và Nam", "so_sanh"),
    ("ẩm thực miền Trung hay miền Nam", "so_sanh"),
    ("phở Bắc hay phở Nam ngon hơn", "so_sanh"),
    ("bún bò Huế hay bún chả Hà Nội", "so_sanh"),
    ("quán nào rating cao hơn", "so_sanh"),
    ("địa điểm nào đáng đi hơn", "so_sanh"),
    ("cái nào tốt hơn", "so_sanh"),
    ("đâu ngon hơn", "so_sanh"),

    ("so sánh hai quán phở", "so_sanh"),
    ("quán phở nào ngon nhất", "so_sanh"),
    ("top 1 phở Hà Nội là quán nào", "so_sanh"),
    ("so sánh Hội An với Đà Nẵng du lịch", "so_sanh"),
    ("bãi biển nào đẹp nhất Việt Nam", "so_sanh"),
    ("nên ăn gì phở hay bún", "so_sanh"),
    ("phở bò hay phở gà ngon hơn", "so_sanh"),
    ("cơm chiên hay cơm tấm", "so_sanh"),
    ("nên đi biển hay đi núi", "so_sanh"),
    ("du lịch biến hay du lịch thiên nhiên", "so_sanh"),

    ("cái nào ngon hơn", "so_sanh"),
    ("món nào ngon hơn", "so_sanh"),
    ("chỗ nào đẹp hơn", "so_sanh"),
    ("nơi nào đáng đi hơn", "so_sanh"),
    ("quán nào tốt hơn", "so_sanh"),
    ("recommend cái nào", "so_sanh"),
    ("gợi ý nên chọn cái nào", "so_sanh"),
    ("bạn thích cái nào hơn", "so_sanh"),
    ("giữa A và B chọn cái nào", "so_sanh"),
    ("ưu và nhược", "so_sanh"),

    ("so sánh giá cả", "so_sanh"),
    ("quán nào rẻ hơn", "so_sanh"),
    ("chỗ nào đắt hơn", "so_sanh"),
    ("đắt hơn hay rẻ hơn", "so_sanh"),
    ("khác nhau ở chỗ nào", "so_sanh"),
    ("có gì khác nhau", "so_sanh"),
    ("khác biệt giữa phở và bún", "so_sanh"),
    ("sự khác nhau", "so_sanh"),
    ("khác gì nhau", "so_sanh"),
    ("giống và khác nhau", "so_sanh"),

    # More
    ("nên đi Phú Quốc hay Quy Nhơn", "so_sanh"),
    ("Đà Lạt hay Sa Pa lạnh hơn", "so_sanh"),
    ("Nha Trang hay Phú Quốc biển đẹp hơn", "so_sanh"),
    ("ẩm thực Huế hay Đà Nẵng ngon hơn", "so_sanh"),
    ("cà phê Đà Lạt hay cà phê Sài Gòn", "so_sanh"),
    ("bánh xèo miền Tây hay miền Trung", "so_sanh"),
    ("quán nào đông khách hơn", "so_sanh"),
    ("quán nào yên tĩnh hơn", "so_sanh"),
    ("quán nào view đẹp hơn", "so_sanh"),
    ("so sánh atmosphere hai quán", "so_sanh"),

    # Teen code
    ("cai nao ngon hon", "so_sanh"),
    ("nen an gi", "so_sanh"),
    ("nen di dau", "so_sanh"),
    ("cai nao tot hon", "so_sanh"),
    ("dau ngon hon", "so_sanh"),
    ("A vs B", "so_sanh"),
    ("pho vs bun", "so_sanh"),
    ("da nang vs nha trang", "so_sanh"),
    ("hai quan nao ngon hon", "so_sanh"),
    ("chon cai nao", "so_sanh"),
]

DANH_GIA_SAMPLES = [
    ("quán này có review nào không", "danh_gia"),
    ("mọi người đánh giá sao", "danh_gia"),
    ("review quán phở Thìn", "danh_gia"),
    ("quán này có tốt không", "danh_gia"),
    ("ai đã ăn ở đây chưa", "danh_gia"),
    ("đánh giá quán này thế nào", "danh_gia"),
    ("quán này bao nhiêu sao", "danh_gia"),
    ("rating của quán này", "danh_gia"),
    ("quán này được mấy sao", "danh_gia"),
    ("feedback của khách", "danh_gia"),

    ("quán này có ngon không", "danh_gia"),
    ("nên đến quán này không", "danh_gia"),
    ("quán này có đông không", "danh_gia"),
    ("phục vụ có tốt không", "danh_gia"),
    ("service ở đây thế nào", "danh_gia"),
    ("chất lượng phục vụ", "danh_gia"),
    ("nhân viên có thân thiện không", "danh_gia"),
    ("không gian quán thế nào", "danh_gia"),
    ("chỗ này có sạch không", "danh_gia"),
    ("vệ sinh an toàn thực phẩm", "danh_gia"),

    ("quán này nổi tiếng không", "danh_gia"),
    ("quán này được nhiều người biết không", "danh_gia"),
    ("quán nào đánh giá cao nhất", "danh_gia"),
    ("quán nào rating cao nhất", "danh_gia"),
    ("top quán ngon nhất theo review", "danh_gia"),
    ("quán nào được yêu thích nhất", "danh_gia"),
    ("quán nào được recommend nhiều", "danh_gia"),
    ("quán nào đông khách nhất", "danh_gia"),
    ("quán nào hay nhất", "danh_gia"),
    ("quán được khen nhiều", "danh_gia"),

    ("review địa điểm du lịch này", "danh_gia"),
    ("nơi này có đẹp không", "danh_gia"),
    ("chỗ này có đáng đi không", "danh_gia"),
    ("nên tham quan chỗ này không", "danh_gia"),
    ("địa điểm này được đánh giá cao không", "danh_gia"),
    ("kinh nghiệm du lịch nơi này", "danh_gia"),
    ("trải nghiệm ở đây thế nào", "danh_gia"),
    ("cảm nhận về chỗ này", "danh_gia"),
    ("ưu nhược điểm", "danh_gia"),
    ("có gì đặc biệt", "danh_gia"),

    ("quán này chất lượng không", "danh_gia"),
    ("đồ ăn ở đây ra sao", "danh_gia"),
    ("chất lượng đồ ăn", "danh_gia"),
    ("view quán này đẹp không", "danh_gia"),
    ("không gian có đẹp không", "danh_gia"),
    ("quán có chỗ đậu xe không", "danh_gia"),
    ("quán có wifi không", "danh_gia"),
    ("quán mở cửa giờ nào", "danh_gia"),
    ("quán có đặt bàn trước được không", "danh_gia"),
    ("phải xếp hàng không", "danh_gia"),

    # More
    ("quán này đáng thử không", "danh_gia"),
    ("nên ăn ở đây không", "danh_gia"),
    ("bạn bè khen quán này", "danh_gia"),
    ("quán này ngon thật không", "danh_gia"),
    ("phở ở đây có ngon không", "danh_gia"),
    ("bún bò ở đây có được không", "danh_gia"),
    ("quán ăn nào đáng tiền nhất", "danh_gia"),
    ("trải nghiệm thực tế", "danh_gia"),
    ("khách hàng nói gì", "danh_gia"),
    ("nhận xét của khách", "danh_gia"),

    # Teen code / casual
    ("quán này ok hong", "danh_gia"),
    ("chỗ này được hok", "danh_gia"),
    ("ngon hok", "danh_gia"),
    ("có ổn không", "danh_gia"),
    ("nên ăn hok", "danh_gia"),
    ("nên đi hok", "danh_gia"),
    ("rate mấy sao", "danh_gia"),
    ("cho mình xin review", "danh_gia"),
    ("ai review cho mình xem", "danh_gia"),
    ("mấy sao trên google", "danh_gia"),

    # Additional
    ("quán này hot không", "danh_gia"),
    ("quán này trending không", "danh_gia"),
    ("quán viral trên tiktok", "danh_gia"),
    ("quán nào được food blogger khen", "danh_gia"),
    ("quán được reviewer nào khen", "danh_gia"),
    ("quán nào người nổi tiếng hay đến", "danh_gia"),
    ("quán nào check in nhiều", "danh_gia"),
    ("địa điểm sống ảo", "danh_gia"),
    ("review chi tiết quán này", "danh_gia"),
    ("bình luận về quán", "danh_gia"),
]

MORE_OUT_OF_SCOPE = [
    ("2 + 2 bằng mấy", "out_of_scope"),
    ("giải phương trình này cho tui", "out_of_scope"),
    ("viết code python cho tui", "out_of_scope"),
    ("dịch tiếng anh sang tiếng việt", "out_of_scope"),
    ("tin tức hôm nay", "out_of_scope"),
    ("thủ đô nước Pháp là gì", "out_of_scope"),
    ("ai là tổng thống Mỹ", "out_of_scope"),
    ("bóng đá hôm nay", "out_of_scope"),
    ("tỷ giá đô la", "out_of_scope"),
    ("giá bitcoin hôm nay", "out_of_scope"),

    ("cách nấu phở tại nhà", "out_of_scope"),
    ("công thức làm bánh", "out_of_scope"),
    ("hướng dẫn nấu bún bò", "out_of_scope"),
    ("recipe phở", "out_of_scope"),
    ("cách làm bánh mì", "out_of_scope"),
    ("dạy tui nấu cơm", "out_of_scope"),
    ("tình hình kinh tế việt nam", "out_of_scope"),
    ("kết quả xổ số", "out_of_scope"),
    ("lịch sử Việt Nam", "out_of_scope"),
    ("văn hóa Nhật Bản", "out_of_scope"),

    ("tìm việc làm ở Sài Gòn", "out_of_scope"),
    ("thuê nhà ở Hà Nội", "out_of_scope"),
    ("mua xe máy", "out_of_scope"),
    ("đặt vé máy bay", "out_of_scope"),
    ("đặt phòng khách sạn online", "out_of_scope"),
    ("tìm bác sĩ", "out_of_scope"),
    ("thuốc đau bụng", "out_of_scope"),
    ("cách giảm cân", "out_of_scope"),
    ("tai biến mạch máu não", "out_of_scope"),
    ("triệu chứng covid", "out_of_scope"),

    ("mua điện thoại gì tốt", "out_of_scope"),
    ("laptop nào tốt nhất", "out_of_scope"),
    ("tải app gì hay", "out_of_scope"),
    ("game gì hay", "out_of_scope"),
    ("phim gì hay", "out_of_scope"),
    ("nhạc gì hay", "out_of_scope"),
    ("sách gì nên đọc", "out_of_scope"),
    ("ai sáng tác nhạc này", "out_of_scope"),
    ("anh yêu em", "out_of_scope"),
    ("bạn có người yêu không", "out_of_scope"),
]


def main():
    """Append new samples to the dataset."""
    all_new_samples = (
        CHAO_HOI_SAMPLES
        + CAM_ON_SAMPLES
        + TAM_BIET_SAMPLES
        + HOI_THONG_TIN_SAMPLES
        + HOI_GIA_SAMPLES
        + SO_SANH_SAMPLES
        + DANH_GIA_SAMPLES
        + MORE_OUT_OF_SCOPE
    )

    print(f"[expand_dataset] Adding {len(all_new_samples)} new samples...")

    # Count by intent
    intent_counts = {}
    for text, intent in all_new_samples:
        intent_counts[intent] = intent_counts.get(intent, 0) + 1

    print("[expand_dataset] Breakdown:")
    for intent, count in sorted(intent_counts.items()):
        print(f"  {intent}: +{count}")

    # Append to CSV
    with open(DATASET_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for text, intent in all_new_samples:
            writer.writerow([text, intent])

    print(f"[expand_dataset] Done! Total new rows added: {len(all_new_samples)}")

    # Verify
    import pandas as pd
    df = pd.read_csv(DATASET_PATH)
    print(f"\n[expand_dataset] Total dataset size: {len(df)}")
    print("[expand_dataset] Final distribution:")
    print(df['intent'].value_counts().to_string())


if __name__ == "__main__":
    main()
