"""
Script gộp tất cả file CSV từ thư mục knowledge/foods/ và knowledge/places/
thành 1 file knowledge_base.csv
"""
import os
import pandas as pd
from pathlib import Path

# Đường dẫn
KNOWLEDGE_DIR = Path(__file__).parent / "data" / "knowledge"
FOODS_DIR = KNOWLEDGE_DIR / "foods"
PLACES_DIR = KNOWLEDGE_DIR / "places"
OUTPUT_FILE = Path(__file__).parent / "data" / "knowledge_base.csv"

def merge_knowledge_data():
    """Gộp tất cả file CSV từ foods/ và places/"""
    
    print("="*60)
    print(" MERGE KNOWLEDGE DATA - Gộp dữ liệu món ăn/địa điểm")
    print("="*60)
    print()
    
    # Lấy tất cả file CSV
    food_files = list(FOODS_DIR.glob("*_food.csv"))
    place_files = list(PLACES_DIR.glob("*_place.csv"))
    
    if not food_files and not place_files:
        print("❌ Không tìm thấy file CSV nào!")
        return False
    
    print(f"📂 Món ăn: {len(food_files)} file")
    for f in food_files:
        print(f"   - {f.name}")
    print()
    
    print(f"📂 Địa điểm: {len(place_files)} file")
    for f in place_files:
        print(f"   - {f.name}")
    print()
    
    # Đọc và gộp tất cả file
    all_data = []
    total_rows = 0
    food_count = 0
    place_count = 0
    
    # Gộp file món ăn
    for csv_file in food_files:
        try:
            df = pd.read_csv(csv_file, comment='#')
            required_cols = ['id', 'name', 'type', 'description', 'location', 'tags']
            if all(col in df.columns for col in required_cols):
                df_clean = df.dropna(subset=['id', 'name'])
                rows = len(df_clean)
                total_rows += rows
                food_count += rows
                print(f"✅ {csv_file.name:25s} - {rows:2d} món ăn")
                all_data.append(df_clean)
        except Exception as e:
            print(f"❌ {csv_file.name:25s} - Lỗi: {e}")
    
    # Gộp file địa điểm
    for csv_file in place_files:
        try:
            df = pd.read_csv(csv_file, comment='#')
            required_cols = ['id', 'name', 'type', 'description', 'location', 'tags']
            if all(col in df.columns for col in required_cols):
                df_clean = df.dropna(subset=['id', 'name'])
                rows = len(df_clean)
                total_rows += rows
                place_count += rows
                print(f"✅ {csv_file.name:25s} - {rows:2d} địa điểm")
                all_data.append(df_clean)
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
    print(f"✅ HOÀN TẤT! Đã gộp {total_rows} bản ghi")
    print(f"📄 File output: {OUTPUT_FILE}")
    print()
    
    # Thống kê
    print("📊 Phân bố:")
    print(f"   Món ăn (food)    : {food_count:3d} bản ghi")
    print(f"   Địa điểm (place) : {place_count:3d} bản ghi")
    
    print("="*60)
    return True

if __name__ == "__main__":
    success = merge_knowledge_data()
    if not success:
        exit(1)
