"""
Recommender System sử dụng PostgreSQL thay vì CSV
"""
import pandas as pd
import os
from sqlalchemy import create_engine
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.core.nlp_utils import preprocess_text

# Cấu hình database từ environment variables
def get_db_url():
    """Tạo SQLAlchemy connection URL từ environment variables"""
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    dbname = os.getenv('DB_NAME', 'chatbot_db')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', '123456')
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

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
            self.db_url = get_db_url()
            self.load_data_from_db()
            self.build_tfidf_matrix()
            self.ready = True
            print(f"[Recommender] ✅ PostgreSQL Recommender sẵn sàng!")
        except Exception as e:
            print(f"[Recommender] ⚠️ Lỗi khởi tạo PostgreSQL Recommender: {e}")
            print("[Recommender] Sẽ hoạt động ở chế độ rỗng (trả [] cho mọi truy vấn)")
    
    def load_data_from_db(self):
        """Load dữ liệu từ PostgreSQL dùng SQLAlchemy engine (bắt buộc cho pandas 2.x)"""
        engine = create_engine(self.db_url)
        
        # Load places từ PostgreSQL
        places_query = """
            SELECT 
                p.id as id,
                p.name as name,
                COALESCE(p.category_vi, '') as type,
                p.description as description,
                COALESCE(p.province, p.district) as location,
                COALESCE(p.address, '') as address,
                COALESCE(p.domain, '') as tags
            FROM places p
            WHERE p.name IS NOT NULL 
            AND p.description IS NOT NULL
        """
        with engine.connect() as conn:
            self.df = pd.read_sql(places_query, conn)
        
        engine.dispose()
        print(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ PostgreSQL")
    
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
    
    def recommend(self, entities: dict, intent: str = None, top_k: int = 3, user_message: str = "") -> dict:
        """Tìm kiếm Top K bản ghi giống nhất với filter thông minh
        
        Returns:
            dict: {
                "results": list of recommendations,
                "location_not_found": bool,  # True nếu không tìm thấy ở địa phương
                "searched_location": str     # Tên địa phương đã tìm
            }
        """
        # Guard clause: Nếu recommender chưa sẵn sàng → trả []
        if not self.ready:
            return {"results": [], "location_not_found": False, "searched_location": None}
            
        raw_query = entities.get("raw_query", "")
        food_entities = entities.get("food", [])
        location_entities = entities.get("location", [])
        place_type_entities = entities.get("place_type", [])
        
        if not raw_query.strip():
            return {"results": [], "location_not_found": False, "searched_location": None}
        
        # Tiền xử lý query
        processed_query = preprocess_text(raw_query)
        
        if not processed_query.strip():
            return {"results": [], "location_not_found": False, "searched_location": None}
        
        print(f"[Recommender] Searching for: '{processed_query}'")
        print(f"[Recommender] Food entities: {food_entities}")
        print(f"[Recommender] Location entities: {location_entities}")
        print(f"[Recommender] Place type entities: {place_type_entities}")
        
        # Biến để track xem có tìm thấy ở địa phương không
        location_not_found = False
        searched_location = None
        
        # BƯỚC 1: Filter dữ liệu trước khi tính Cosine
        filtered_df = self.df.copy()
        
        # Filter theo intent trước tiên
        if intent == "tim_dia_diem":
            # Chỉ lấy địa điểm du lịch
            filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('du lịch', na=False)]
            print(f"[Recommender] Filtered for tourism: {len(filtered_df)} records")
            
            # Loại bỏ khách sạn/nhà nghỉ nếu người dùng hỏi về "chơi", "vui chơi", "giải trí", "du lịch"
            # Chỉ giữ lại địa điểm vui chơi thực sự (bảo tàng, công viên, khu du lịch...)
            entertainment_keywords = ["chơi", "vui chơi", "giải trí", "tham quan", "khám phá", "du lịch", "đi đâu", "có gì"]
            if user_message and any(keyword in user_message.lower() for keyword in entertainment_keywords):
                # Loại bỏ khách sạn, nhà nghỉ, homestay
                accommodation_types = ["khách sạn", "nhà nghỉ", "nhà khách", "homestay", "hotel", "resort"]
                accommodation_mask = filtered_df['type'].str.lower().str.contains('|'.join(accommodation_types), na=False)
                filtered_df = filtered_df[~accommodation_mask]  # ~ là NOT
                print(f"[Recommender] Excluded accommodations, remaining: {len(filtered_df)} records")
        elif intent == "tim_mon_an":
            # Chỉ lấy địa điểm ẩm thực
            filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('ẩm thực', na=False)]
            print(f"[Recommender] Filtered for food: {len(filtered_df)} records")
            
            # Filter theo place_type nếu có (nhà hàng, quán cà phê...)
            if place_type_entities:
                place_type_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                for place_type in place_type_entities:
                    place_type_lower = place_type.lower()
                    # Map place_type sang type trong database
                    if "nhà hàng" in place_type_lower or "quán ăn" in place_type_lower or "quán cơm" in place_type_lower:
                        mask = filtered_df['type'].str.lower().str.contains('nhà hàng', na=False)
                    elif "cà phê" in place_type_lower or "cafe" in place_type_lower or "coffee" in place_type_lower:
                        mask = filtered_df['type'].str.lower().str.contains('cà phê|cafe|coffee', na=False)
                    elif "quán trà" in place_type_lower or "trà sữa" in place_type_lower:
                        mask = filtered_df['type'].str.lower().str.contains('trà', na=False)
                    elif "bar" in place_type_lower or "pub" in place_type_lower or "bia" in place_type_lower:
                        mask = filtered_df['type'].str.lower().str.contains('bar|pub|bia', na=False)
                    elif place_type_lower == "quán":
                        # Nếu chỉ là "quán" đơn thuần → loại trừ quán cà phê, chỉ lấy nhà hàng/quán ăn
                        mask = filtered_df['type'].str.lower().str.contains('nhà hàng', na=False)
                    else:
                        # Tìm chung chung theo place_type
                        mask = (
                            filtered_df['type'].str.lower().str.contains(place_type_lower, na=False) |
                            filtered_df['name'].str.lower().str.contains(place_type_lower, na=False)
                        )
                    place_type_mask = place_type_mask | mask
                
                if place_type_mask.any():
                    filtered_df = filtered_df[place_type_mask]
                    print(f"[Recommender] Filtered by place_type: {len(filtered_df)} records")
        
        # Nếu có location nhưng không có food cụ thể (chỉ có "ăn gì") → tìm đặc sản ẩm thực
        if location_entities and intent == "tim_mon_an" and (not food_entities or any(f in ["ăn gì", "ăn", "gì", "ngon", "quán"] for f in food_entities)):
            print(f"[Recommender] Tìm đặc sản ẩm thực tại: {location_entities}")
            
            # Filter theo location + chỉ lấy ẩm thực
            # QUAN TRỌNG: CHỈ tìm trong LOCATION, KHÔNG tìm trong ADDRESS
            location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            for location in location_entities:
                location_lower = location.lower()
                # Xử lý đặc biệt cho TP.HCM
                if location_lower in ["hồ chí minh", "hồ chín minh", "tphcm", "tp.hcm", "hcm", "sài gòn", "saigon"]:
                    # Tìm các quận thuộc TP.HCM
                    hcm_patterns = ["quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", 
                                    "quận 8", "quận 9", "quận 10", "quận 11", "quận 12", 
                                    "bình thạnh", "tân bình", "tân phú", "phú nhuận", 
                                    "gò vấp", "bình tán", "thủ đức"]
                    mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    for pattern in hcm_patterns:
                        mask = mask | filtered_df['location'].str.lower().str.contains(pattern, na=False)
                        mask = mask | filtered_df['address'].str.lower().str.contains(pattern, na=False)
                else:
                    # CHỈ tìm trong LOCATION
                    mask = filtered_df['location'].str.lower().str.contains(location_lower, na=False)
                location_mask = location_mask | mask
            
            filtered_df = filtered_df[location_mask]
            print(f"[Recommender] Found {len(filtered_df)} food places in location")
        
        # Nếu có location và intent là du lịch → tìm địa điểm du lịch
        elif location_entities and intent == "tim_dia_diem":
            print(f"[Recommender] Tìm địa điểm du lịch tại: {location_entities}")
            
            # Filter theo location
            # QUAN TRỌNG: CHỈ tìm trong cột LOCATION (tỉnh/thành phố), KHÔNG tìm trong ADDRESS
            # Vì ADDRESS có thể chứa tên đường/tòa nhà có "Sài Gòn", "Hà Nội"... nhưng thực tế ở tỉnh khác
            location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            for location in location_entities:
                location_lower = location.lower()
                # Xử lý đặc biệt cho TP.HCM vì location lưu là tên quận
                if location_lower in ["hồ chí minh", "hồ chín minh", "tphcm", "tp.hcm", "hcm", "sài gòn", "saigon"]:
                    # Tìm tất cả các quận thuộc TP.HCM
                    # CHỈ match trong location và address với tên quận cụ thể
                    # KHÔNG match "hồ chí minh" trong address vì có thể là tên đường
                    hcm_patterns = ["quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", 
                                    "quận 8", "quận 9", "quận 10", "quận 11", "quận 12", 
                                    "bình thạnh", "tân bình", "tân phú", "phú nhuận", 
                                    "gò vấp", "bình tán", "thủ đức", "tp.hcm", "tphcm"]
                    # Tìm trong location hoặc address có chứa tên quận HCM
                    mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    for pattern in hcm_patterns:
                        mask = mask | filtered_df['location'].str.lower().str.contains(pattern, na=False)
                        # Chỉ match trong address nếu là tên quận, không phải "hồ chí minh" chung chung
                        if pattern not in ["tp.hcm", "tphcm"]:
                            mask = mask | filtered_df['address'].str.lower().str.contains(pattern, na=False)
                else:
                    # CHỈ tìm trong LOCATION, KHÔNG tìm trong ADDRESS
                    mask = filtered_df['location'].str.lower().str.contains(location_lower, na=False)
                location_mask = location_mask | mask
            
            filtered_df = filtered_df[location_mask]
            print(f"[Recommender] Found {len(filtered_df)} tourism places in location")
        
        # Filter theo food entities (nếu có)
        elif food_entities:
            food_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            for food in food_entities:
                food_lower = food.lower()
                # Bỏ qua từ quá chung chung hoặc đã được xử lý ở place_type
                if food_lower in ["ngon", "tốt", "hay", "quán", "nhà hàng", "quán ăn", "ăn", "đồ ăn", "thức ăn"]:
                    continue
                mask = (
                    filtered_df['name'].str.lower().str.contains(food_lower, na=False) |
                    filtered_df['description'].str.lower().str.contains(food_lower, na=False) |
                    filtered_df['tags'].str.lower().str.contains(food_lower, na=False)
                )
                food_mask = food_mask | mask
            
            # Nếu có food entities thực sự (không chỉ là "ngon", "quán")
            if food_mask.any():
                filtered_df = filtered_df[food_mask]
                print(f"[Recommender] After food filter: {len(filtered_df)} records")
                
                # Filter theo location entities (nếu có) - ưu tiên cao
                if location_entities and len(filtered_df) > 0:
                    location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    for location in location_entities:
                        location_lower = location.lower()
                        # Xử lý đặc biệt cho TP.HCM
                        if location_lower in ["hồ chí minh", "hồ chín minh", "tphcm", "tp.hcm", "hcm", "sài gòn", "saigon"]:
                            # CHỈ tìm trong LOCATION với tên quận, KHÔNG tìm "sài gòn" trong ADDRESS
                            hcm_patterns = ["quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", 
                                            "quận 8", "quận 9", "quận 10", "quận 11", "quận 12", 
                                            "bình thạnh", "tân bình", "tân phú", "phú nhuận", 
                                            "gò vấp", "bình tán", "thủ đức"]
                            mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                            for pattern in hcm_patterns:
                                mask = mask | filtered_df['location'].str.lower().str.contains(pattern, na=False)
                                mask = mask | filtered_df['address'].str.lower().str.contains(pattern, na=False)
                        else:
                            # CHỈ tìm trong LOCATION, KHÔNG tìm trong ADDRESS
                            mask = filtered_df['location'].str.lower().str.contains(location_lower, na=False)
                        location_mask = location_mask | mask
                    
                    location_filtered = filtered_df[location_mask]
                    print(f"[Recommender] After location filter: {len(location_filtered)} records")
                    
                    # Ưu tiên location match - nếu có kết quả thì dùng
                    if len(location_filtered) >= 1:
                        filtered_df = location_filtered
                    else:
                        print(f"[Recommender] No location match, keeping food results")
                        # Đánh dấu không tìm thấy ở địa phương
                        location_not_found = True
                        searched_location = ", ".join(location_entities)
            else:
                # Nếu chỉ có từ chung chung mà không có food thực sự → tìm theo location
                if location_entities:
                    location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    for location in location_entities:
                        location_lower = location.lower()
                        mask = (
                            (filtered_df['location'].str.lower().str.contains(location_lower, na=False) |
                             filtered_df['address'].str.lower().str.contains(location_lower, na=False)) &
                            (filtered_df['tags'].str.lower().str.contains('ẩm thực', na=False))
                        )
                        location_mask = location_mask | mask
                    
                    filtered_df = filtered_df[location_mask]
                    print(f"[Recommender] Found {len(filtered_df)} food places in location (fallback)")
                    
                    # Nếu có place_type, filter thêm
                    if place_type_entities and len(filtered_df) > 0:
                        place_type_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                        for place_type in place_type_entities:
                            place_type_lower = place_type.lower()
                            if "nhà hàng" in place_type_lower or "quán ăn" in place_type_lower:
                                mask = filtered_df['type'].str.lower().str.contains('nhà hàng', na=False)
                            elif "cà phê" in place_type_lower or "cafe" in place_type_lower:
                                mask = filtered_df['type'].str.lower().str.contains('cà phê|cafe|coffee', na=False)
                            else:
                                mask = filtered_df['type'].str.lower().str.contains(place_type_lower, na=False)
                            place_type_mask = place_type_mask | mask
                        
                        if place_type_mask.any():
                            filtered_df = filtered_df[place_type_mask]
                            print(f"[Recommender] Filtered by place_type in fallback: {len(filtered_df)} records")
        
        # Nếu filter quá ít kết quả, fallback nhưng VẪN GIỮ intent filter VÀ accommodation filter
        if len(filtered_df) < 3:
            print(f"[Recommender] Too few results after filter ({len(filtered_df)}), fallback but keep intent filter")
            # Nếu có location entities và kết quả < 3 → đánh dấu không tìm thấy
            if location_entities and not location_not_found:
                location_not_found = True
                searched_location = ", ".join(location_entities)
            
            # Fallback: Bỏ location filter nhưng GIỮ intent filter VÀ accommodation filter
            filtered_df = self.df.copy()
            # Re-apply intent filter
            if intent == "tim_mon_an":
                filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('ẩm thực', na=False)]
                print(f"[Recommender] Fallback to all food places: {len(filtered_df)} records")
            elif intent == "tim_dia_diem":
                filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('du lịch', na=False)]
                # Re-apply accommodation filter nếu có từ khóa giải trí
                entertainment_keywords = ["chơi", "vui chơi", "giải trí", "tham quan", "khám phá", "du lịch", "đi đâu", "có gì"]
                if user_message and any(keyword in user_message.lower() for keyword in entertainment_keywords):
                    accommodation_types = ["khách sạn", "nhà nghỉ", "nhà khách", "homestay", "hotel", "resort"]
                    accommodation_mask = filtered_df['type'].str.lower().str.contains('|'.join(accommodation_types), na=False)
                    filtered_df = filtered_df[~accommodation_mask]
                    print(f"[Recommender] Fallback to entertainment places (no accommodations): {len(filtered_df)} records")
                else:
                    print(f"[Recommender] Fallback to all tourism places: {len(filtered_df)} records")
        
        # BƯỚC 2: Tính Cosine Similarity trên dữ liệu đã filter
        # Lấy nhiều hơn top_k để có dự phòng khi lọc trùng lặp
        fetch_k = top_k * 3  # Lấy gấp 3 để đảm bảo đủ sau khi lọc trùng
        
        if len(filtered_df) == len(self.df):
            # Dùng ma trận TF-IDF đã tính sẵn
            query_vector = self.vectorizer.transform([processed_query])
            similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
            top_indices = similarity_scores.argsort()[::-1][:fetch_k]
        else:
            # Tính TF-IDF cho subset
            filtered_indices = filtered_df.index.tolist()
            filtered_tfidf = self.tfidf_matrix[filtered_indices]
            
            query_vector = self.vectorizer.transform([processed_query])
            similarity_scores = cosine_similarity(query_vector, filtered_tfidf).flatten()
            
            # Map về indices gốc
            top_local_indices = similarity_scores.argsort()[::-1][:fetch_k]
            top_indices = [filtered_indices[i] for i in top_local_indices]
        
        # BƯỚC 3: Đóng gói kết quả VÀ lọc trùng lặp + đa dạng hóa loại địa điểm
        results = []
        seen_names = set()  # Track tên đã thấy để tránh trùng lặp
        seen_types = {}  # Track số lượng mỗi loại đã thêm để đa dạng hóa
        
        # Chỉ áp dụng đa dạng hóa cho du lịch, không áp dụng cho món ăn
        # Vì khi tìm "phở", người dùng muốn thấy nhiều quán phở, không cần đa dạng
        apply_diversification = (intent == "tim_dia_diem")
        max_per_type = 2 if apply_diversification else 999  # Không giới hạn cho món ăn
        
        for idx in top_indices:
            if len(filtered_df) == len(self.df):
                score = similarity_scores[idx]
            else:
                local_idx = filtered_indices.index(idx)
                score = similarity_scores[local_idx]
            
            # Không filter theo score nữa - vì đã filter chặt chẽ theo intent/place_type/location rồi
            # Chỉ đảm bảo score >= 0 (không âm)
            if score < 0:
                score = 0.0001  # Set minimum score
                
            row = self.df.iloc[idx]
            place_name = row['name']
            place_type = row['type']
            
            # Bỏ qua nếu tên đã xuất hiện (deduplication)
            if place_name in seen_names:
                print(f"[Recommender] Skipping duplicate: {place_name}")
                continue
            
            # Filter bỏ tên quá chung chung (không có thông tin cụ thể)
            # Ví dụ: "Phở", "Quán Phở", "Bún Bò", "Nhà Hàng"...
            name_lower = place_name.lower().strip()
            generic_names = {
                "phở", "quán phở", "bún", "quán bún", "bún bò", "bún chả",
                "cơm", "quán cơm", "bánh mì", "quán bánh mì",
                "nhà hàng", "quán ăn", "quán", "tiệm", "cửa hàng",
                "cà phê", "quán cà phê", "cafe", "coffee",
                "1", "2", "3", "a", "b", "c", "d", "g",  # Tên 1 ký tự
                "phở hà nội", "phở bò", "cơm phở", "phở gà",  # Tên món + địa điểm/loại
                "bún bò hà nội", "bún chả hà nội", "bánh mì hà nội"
            }
            if name_lower in generic_names:
                print(f"[Recommender] Skipping generic name: {place_name}")
                continue
            
            # Kiểm tra đa dạng loại địa điểm (chỉ áp dụng khi có nhiều kết quả)
            # Nếu đã có quá nhiều địa điểm cùng loại, ưu tiên loại khác
            if len(results) < top_k:  # Chỉ áp dụng khi chưa đủ kết quả
                type_count = seen_types.get(place_type, 0)
                if type_count >= max_per_type and len(results) > 0:
                    # Đã có đủ loại này rồi, tìm loại khác
                    print(f"[Recommender] Skipping {place_name} ({place_type}) - already have {type_count} of this type")
                    continue
            
            seen_names.add(place_name)
            seen_types[place_type] = seen_types.get(place_type, 0) + 1
            
            results.append({
                "id": row['id'],
                "name": place_name,
                "type": place_type,
                "description": row['description'],
                "location": row['location'],
                "address": row.get('address', ''),
                "tags": row['tags'],
                "score": round(float(score), 4)
            })
            
            # Dừng khi đã đủ top_k kết quả unique
            if len(results) >= top_k:
                break
        
        # Debug: In ra kết quả cuối cùng sau khi lọc trùng
        print(f"[Recommender] Final {len(results)} unique results:")
        for i, result in enumerate(results):
            print(f"  {i+1}. {result['name']} ({result['type']}) - Score: {result['score']}")
        
        return {
            "results": results,
            "location_not_found": location_not_found,
            "searched_location": searched_location
        }
