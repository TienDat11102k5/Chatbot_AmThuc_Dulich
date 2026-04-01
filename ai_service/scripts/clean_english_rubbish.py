"""
Script dọn rác dữ liệu tiếng Anh lẫn trong Dataset.
Nguyên lý: Nếu câu chứa nhiều ký tự ascii thông thường mà không có dấu hiệu của Tiếng Việt (hoặc tỷ lệ chữ tiếng việt quá thấp) sẽ bị loại bỏ.
"""

import pandas as pd
import re
import os

DATASET_PATH = 'data/intent_dataset.csv'
CLEANED_PATH = 'data/intent_dataset_cleaned.csv'

def count_vietnamese_chars(text):
    if pd.isna(text):
        return 0
    # Ký tự có dấu tiếng việt
    vn_pattern = r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]'
    return len(re.findall(vn_pattern, str(text).lower()))

def is_mostly_english(text):
    if pd.isna(text):
        return True
    
    text = str(text).strip()
    if len(text) == 0:
        return True
        
    # Đếm số từ có chứa ký tự tiếng việt
    words = text.split()
    if len(words) == 0:
        return True
        
    vn_char_count = count_vietnamese_chars(text)
    
    # Nếu câu dài hơn 3 từ nhưng KHÔNG có ký tự tiếng Việt nào -> có khả năng cao là tiếng anh
    if len(words) >= 3 and vn_char_count == 0:
        # Nếu có từ "khong", "co", "di", "viet", "nam" ... (tiếng việt không dấu) thì có thể giữ lại
        vn_no_marks_keywords = {"khong", "co", "di", "choi", "dau", "an", "gi", "biet", "chao", "cam", "on", "nha", "trang", "da", "lat", "nang"}
        words_lower = set(w.lower() for w in words)
        
        if len(words_lower.intersection(vn_no_marks_keywords)) >= 2:
            return False
            
        return True
        
    return False

print("🧹 Bắt đầu dọn dẹp dataset...")

if not os.path.exists(DATASET_PATH):
    print(f"❌ Không tìm thấy {DATASET_PATH}")
    exit(1)

df = pd.read_csv(DATASET_PATH, encoding='utf-8-sig')
initial_len = len(df)
print(f"Tổng số dòng ban đầu: {initial_len:,}")

# Tìm các dòng tiếng anh
mask_english = df['text'].apply(is_mostly_english)

english_samples = df[mask_english]
print(f"🔎 Đã phát hiện {len(english_samples):,} dòng khả nghi là Tiếng Anh/Vô nghĩa.")

if len(english_samples) > 0:
    for text in english_samples['text'].head(5):
         print(f"  - Ví dụ loại bỏ: {text}")

# Filter lại df
df_clean = df[~mask_english].copy()
final_len = len(df_clean)

print(f"\n📊 Tổng số dòng sau khi dọn dẹp: {final_len:,}")
print(f"📉 Đã giảm: {initial_len - final_len:,} dòng rác.")

# Lưu lại file đè qua file gốc (tạo backup trước khi đè)
if initial_len - final_len > 0:
    backup_path = DATASET_PATH + ".backup"
    df.to_csv(backup_path, index=False, encoding='utf-8-sig')
    print(f"✅ Đã backup file gốc sang {backup_path}")
    
    df_clean.to_csv(DATASET_PATH, index=False, encoding='utf-8-sig')
    print(f"✅ Đã ghi đè file chuẩn vào {DATASET_PATH}")
else:
    print("✅ File đã sạch, không cần ghi đè.")

print("XONG!")
