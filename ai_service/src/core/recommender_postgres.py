"""
Recommender System sử dụng PostgreSQL thay vì CSV
"""
import psycopg2
import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.core.nlp_utils import preprocess_text

# Cấu hình database từ environment variables
def get_db_config():
    """Lấy cấu hình database từ .env"""
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'chatbot_db'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '123456')
    }

class RecommenderSystem:
    """
    Recommender System đọc dữ liệu từ PostgreSQL
    """
    
    def __init__(self):
        """Khởi tạo và load dữ liệu từ PostgreSQL"""
        self.ready = False
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None
        
        try:
            self.db_config = get_db_config()
            self.load_data_from_db()
            self.build_tfidf_matrix()
            self.ready = True
            print(f"[Recommender] ✅ PostgreSQL Recommender sẵn sàng!")
        except Exception as e:
            print(f"[Recommender] ⚠️ Lỗi khởi tạo PostgreSQL Recommender: {e}")
            print("[Recommender] Sẽ hoạt động ở chế độ rỗng (trả [] cho mọi truy vấn)")
    
    def load_data_from_db(self):
        """Load dữ liệu từ PostgreSQL"""
        conn = psycopg2.connect(**self.db_config)
        
        try:
            # Load places từ PostgreSQL
            places_query = """
                SELECT 
                    CONCAT('PLACE_', id) as id,
                    name,
                    category_vi as type,
                    description,
                    province as location,
                    COALESCE(address, '') as address,
                    COALESCE(domain, '') as tags
                FROM places
                WHERE name IS NOT NULL 
                AND description IS NOT NULL
            """
            self.df = pd.read_sql(places_query, conn)
            
            print(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ PostgreSQL")
            
        finally:
            conn.close()
    
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
        """Tìm kiếm Top K bản ghi giống nhất với filter thông minh"""
        # Guard clause: Nếu recommender chưa sẵn sàng → trả []
        if not self.ready:
            return []
            
        raw_query = entities.get("raw_query", "")
        food_entities = entities.get("food", [])
        location_entities = entities.get("location", [])
        
        if not raw_query.strip():
            return []
        
        # Tiền xử lý query
        processed_query = preprocess_text(raw_query)
        
        if not processed_query.strip():
            return []
        
        print(f"[Recommender] Searching for: '{processed_query}'")
        print(f"[Recommender] Food entities: {food_entities}")
        print(f"[Recommender] Location entities: {location_entities}")
        
        # BƯỚC 1: Filter dữ liệu trước khi tính Cosine
        filtered_df = self.df.copy()
        
        # Filter theo food entities (nếu có)
        if food_entities:
            food_mask = pd.Series([False] * len(filtered_df))
            for food in food_entities:
                food_lower = food.lower()
                mask = (
                    filtered_df['name'].str.lower().str.contains(food_lower, na=False) |
                    filtered_df['description'].str.lower().str.contains(food_lower, na=False) |
                    filtered_df['tags'].str.lower().str.contains(food_lower, na=False)
                )
                food_mask = food_mask | mask
            
            filtered_df = filtered_df[food_mask]
            print(f"[Recommender] After food filter: {len(filtered_df)} records")
        
        # Filter theo location entities (nếu có)
        if location_entities and len(filtered_df) > 0:
            location_mask = pd.Series([False] * len(filtered_df))
            for location in location_entities:
                location_lower = location.lower()
                mask = (
                    filtered_df['location'].str.lower().str.contains(location_lower, na=False) |
                    filtered_df['name'].str.lower().str.contains(location_lower, na=False) |
                    filtered_df['address'].str.lower().str.contains(location_lower, na=False)
                )
                location_mask = location_mask | mask
            
            location_filtered = filtered_df[location_mask]
            print(f"[Recommender] After location filter: {len(location_filtered)} records")
            
            # Nếu có kết quả với cả food + location → dùng
            if len(location_filtered) >= 3:
                filtered_df = location_filtered
            else:
                # Nếu không đủ kết quả → ưu tiên food, bỏ qua location
                print(f"[Recommender] Not enough results with location, prioritizing food")
        
        # Nếu filter quá ít kết quả, fallback về cosine similarity toàn bộ
        if len(filtered_df) < 3:
            print(f"[Recommender] Too few results after filter, using full cosine similarity")
            filtered_df = self.df.copy()
        
        # BƯỚC 2: Tính Cosine Similarity trên dữ liệu đã filter
        if len(filtered_df) == len(self.df):
            # Dùng ma trận TF-IDF đã tính sẵn
            query_vector = self.vectorizer.transform([processed_query])
            similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
            top_indices = similarity_scores.argsort()[::-1][:top_k]
        else:
            # Tính TF-IDF cho subset
            filtered_indices = filtered_df.index.tolist()
            filtered_tfidf = self.tfidf_matrix[filtered_indices]
            
            query_vector = self.vectorizer.transform([processed_query])
            similarity_scores = cosine_similarity(query_vector, filtered_tfidf).flatten()
            
            # Map về indices gốc
            top_local_indices = similarity_scores.argsort()[::-1][:top_k]
            top_indices = [filtered_indices[i] for i in top_local_indices]
        
        # Debug: In ra top results
        print(f"[Recommender] Top {min(5, len(top_indices))} results:")
        for i, idx in enumerate(top_indices[:5]):
            if len(filtered_df) == len(self.df):
                score = similarity_scores[idx]
            else:
                local_idx = filtered_indices.index(idx)
                score = similarity_scores[local_idx]
            name = self.df.iloc[idx]['name']
            print(f"  {i+1}. {name} - Score: {score:.4f}")
        
        # BƯỚC 3: Đóng gói kết quả
        results = []
        for idx in top_indices:
            if len(filtered_df) == len(self.df):
                score = similarity_scores[idx]
            else:
                local_idx = filtered_indices.index(idx)
                score = similarity_scores[local_idx]
            
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
