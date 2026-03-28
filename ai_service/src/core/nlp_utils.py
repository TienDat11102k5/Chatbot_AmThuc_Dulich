"""
File: src/core/nlp_utils.py
Mục đích: Chứa các hàm tiền xử lý ngôn ngữ tự nhiên (NLP) cho tiếng Việt.
           Dữ liệu văn bản từ người dùng thường chứa dấu câu, viết hoa viết thường lộn xộn,
           hoặc các từ vô nghĩa (stop words) không mang lại giá trị cho AI.
           File này sẽ dọn dẹp (clean) văn bản trước khi đưa vào mô hình học máy.
"""

import re  # Thư viện xử lý Biểu thức chính quy (Regex) để xóa ký tự đặc biệt
import unicodedata  # Thư viện chuẩn hóa Unicode
from underthesea import word_tokenize  # Thư viện chuyên dụng cắt từ tiếng Việt chuẩn xác

# ==============================================================================
# 1. TỪ ĐIỂN TỪ DỪNG (STOP WORDS) TIẾNG VIỆT TÙY CHỈNH
# ==============================================================================
# Từ dừng (Stop words) là các từ xuất hiện rất nhiều nhưng không mang ý nghĩa chính 
# để phân loại câu hỏi (ví dụ: là, thì, mà, ở, tại, cái, con, chiếc...).
# Việc loại bỏ chúng giúp mô hình AI chạy nhanh hơn và dự đoán chính xác hơn do bớt nhiễu.
VIETNAMESE_STOP_WORDS = {
    "là", "thì", "mà", "ở", "tại", "bằng", "của", "và", "nhưng", "hoặc", "nếu", 
    "cho", "với", "để", "thế", "này", "kia", "ấy", "nọ", "vậy", "rồi", "nữa",
    "cái", "con", "chiếc", "những", "các", "nhé", "nha", "đi", "nào", "ạ", "ơi"
}

def normalize_vietnamese_tone(text: str) -> str:
    """
    Hàm chuẩn hóa dấu tiếng Việt sai (normalize Vietnamese tone marks).
    
    Vấn đề: Người dùng thường gõ sai dấu, ví dụ:
    - "phỏ" (dấu hỏi ỏ) thay vì "phở" (dấu hỏi ở)
    - "bún bò Huẻ" (dấu hỏi ẻ) thay vì "bún bò Huế" (dấu sắc é)
    
    Giải pháp: Sử dụng Unicode NFD (Normalization Form Decomposed) để tách 
    ký tự gốc và dấu ra, sau đó ghép lại đúng chuẩn với NFC.
    
    Tham số:
        text (str): Chuỗi văn bản có thể chứa dấu sai.
        
    Trả về:
        str: Chuỗi văn bản đã được chuẩn hóa dấu.
    """
    if not text:
        return ""
    
    # Chuẩn hóa Unicode về dạng NFD (tách ký tự và dấu)
    # sau đó ghép lại về NFC (ký tự + dấu đúng chuẩn)
    normalized = unicodedata.normalize('NFC', text)
    return normalized


def clean_text(text: str) -> str:
    """
    Hàm làm sạch văn bản cơ bản (Chuẩn hóa ký tự và chữ hoa/thường).
    
    Quy trình xử lý:
    1. Chuyển toàn bộ chuỗi văn bản về in thường (lowercase) để đồng nhất.
       Ví dụ: "Hà Nội" -> "hà nội"
    2. Dùng biểu thức Regex để loại bỏ tất cả các dấu câu và ký tự đặc biệt.
       Chỉ giữ lại chữ cái và số (bao gồm cả chữ tiếng Việt có dấu).
       Ví dụ: "Phở ngon quá!!!" -> "phở ngon quá"
    3. Xóa các khoảng trắng thừa (nhiều dấu cách ở giữa hoặc hai đầu).
    
    Tham số:
        text (str): Chuỗi văn bản gốc do người dùng nhập vào.
        
    Trả về:
        str: Chuỗi văn bản đã được dọn sạch sẽ.
    """
    # Ép kiểu an toàn, nếu text là None thì coi như chuỗi rỗng
    if not isinstance(text, str):
        text = str(text) if text else ""
    
    # Bước 0: Chuẩn hóa dấu tiếng Việt
    text = normalize_vietnamese_tone(text)
        
    # Bước 1: Chuyển về viết thường
    text = text.lower()
    
    # Bước 2: Xóa dấu câu bằng Regex. Cú pháp [^\w\s] nghĩa là: 
    # Thay thế bất cứ thứ gì KHÔNG PHẢI là từ (word character \w) 
    # hoặc khoảng trắng (space \s) bằng chuỗi rỗng "".
    text = re.sub(r'[^\w\s_]', '', text)
    
    # Bước 3: Cắt bỏ khoảng trắng dư thừa
    text = text.strip()
    # Gộp bớt lại nếu có 2-3 dấu cách liên tiếp nằm giữa câu
    text = re.sub(r'\s+', ' ', text)
    
    return text

def tokenize_vietnamese(text: str) -> str:
    """
    Hàm phân đoạn từ (Tokenization) tiếng Việt nâng cao sử dụng thư viện `underthesea`.
    
    Tại sao cần hàm này?
    Ví dụ câu: "Tôi thích ăn bún chả Hà Nội".
    - Cắt từ tiếng Anh (Space-based): ["Tôi", "thích", "ăn", "bún", "chả", "Hà", "Nội"] -> Mất ý nghĩa cụm từ.
    - Cắt từ tiếng Việt (Underthesea): ["Tôi", "thích", "ăn", "bún_chả", "Hà_Nội"] -> Nối liền các từ ghép có nghĩa.
    
    Quy trình xử lý:
    1. Gọi hàm `clean_text` để làm sạch đầu vào.
    2. Dùng `word_tokenize` của thư viện `underthesea` với tham số `format="text"`.
       Tham số này tự động điền dấy gạch dưới (_) vào giữa các từ ghép.
    
    Tham số:
        text (str): Câu đầu vào chưa qua xử lý.
        
    Trả về:
        str: Câu tiếng Việt đã được nối từ ghép chuẩn xác.
    """
    # Làm sạch văn bản trước (chữ thường, bỏ dấu)
    cleaned_text = clean_text(text)
    
    if not cleaned_text:
        return ""
        
    # Gọi thư viện underthesea để cắt từ. 
    # Ví dụ input: "bún chả hà nội" -> output: "bún_chả hà_nội"
    tokenized_text = word_tokenize(cleaned_text, format="text")
    return tokenized_text

def remove_stop_words(text: str) -> str:
    """
    Hàm loại bỏ từ dừng (Stop words).
    
    Quy trình xử lý:
    1. Cắt chuỗi thành một danh sách (List) các từ đơn lẻ dựa trên khoảng trắng.
    2. Lọc bỏ các từ nằm trong tập hợp `VIETNAMESE_STOP_WORDS` đã cấu hình ở đầu file.
    3. Nối các từ còn sống sót lại thành một chuỗi duy nhất cách nhau bởi khoảng trắng.
    
    Tham số:
        text (str): Đoạn văn bản đã được tokenizer (vd: "đặc_sản của hà_nội là gì nhỉ")
        
    Trả về:
        str: Chuỗi văn bản chỉ chứa từ khóa quan trọng (vd: "đặc_sản hà_nội gì")
    """
    # Tách chuỗi thành mảng các từ
    words = text.split()
    
    # List comprehension: Chỉ lấy từ nếu nó KHÔNG CÓ TRONG danh sách stop words
    filtered_words = [word for word in words if word not in VIETNAMESE_STOP_WORDS]
    
    # Nối mảng lại thành chuỗi nguyên chỉnh
    return " ".join(filtered_words)

def preprocess_text(text: str) -> str:
    """
    Hàm tổng hợp (Pipeline) chịu trách nhiệm chạy toàn bộ quy trình tiền xử lý 
    từ đầu đến cuối cho một câu nhập vào.
    
    Quy trình (FLOW) 3 bước:
    1. Làm sạch & Nối từ ghép bằng Nlp underthesea (gọi hàm `tokenize_vietnamese`).
    2. Gỡ bỏ từ thừa thãi bằng Stop words (gọi hàm `remove_stop_words`).
    3. Cắt tỉa (strip) một lần nữa cho cẩn thận.
    
    Hàm này sẽ được tái sử dụng ở 2 nơi:
    - Lúc đào tạo Model (Train ML) để xử lý ~200 câu của Dataset.
    - Lúc Controller API nhận request "real-time" của khách hàng.
    
    Tham số:
        text (str): Câu nguyên thủy của khách hàng / dữ liệu thô.
        
    Trả về:
        str: Câu đã đạt điểm tuyệt đối về độ "sạch sẽ" sẵn sàng nạp thẳng vào AI.
    """
    if not text:
        return ""
        
    # Bước 1 và 2: Chuẩn hóa, xóa dấu, và Cắt từ nối (Underthesea)
    tokenized = tokenize_vietnamese(text)
    
    # Bước 3: Lọc stop words
    final_text = remove_stop_words(tokenized)
    
    # Trả về kết quả sạch sẽ cuối cùng
    return final_text.strip()
