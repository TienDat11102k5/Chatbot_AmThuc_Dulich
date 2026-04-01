"""
Script import knowledge_base.csv vào PostgreSQL
Chạy: python import_to_postgres.py
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Cấu hình database
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'chatbot_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '123456')
}

def create_table_and_indexes():
    """Tạo bảng places và các index"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Tạo bảng places
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS places (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                domain VARCHAR,
                category_vi VARCHAR,
                latitude DECIMAL(10, 7),
                longitude DECIMAL(10, 7),
                address TEXT,
                district VARCHAR,
                province VARCHAR,
                description TEXT,
                search_text TEXT,
                data_source VARCHAR DEFAULT 'crawled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tạo các index để tăng tốc tìm kiếm
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_places_province ON places(province)",
            "CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_vi)",
            "CREATE INDEX IF NOT EXISTS idx_places_domain ON places(domain)",
            "CREATE INDEX IF NOT EXISTS idx_places_name ON places USING gin(to_tsvector('english', name))",
            "CREATE INDEX IF NOT EXISTS idx_places_description ON places USING gin(to_tsvector('english', description))",
            "CREATE INDEX IF NOT EXISTS idx_places_search_text ON places USING gin(to_tsvector('english', search_text))",
            "CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude)"
        ]
        
        for index_sql in indexes:
            cursor.execute(index_sql)
        
        # Tạo function tính khoảng cách (Haversine formula)
        cursor.execute("""
            CREATE OR REPLACE FUNCTION calculate_distance(
                lat1 DECIMAL, lon1 DECIMAL, 
                lat2 DECIMAL, lon2 DECIMAL
            ) RETURNS DECIMAL AS $$
            DECLARE
                dlat DECIMAL;
                dlon DECIMAL;
                a DECIMAL;
                c DECIMAL;
                r DECIMAL := 6371; -- Bán kính Trái Đất (km)
            BEGIN
                dlat := radians(lat2 - lat1);
                dlon := radians(lon2 - lon1);
                a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
                c := 2 * atan2(sqrt(a), sqrt(1-a));
                RETURN r * c;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        conn.commit()
        print("✅ Đã tạo bảng places và các index")
        
    except Exception as e:
        print(f"❌ Lỗi tạo bảng: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def import_knowledge_base():
    """Import dữ liệu từ knowledge_base.csv"""
    
    # Đọc file CSV
    csv_path = "data/knowledge_base.csv"
    if not os.path.exists(csv_path):
        print(f"❌ Không tìm thấy file: {csv_path}")
        return
    
    df = pd.read_csv(csv_path)
    print(f"📊 Đã đọc {len(df)} bản ghi từ {csv_path}")
    
    # Kết nối database
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Xóa dữ liệu cũ (nếu có)
        cursor.execute("DELETE FROM places WHERE data_source = 'crawled'")
        print("🗑️ Đã xóa dữ liệu cũ")
        
        # Chuẩn bị dữ liệu để insert
        records = []
        for _, row in df.iterrows():
            # Tạo search_text để tìm kiếm full-text
            search_text = f"{row['name']} {row['description']} {row['tags']} {row['region']}"
            
            record = (
                row['id'],
                row['name'],
                row['type'],  # domain
                row['type'],  # category_vi
                float(row['latitude']) if pd.notna(row['latitude']) else None,
                float(row['longitude']) if pd.notna(row['longitude']) else None,
                row.get('address', ''),
                row.get('district', ''),
                row['region'],  # province
                row['description'],
                search_text,
                'crawled'
            )
            records.append(record)
        
        # Bulk insert
        insert_sql = """
            INSERT INTO places (
                id, name, domain, category_vi, latitude, longitude, 
                address, district, province, description, search_text, data_source
            ) VALUES %s
        """
        
        execute_values(cursor, insert_sql, records, page_size=1000)
        conn.commit()
        
        print(f"✅ Đã import {len(records)} bản ghi vào PostgreSQL")
        
        # Thống kê
        cursor.execute("SELECT domain, COUNT(*) FROM places GROUP BY domain ORDER BY COUNT(*) DESC")
        stats = cursor.fetchall()
        print("\n📊 Thống kê theo loại:")
        for domain, count in stats:
            print(f"  {domain}: {count:,} bản ghi")
        
        cursor.execute("SELECT COUNT(*) FROM places")
        total = cursor.fetchone()[0]
        print(f"\n🎯 Tổng cộng: {total:,} địa điểm trong database")
        
    except Exception as e:
        print(f"❌ Lỗi import: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def main():
    """Hàm chính"""
    print("🚀 BẮT ĐẦU IMPORT KNOWLEDGE BASE VÀO POSTGRESQL")
    print("="*60)
    
    try:
        # Bước 1: Tạo bảng và index
        create_table_and_indexes()
        
        # Bước 2: Import dữ liệu
        import_knowledge_base()
        
        print("\n" + "="*60)
        print("✅ HOÀN THÀNH IMPORT!")
        print("🔗 Có thể kết nối PostgreSQL để kiểm tra dữ liệu")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ LỖI NGHIÊM TRỌNG: {e}")

if __name__ == "__main__":
    main()