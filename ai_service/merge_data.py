"""
Script gộp tất cả file CSV từ thư mục regions/ thành 1 file intent_dataset.csv
"""
import os
import pandas as pd
from pathlib import Path

# Đường dẫn
REGIONS_DIR = Path(__file__).parent / "data" / "regions"
OUTPUT_FILE = Path(__file__).parent / "data" / "intent_dataset.csv"

def merge_regional_data():
    """Gộp tất cả file CSV trong thư mục regions/"""
    
    print("="*60)
    print(" MERGE REGIONAL DATA - Gộp dữ liệu từ các tỉnh thành")
    print("="*60)
    print()
    
    # Lấy tất cả file CSV trong thư mục regions
    csv_files = list(REGIONS_DIR.glob("*.csv"))
    
    if not csv_files:
        print("❌ Không tìm thấy file CSV nào trong thư mục regions/")
        return False
    
    print(f"📂 Tìm thấy {len(csv_files)} file:")
    for f in csv_files:
        print(f"   - {f.name}")
    print()
    
    # Đọc và gộp tất cả file
    all_data = []
    total_rows = 0
    
    for csv_file in csv_files:
        try:
            # Đọc file, bỏ qua dòng comment (#)
            df = pd.read_csv(csv_file, comment='#')
            
            # Chỉ lấy 2 cột cần thiết: text và intent
            if 'text' in df.columns and 'intent' in df.columns:
                df_clean = df[['text', 'intent']].copy()
                
                # Loại bỏ dòng trống
                df_clean = df_clean.dropna()
                
                rows = len(df_clean)
                total_rows += rows
                
                print(f"✅ {csv_file.name:25s} - {rows:3d} câu")
                all_data.append(df_clean)
            else:
                print(f"⚠️  {csv_file.name:25s} - Thiếu cột 'text' hoặc 'intent'")
                
        except Exception as e:
            print(f"❌ {csv_file.name:25s} - Lỗi: {e}")
    
    if not all_data:
        print("\n❌ Không có dữ liệu hợp lệ để gộp!")
        return False
    
    # Gộp tất cả DataFrame
    merged_df = pd.concat(all_data, ignore_index=True)
    
    # Lưu ra file
    merged_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')
    
    print()
    print("="*60)
    print(f"✅ HOÀN TẤT! Đã gộp {total_rows} câu hỏi")
    print(f"📄 File output: {OUTPUT_FILE}")
    print()
    
    # Thống kê theo intent
    print("📊 Phân bố theo Intent:")
    intent_counts = merged_df['intent'].value_counts()
    for intent, count in intent_counts.items():
        print(f"   {intent:20s}: {count:3d} câu")
    
    print("="*60)
    return True

if __name__ == "__main__":
    success = merge_regional_data()
    if not success:
        exit(1)
