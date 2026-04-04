"""
Seed database from CSV files if tables are empty
Auto-import knowledge_base.csv and intent_dataset.csv to PostgreSQL
"""
import os
import pandas as pd
from sqlalchemy import create_engine, text
from src.core.config import settings
from src.core.logger import logger

def get_db_url():
    """Tạo SQLAlchemy connection URL từ config"""
    return f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

def seed_database():
    """
    Import dữ liệu từ CSV vào PostgreSQL nếu bảng places trống
    """
    try:
        engine = create_engine(get_db_url())
        
        # Kiểm tra xem bảng places đã có dữ liệu chưa
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM places"))
            count = result.scalar()
            
            if count > 0:
                logger.info(f"[Seed] Database already has {count} places, skipping seed")
                return
        
        logger.info("[Seed] Database is empty, importing from CSV...")
        
        # Đường dẫn tới file CSV
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_dir, "data", "knowledge_base.csv")
        
        if not os.path.exists(csv_path):
            logger.warning(f"[Seed] CSV file not found: {csv_path}")
            return
        
        # Đọc CSV
        df = pd.read_csv(csv_path)
        logger.info(f"[Seed] Read {len(df)} records from CSV")
        
        # Map cột CSV sang cột database
        # CSV: id,name,domain,category_vi,latitude,longitude,address,district,province,description,search_text,data_source
        # DB: id,name,domain,category_vi,latitude,longitude,address,district,province,description,search_text,data_source,created_at
        
        # Thêm cột created_at nếu chưa có
        if 'created_at' not in df.columns:
            df['created_at'] = pd.Timestamp.now()
        
        # Đổi tên cột để khớp với database
        df = df.rename(columns={
            'category_vi': 'category_vi'  # Giữ nguyên
        })
        
        # Chỉ lấy các cột cần thiết
        columns_to_insert = ['id', 'name', 'domain', 'category_vi', 'latitude', 'longitude', 
                            'address', 'district', 'province', 'description', 'search_text', 
                            'data_source', 'created_at']
        
        df_to_insert = df[columns_to_insert]
        
        # Import vào database
        df_to_insert.to_sql('places', engine, if_exists='append', index=False, method='multi', chunksize=1000)
        
        logger.info(f"[Seed] ✅ Successfully imported {len(df)} places to database")
        
    except Exception as e:
        logger.error(f"[Seed] ❌ Failed to seed database: {e}")
        # Không raise exception - để AI service vẫn chạy được với CSV fallback

if __name__ == "__main__":
    seed_database()
