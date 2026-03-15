"""
Script import dữ liệu từ CSV vào PostgreSQL
"""
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os

# Cấu hình database
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'chatbot_db',
    'user': 'postgres',  # Thay đổi nếu khác
    'password': '123456'
}

def import_foods():
    """Import món ăn từ knowledge_base.csv"""
    print("Đang import món ăn...")
    
    # Đọc CSV
    df = pd.read_csv('data/knowledge_base.csv')
    foods_df = df[df['type'] == 'food']
    
    # Kết nối database
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Xóa dữ liệu cũ
    cur.execute("TRUNCATE TABLE foods RESTART IDENTITY CASCADE")
    
    # Chuẩn bị dữ liệu
    values = []
    for _, row in foods_df.iterrows():
        values.append((
            row['name'],
            row['description'],
            row['location'],
            row.get('address', ''),
            row.get('tags', ''),
            0.0,  # rating mặc định
            '',   # price_range
            True  # is_active
        ))
    
    # Insert batch
    execute_values(
        cur,
        """
        INSERT INTO foods (name, description, location, address, tags, rating, price_range, is_active)
        VALUES %s
        """,
        values
    )
    
    conn.commit()
    print(f"✅ Đã import {len(values)} món ăn")
    
    cur.close()
    conn.close()

def import_places():
    """Import địa điểm từ knowledge_base.csv"""
    print("Đang import địa điểm...")
    
    # Đọc CSV
    df = pd.read_csv('data/knowledge_base.csv')
    places_df = df[df['type'] == 'place']
    
    # Kết nối database
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Lấy category_id (giả sử category "Du lịch" có id=1)
    cur.execute("SELECT id FROM categories WHERE code = 'du_lich' LIMIT 1")
    result = cur.fetchone()
    if not result:
        # Tạo category mới nếu chưa có
        cur.execute("INSERT INTO categories (name, code) VALUES ('Du lịch', 'du_lich') RETURNING id")
        category_id = cur.fetchone()[0]
    else:
        category_id = result[0]
    
    # Chuẩn bị dữ liệu
    values = []
    for _, row in places_df.iterrows():
        values.append((
            category_id,
            row['name'],
            row['description'],
            row['location'],
            row.get('address', ''),
            row.get('tags', ''),
            0.0,  # rating
            '',   # price_range
            True  # is_active
        ))
    
    # Insert batch
    execute_values(
        cur,
        """
        INSERT INTO places (category_id, name, description, location, address, tags, rating, price_range, is_active)
        VALUES %s
        """,
        values
    )
    
    conn.commit()
    print(f"✅ Đã import {len(values)} địa điểm")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        print("="*60)
        print(" IMPORT DỮ LIỆU VÀO POSTGRESQL")
        print("="*60)
        
        import_foods()
        import_places()
        
        print("\n✅ HOÀN TẤT!")
        print("="*60)
    except Exception as e:
        print(f"\n❌ LỖI: {e}")
