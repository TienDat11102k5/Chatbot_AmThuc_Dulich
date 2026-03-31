"""
Script thông minh để import knowledge_base.csv vào đúng cấu trúc DB Spring Boot.
Được thiết kế để chạy tự động từ Docker entrypoint hoặc chạy thủ công.

Usage:
    python smart_import.py                # Chạy thủ công
    (hoặc tự động từ entrypoint.sh)       # Chạy trong Docker
"""
import pandas as pd
import psycopg2
import os
import math
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # In Docker, env vars are injected directly — dotenv not needed

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'database'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'chatbot_db'),
    'user': os.getenv('DB_USER', 'admin'),
    'password': os.getenv('DB_PASSWORD', 'password')
}

def clean_str(val):
    if pd.isna(val) or val is None:
        return ""
    return str(val).strip()

def clean_float(val):
    if pd.isna(val) or val is None:
        return None
    try:
        f = float(val)
        return f if not math.isnan(f) else None
    except (ValueError, TypeError):
        return None

def generate_code(name):
    """Generate a URL-safe code from Vietnamese category name."""
    code = name.lower().replace(' ', '_').replace('/', '_')
    replacements = {
        'ẩ': 'a', 'ứ': 'u', 'ị': 'i', 'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e', 'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o', 'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u', 'ư': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y', 'đ': 'd'
    }
    for k, v in replacements.items():
        code = code.replace(k, v)
    return code

def main():
    print("🚀 Bắt đầu import data thông minh...")
    csv_path = "data/knowledge_base.csv"
    if not os.path.exists(csv_path):
        print(f"❌ Lỗi: Không tìm thấy {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    print(f"📊 Đã đọc {len(df)} dòng dữ liệu.")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 1. Manage categories
    domains = df['domain'].dropna().unique()
    cat_map = {}
    print("\n📦 Nạp Categories...")
    for d in domains:
        d_str = str(d).strip()
        code = generate_code(d_str)
        cursor.execute("SELECT id FROM categories WHERE code = %s", (code,))
        res = cursor.fetchone()
        if res:
            cat_map[d_str] = res[0]
        else:
            cursor.execute("INSERT INTO categories (name, code) VALUES (%s, %s) RETURNING id", (d_str, code))
            cat_id = cursor.fetchone()[0]
            cat_map[d_str] = cat_id
            print(f"   + Đã thêm Category: {d_str} (ID: {cat_id})")
            
    # 2. Clear old data (safe because we re-import everything)
    print("\n🗑️ Dọn dẹp dữ liệu hiện tại trong places và foods...")
    # Disable FK checks temporarily for TRUNCATE
    cursor.execute("TRUNCATE TABLE user_favorites RESTART IDENTITY CASCADE;")
    cursor.execute("TRUNCATE TABLE places RESTART IDENTITY CASCADE;")
    cursor.execute("TRUNCATE TABLE foods RESTART IDENTITY CASCADE;")
    
    # 3. Insert into places and foods with FULL columns
    print("\n🔄 Đang nạp Places và Foods...")
    food_count = 0
    place_count = 0
    
    for idx, row in df.iterrows():
        domain = clean_str(row.get('domain'))
        name = clean_str(row.get('name'))
        desc = clean_str(row.get('description'))
        province = clean_str(row.get('province'))
        address = clean_str(row.get('address'))
        district = clean_str(row.get('district'))
        category_vi = clean_str(row.get('category_vi'))
        search_text = clean_str(row.get('search_text'))
        data_source = clean_str(row.get('data_source')) or 'crawled'
        lat = clean_float(row.get('latitude'))
        lng = clean_float(row.get('longitude'))
        place_id = clean_str(row.get('id'))
        
        if domain.lower() == 'ẩm thực':
            # Insert into foods table
            cursor.execute("""
                INSERT INTO foods (name, description, location, address, tags, rating, price_range)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (name, desc, province, address, category_vi, None, None))
            food_count += 1
        
        # ALWAYS insert into places table (Recommender reads from places for ALL domains)
        cat_id = cat_map.get(domain)
        if not cat_id:
            cat_id = cat_map.get(list(cat_map.keys())[0]) if cat_map else None
            
        cursor.execute("""
            INSERT INTO places (
                id, category_id, name, description, location, address, tags,
                domain, district, province, category_vi, 
                search_text, data_source, latitude, longitude
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            place_id, cat_id, name, desc, province, address, category_vi,
            domain, district, province, category_vi,
            search_text, data_source, lat, lng
        ))
        place_count += 1
            
        if (idx + 1) % 5000 == 0:
            print(f"   ... đã nạp {idx + 1} dòng")
            
    conn.commit()
    cursor.close()
    conn.close()
    
    print("\n✅ HOÀN TẤT IMPORT DỮ LIỆU!")
    print(f"   🍴 Foods nạp: {food_count}")
    print(f"   🏕️ Places nạp: {place_count}")
    print(f"   🎯 Tổng cộng: {food_count + place_count}")

if __name__ == '__main__':
    main()
