import re

# ==============================================================================
# HÀM PHÁT HIỆN CÂU VÔ NGHĨA (Gibberish Detector)
# ==============================================================================
# Mục đích: Chặn các input vô nghĩa ("asdfgh", "xyz123", "!!!")
# trước khi gửi vào model SVM — vì model không được train xử lý gibberish.
def is_gibberish(text: str) -> bool:
    """
    Kiểm tra xem input có phải là chuỗi vô nghĩa không.
    Trả về True nếu text bị coi là gibberish.
    """
    cleaned = text.strip()

    # Rule 1: Quá ngắn (< 2 ký tự chữ cái)
    alpha_chars = re.sub(r'[^a-zA-ZÀ-ỹ]', '', cleaned)
    if len(alpha_chars) < 2:
        return True

    # Rule 2: Không chứa nguyên âm tiếng Việt nào
    # Người Việt viết câu nào cũng có nguyên âm (a, e, i, o, u + dấu)
    vietnamese_vowels = set(
        'aeiouyàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệ'
        'ìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữự'
        'ỳýỷỹỵ'
    )
    lower_text = cleaned.lower()
    has_vowel = any(ch in vietnamese_vowels for ch in lower_text)
    if not has_vowel:
        return True

    # Rule 3: Có cluster phụ âm liên tiếp > 3 ký tự (e.g. "sdfg", "xyz")
    # Tiếng Việt tối đa 2-3 phụ âm liền nhau ("ngh", "tr"), nên > 3 là gibberish
    consonant_pattern = re.compile(r'[bcdfghjklmnpqrstvwxz]{4,}', re.IGNORECASE)
    if consonant_pattern.search(lower_text):
        return True

    # Rule 4: String ngắn (≤ 6 chữ cái) có tỷ lệ phụ âm quá cao (>= 60%)
    # Ví dụ: "xyz123" → 3 chữ cái, 67% phụ âm → gibberish
    # Nhưng "Phở" → quá ngắn nên Rule 1 chặn rồi, "chào" → 25% phụ âm → OK
    if len(alpha_chars) <= 6:
        consonants = set('bcdfghjklmnpqrstvwxz')
        cons_count = sum(1 for ch in alpha_chars.lower() if ch in consonants)
        if len(alpha_chars) > 0 and cons_count / len(alpha_chars) >= 0.6:
            return True

    return False


# ==============================================================================
# HÀM PHÁT HIỆN CODE/SCRIPT INJECTION
# ==============================================================================
# Mục đích: Chặn các input là code lập trình (JavaScript, HTML, SQL, Python...)
# bị gửi nhầm vào chatbot — vì model không phải là trình biên dịch code.
def is_code_injection(text: str) -> bool:
    """
    Kiểm tra xem input có phải là code lập trình / script injection không.
    Trả về True nếu text chứa pattern code rõ ràng.
    """
    lower = text.lower().strip()

    # Pattern 1: JavaScript / TypeScript keywords + patterns
    js_patterns = [
        r'document\.',           # document.querySelector, document.getElementById
        r'window\.',             # window.location, window.alert
        r'console\.',            # console.log
        r'\bvar\s+\w+\s*=',      # var x =
        r'\blet\s+\w+\s*=',      # let x =
        r'\bconst\s+\w+\s*=',    # const x =
        r'function\s*\(',        # function(
        r'=>\s*\{',              # arrow function
        r'querySelector',        # DOM manipulation
        r'getElementById',       # DOM manipulation
        r'addEventListener',     # Event listeners
        r'\.prototype\.',        # Prototype access
        r'new\s+\w+\(',          # new Object(
        r'import\s+.*\s+from',   # ES6 import
        r'require\(',            # Node.js require
        r'module\.exports',      # Node.js export
    ]

    # Pattern 2: HTML / XSS injection
    html_patterns = [
        r'<\s*script',           # <script>
        r'<\s*iframe',           # <iframe>
        r'<\s*img\s+.*on\w+=',   # <img onerror=
        r'<\s*div',              # <div>
        r'<\s*style',            # <style>
        r'javascript\s*:',       # javascript: URL protocol
        r'on(click|load|error|mouseover)\s*=',  # Event handlers
    ]

    # Pattern 3: SQL injection
    sql_patterns = [
        r'\bSELECT\s+.+\s+FROM\b',      # SELECT * FROM
        r'\bINSERT\s+INTO\b',            # INSERT INTO
        r'\bDROP\s+(TABLE|DATABASE)\b',   # DROP TABLE
        r'\bDELETE\s+FROM\b',            # DELETE FROM
        r'\bUNION\s+SELECT\b',           # UNION SELECT
        r"'\s*OR\s+'1'\s*=\s*'1",        # ' OR '1'='1
        r'--\s*$',                        # SQL comment
    ]

    # Pattern 4: Python / General programming
    code_patterns = [
        r'\bdef\s+\w+\s*\(',             # def function(
        r'\bclass\s+\w+\s*[:\(]',         # class Name:
        r'\bimport\s+\w+',               # import os
        r'print\s*\(',                    # print(
        r'\bfor\s+\w+\s+in\s+',          # for x in
        r'\bwhile\s+.*:',                # while True:
        r'\{\s*\{.*\}\s*\}',             # {{ template }}
        r'process\.env',                  # process.env
        r'__\w+__',                      # __init__, __name__
        r'\$\(\s*[\'"]',                 # jQuery $("")
        r'\.addEventListener\s*\(',       # addEventListener
    ]

    # Pattern 5: Dấu hiệu chung của code (nhiều ký tự đặc biệt)
    special_char_count = sum(1 for c in text if c in '{}[]();=<>|&$#@')
    # Nếu >20% ký tự là special chars → khả năng cao là code
    if len(text) > 10 and special_char_count / len(text) > 0.15:
        return True

    # Kiểm tra tất cả patterns
    all_patterns = js_patterns + html_patterns + sql_patterns + code_patterns
    for pattern in all_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False
