"""
Recommender System sử dụng PostgreSQL thay vì CSV
"""
import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.core.nlp_utils import preprocess_text

# Cấu hình database
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'chatbot_db',
    'user': 'postgres',  # Thay đổi nếu khác
    'password': '123456'
}

class RecommenderSystem:
    """
    Recommender System đọc dữ liệu từ PostgreSQL
    """
    
    def __init__(self):
        """Khởi tạo và load dữ liệu từ PostgreSQL"""
        self.load_data_from_db()
        self.build_tfidf_matrix()
    
    def load_data_from_db(self):
        """Load dữ liệu từ PostgreSQL"""
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Load foods
        foods_query = """
            SELECT 
                CONCAT('FOOD_', id) as id,
                name,
                'food' as type,
                description,
                location,
                COALESCE(address, '') as address,
                COALESCE(tags, '') as tags
            FROM foods
            WHERE is_active = TRUE
        """
        foods_df = pd.read_sql(foods_query, conn)
        
        # Load places
        places_query = """
            SELECT 
                CONCAT('PLACE_', id) as id,
                name,
                'place' as type,
                description,
                location,
                COALESCE(address, '') as address,
                COALESCE(tags, '') as tags
            FROM places
            WHERE is_active = TRUE
        """
        places_df = pd.read_sql(places_query, conn)
        
        # Gộp lại
        self.df = pd.concat([foods_df, places_df], ignore_index=True)
        
        conn.close()
        
        print(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ PostgreSQL")
        print(f"  - Món ăn: {len(foods_df)}")
        print(f"  - Địa điểm: {len(places_df)}")
    
    def build_tfidf_matrix(self):
        """Xây dựng ma trận TF-IDF"""
        # Tạo combined_text
        self.df['combined_text'] = (
            self.df['name'].fillna('') + " " +
            self.df['description'].fillna('') + " " +
            self.df['location'].fillna('') + " " +
            self.df['tags'].fillna('')
        )
        
        # Tiền xử lý
        self.df['processed_text'] = self.df['combined_text'].apply(preprocess_text)
        
        # Tính TF-IDF
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['processed_text'])
        
        print(f"[Recommender] Đã tính xong Ma trận TF-IDF: {self.tfidf_matrix.shape}")
    
    def recommend(self, entities: dict, top_k: int = 3) -> list:
        """Tìm kiếm Top K bản ghi giống nhất"""
        raw_query = entities.get("raw_query", "")
        
        if not raw_query.strip():
            return []
        
        # Tiền xử lý query
        processed_query = preprocess_text(raw_query)
        
        if not processed_query.strip():
            return []
        
        # Chuyển thành vector
        query_vector = self.vectorizer.transform([processed_query])
        
        # Tính cosine similarity
        similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        # Lấy top K
        top_indices = similarity_scores.argsort()[::-1][:top_k]
        
        # Đóng gói kết quả
        results = []
        for idx in top_indices:
            score = similarity_scores[idx]
            
            if score <= 0:
                continue
                
            row = self.df.iloc[idx]
            results.append({
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "description": row['description'],
                "location": row['location'],
                "address": row.get('address', ''),
                "tags": row['tags'],
                "score": round(float(score), 4)
            })
        
        return results
