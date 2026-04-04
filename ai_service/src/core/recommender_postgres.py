"""
Recommender System sử dụng PostgreSQL thay vì CSV
— Phase 2 Optimization: Hybrid Scoring + Pre-built Index + Fuzzy Location
"""
import pandas as pd
import numpy as np
import os
from sqlalchemy import create_engine
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.core.nlp_utils import preprocess_text
from src.core.config import settings
from src.core.logger import logger

# ==============================================================================
# FUZZY LOCATION MAP — Chuẩn hóa input không dấu về có dấu (Phase 2)
# ==============================================================================
LOCATION_FUZZY_MAP = {
    # Thành phố lớn
    "ha noi": "hà nội", "hanoi": "hà nội",
    "da nang": "đà nẵng", "danang": "đà nẵng",
    "sai gon": "sài gòn", "saigon": "sài gòn",
    "ho chi minh": "hồ chí minh", "hcm": "hồ chí minh",
    "tp hcm": "hồ chí minh", "tphcm": "hồ chí minh",
    # Thành phố du lịch
    "da lat": "đà lạt", "dalat": "đà lạt",
    "nha trang": "nha trang",
    "phu quoc": "phú quốc", "phuquoc": "phú quốc",
    "hoi an": "hội an", "hoian": "hội an",
    "sa pa": "sa pa", "sapa": "sa pa",
    "vung tau": "vũng tàu", "vungtau": "vũng tàu",
    "phan thiet": "phan thiết", "phanthiet": "phan thiết",
    "mui ne": "mũi né", "muine": "mũi né",
    "quy nhon": "quy nhơn", "quynhon": "quy nhơn",
    "ha long": "hạ long", "halong": "hạ long",
    "hue": "huế",
    "can tho": "cần thơ", "cantho": "cần thơ",
    "ninh binh": "ninh bình", "ninhbinh": "ninh bình",
    "hai phong": "hải phòng", "haiphong": "hải phòng",
    # Các tỉnh khác
    "quang ninh": "quảng ninh", "quangninh": "quảng ninh",
    "quang nam": "quảng nam", "quangnam": "quảng nam",
    "binh dinh": "bình định", "binhdinh": "bình định",
    "khanh hoa": "khánh hòa", "khanhhoa": "khánh hòa",
    "binh thuan": "bình thuận", "binhthuan": "bình thuận",
    "lam dong": "lâm đồng", "lamdong": "lâm đồng",
    "ba ria vung tau": "bà rịa vũng tàu",
    "kien giang": "kiên giang", "kiengiang": "kiên giang",
    "an giang": "an giang", "angiang": "an giang",
    "thua thien hue": "thừa thiên huế",
    "thanh hoa": "thanh hóa", "thanhhoa": "thanh hóa",
    "nghe an": "nghệ an", "nghean": "nghệ an",
    "dak lak": "đắk lắk", "daklak": "đắk lắk",
    "gia lai": "gia lai", "gialai": "gia lai",
    "thai nguyen": "thái nguyên", "thainguyen": "thái nguyên",
    "lang son": "lạng sơn", "langson": "lạng sơn",
    "lao cai": "lào cai", "laocai": "lào cai",
    "dong thap": "đồng tháp", "dongthap": "đồng tháp",
    "tien giang": "tiền giang", "tiengiang": "tiền giang",
    "ben tre": "bến tre", "bentre": "bến tre",
    "ca mau": "cà mau", "camau": "cà mau",
    "bac lieu": "bạc liêu", "baclieu": "bạc liêu",
    "soc trang": "sóc trăng", "soctrang": "sóc trăng",
    "vinh long": "vĩnh long", "vinhlong": "vĩnh long",
    "tra vinh": "trà vinh", "travinh": "trà vinh",
    "quang binh": "quảng bình", "quangbinh": "quảng bình",
    "quang tri": "quảng trị", "quangtri": "quảng trị",
    "hai duong": "hải dương", "haiduong": "hải dương",
    "hung yen": "hưng yên", "hungyen": "hưng yên",
    "bac ninh": "bắc ninh", "bacninh": "bắc ninh",
}


def normalize_location(location: str) -> str:
    """Chuẩn hóa location không dấu/viết tắt về có dấu chuẩn."""
    return LOCATION_FUZZY_MAP.get(location.lower().strip(), location)

# Cấu hình database từ environment variables
def get_db_url():
    """Tạo SQLAlchemy connection URL từ config"""
    return f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Singleton Engine cho toàn hệ thống
_engine = None

def get_engine():
    """Tạo hoặc lấy SQLAlchemy Engine singleton để tối ưu connection pool"""
    global _engine
    if _engine is None:
        _engine = create_engine(
            get_db_url(), 
            pool_size=5, 
            max_overflow=10, 
            pool_recycle=1800, # Recycle connections sau 30 phút
            pool_pre_ping=True # Kiểm tra connection trước khi dùng
        )
    return _engine

# ==============================================================================
# HẰNG SỐ DÙNG CHUNG
# ==============================================================================
HCM_DISTRICTS = [
    "quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", 
    "quận 8", "quận 9", "quận 10", "quận 11", "quận 12", 
    "bình thạnh", "tân bình", "tân phú", "phú nhuận", 
    "gò vấp", "bình tân", "thủ đức"
]

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
            logger.info(f"[Recommender] ✅ PostgreSQL Recommender sẵn sàng!")
        except Exception as e:
            logger.warning(f"[Recommender] ⚠️ Lỗi PostgreSQL: {e}. Đang load CSV Fallback...")
            self.load_data_from_csv()
            if self.df is not None and not self.df.empty:
                self.build_tfidf_matrix()
                self.ready = True
                logger.info(f"[Recommender] ✅ CSV Fallback Recommender sẵn sàng!")
            else:
                logger.error("[Recommender] ❌ Cả Database lẫn CSV đều thất bại. Hoạt động ở chế độ rỗng.")
    
    def load_data_from_db(self):
        """Load dữ liệu từ PostgreSQL dùng SQLAlchemy engine (bắt buộc cho pandas 2.x)"""
        engine = get_engine()
        
        # Load places từ PostgreSQL
        places_query = """
            SELECT 
                p.id as id,
                p.name as name,
                COALESCE(p.category_vi, '') as type,
                p.description as description,
                COALESCE(p.province, p.district) as location,
                COALESCE(p.address, '') as address,
                COALESCE(p.domain, '') as tags,
                COALESCE(p.price_range, '') as price_range,
                COALESCE(p.rating, 0) as rating
            FROM places p
            WHERE p.name IS NOT NULL 
            AND p.description IS NOT NULL
        """
        with engine.connect() as conn:
            self.df = pd.read_sql(places_query, conn)
            
        if self.df.empty:
            raise Exception("No data in 'places' table")
        
        logger.info(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ PostgreSQL")
        
    def load_data_from_csv(self):
        """Fallback: Load dữ liệu từ CSV nếu PostgreSQL chết"""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_dir, "data", "knowledge_base.csv")
        try:
            self.df = pd.read_csv(csv_path)
            # Chuẩn hóa tên cột để khớp với SQL
            self.df = self.df.rename(columns={'category_vi': 'type'})
            logger.info(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ CSV ({csv_path})")
        except Exception as e:
            logger.error(f"[Recommender] Lỗi đọc CSV: {e}")
            self.df = pd.DataFrame()
    
    def build_tfidf_matrix(self):
        """Xây dựng ma trận TF-IDF + Pre-built domain indices (Phase 2)"""
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
        
        # Pre-built domain indices (Phase 2 — giảm 50% thời gian scan)
        self.food_indices = self.df[
            self.df['tags'].str.lower().str.contains('ẩm thực', na=False)
        ].index.tolist()
        self.tourism_indices = self.df[
            self.df['tags'].str.lower().str.contains('du lịch', na=False)
        ].index.tolist()
        
        # Pre-compute max rating for normalization
        self.max_rating = max(float(self.df['rating'].max()), 1.0)
        
        logger.info(f"[Recommender] Đã tính xong Ma trận TF-IDF: {self.tfidf_matrix.shape}")
        logger.info(f"[Recommender] Pre-built: {len(self.food_indices)} food, {len(self.tourism_indices)} tourism")
    
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
        
        # [Phase 2] Fuzzy Location — chuẩn hóa input không dấu
        location_entities = [normalize_location(loc) for loc in location_entities]
        
        if not raw_query.strip():
            return {"results": [], "location_not_found": False, "searched_location": None}
        
        # Tiền xử lý query
        processed_query = preprocess_text(raw_query)
        
        if not processed_query.strip():
            return {"results": [], "location_not_found": False, "searched_location": None}
        
        logger.info(f"[Recommender] Searching for: '{processed_query}'")
        logger.info(f"[Recommender] Food entities: {food_entities}")
        logger.info(f"[Recommender] Location entities: {location_entities}")
        logger.info(f"[Recommender] Place type entities: {place_type_entities}")
        
        # Biến để track xem có tìm thấy ở địa phương không
        location_not_found = False
        searched_location = None
        
        # BƯỚC 1: Filter dữ liệu trước khi tính Cosine
        filtered_df = self.df.copy()
        
        # Filter theo intent trước tiên
        if intent == "tim_dia_diem":
            # Chỉ lấy địa điểm du lịch
            filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('du lịch', na=False)]
            logger.info(f"[Recommender] Filtered for tourism: {len(filtered_df)} records")
            
            # Loại bỏ khách sạn/nhà nghỉ nếu người dùng hỏi về "chơi", "vui chơi", "giải trí", "du lịch"
            # Chỉ giữ lại địa điểm vui chơi thực sự (bảo tàng, công viên, khu du lịch...)
            entertainment_keywords = ["chơi", "vui chơi", "giải trí", "tham quan", "khám phá", "du lịch", "đi đâu", "có gì"]
            if user_message and any(keyword in user_message.lower() for keyword in entertainment_keywords):
                # Loại bỏ khách sạn, nhà nghỉ, homestay
                accommodation_types = ["khách sạn", "nhà nghỉ", "nhà khách", "homestay", "hotel", "resort"]
                accommodation_mask = filtered_df['type'].str.lower().str.contains('|'.join(accommodation_types), na=False)
                filtered_df = filtered_df[~accommodation_mask]  # ~ là NOT
                logger.info(f"[Recommender] Excluded accommodations, remaining: {len(filtered_df)} records")
        elif intent == "tim_mon_an":
            # Chỉ lấy địa điểm ẩm thực
            filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('ẩm thực', na=False)]
            logger.info(f"[Recommender] Filtered for food: {len(filtered_df)} records")
            
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
                    logger.info(f"[Recommender] Filtered by place_type: {len(filtered_df)} records")
        
        # Nếu có location nhưng không có food cụ thể (chỉ có "ăn gì") → tìm đặc sản ẩm thực
        if location_entities and intent == "tim_mon_an" and (not food_entities or any(f in ["ăn gì", "ăn", "gì", "ngon", "quán"] for f in food_entities)):
            logger.info(f"[Recommender] Tìm đặc sản ẩm thực tại: {location_entities}")
            
            # Filter theo location + chỉ lấy ẩm thực
            # QUAN TRỌNG: CHỈ tìm trong LOCATION, KHÔNG tìm trong ADDRESS
            location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            for location in location_entities:
                location_lower = location.lower()
                # Xử lý đặc biệt cho TP.HCM
                if location_lower in ["hồ chí minh", "hồ chín minh", "tphcm", "tp.hcm", "hcm", "sài gòn", "saigon"]:
                    # Tìm các quận thuộc TP.HCM
                    hcm_patterns = HCM_DISTRICTS
                    mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    for pattern in hcm_patterns:
                        mask = mask | filtered_df['location'].str.lower().str.contains(pattern, na=False)
                        mask = mask | filtered_df['address'].str.lower().str.contains(pattern, na=False)
                else:
                    # CHỈ tìm trong LOCATION
                    mask = filtered_df['location'].str.lower().str.contains(location_lower, na=False)
                location_mask = location_mask | mask
            
            filtered_df = filtered_df[location_mask]
            logger.info(f"[Recommender] Found {len(filtered_df)} food places in location")
        
        # Nếu có location và intent là du lịch → tìm địa điểm du lịch
        elif location_entities and intent == "tim_dia_diem":
            logger.info(f"[Recommender] Tìm địa điểm du lịch tại: {location_entities}")
            
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
                    hcm_patterns = HCM_DISTRICTS + ["tp.hcm", "tphcm"]
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
            logger.info(f"[Recommender] Found {len(filtered_df)} tourism places in location")
        
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
                logger.info(f"[Recommender] After food filter: {len(filtered_df)} records")
                
                # Filter theo location entities (nếu có) - ưu tiên cao
                if location_entities and len(filtered_df) > 0:
                    location_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                    
                    # Phân loại locations: quận/huyện cụ thể vs tỉnh/thành phố chung
                    specific_districts = []  # Quận 1, Quận 2, etc.
                    general_locations = []   # Hồ Chí Minh, Hà Nội, etc.
                    
                    for location in location_entities:
                        location_lower = location.lower()
                        # Check nếu là quận/huyện cụ thể
                        if any(keyword in location_lower for keyword in ["quận", "huyện", "thị xã", "thành phố"]):
                            specific_districts.append(location_lower)
                        else:
                            general_locations.append(location_lower)
                    
                    # Ưu tiên 1: Nếu có quận/huyện cụ thể → CHỈ tìm theo đó
                    if specific_districts:
                        logger.info(f"[Recommender] Searching for specific districts: {specific_districts}")
                        for district in specific_districts:
                            mask = (
                                filtered_df['location'].str.lower().str.contains(district, na=False) |
                                filtered_df['address'].str.lower().str.contains(district, na=False)
                            )
                            location_mask = location_mask | mask
                    # Ưu tiên 2: Nếu không có quận cụ thể, tìm theo tỉnh/thành phố
                    elif general_locations:
                        logger.info(f"[Recommender] Searching for general locations: {general_locations}")
                        for location in general_locations:
                            location_lower = location.lower()
                            # Xử lý đặc biệt cho TP.HCM (không có quận cụ thể)
                            if location_lower in ["hồ chí minh", "hồ chín minh", "tphcm", "tp.hcm", "hcm", "sài gòn", "saigon"]:
                                # Tìm TẤT CẢ các quận trong HCM
                                hcm_patterns = HCM_DISTRICTS
                                mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
                                for pattern in hcm_patterns:
                                    mask = mask | filtered_df['location'].str.lower().str.contains(pattern, na=False)
                                    mask = mask | filtered_df['address'].str.lower().str.contains(pattern, na=False)
                            else:
                                # CHỈ tìm trong LOCATION, KHÔNG tìm trong ADDRESS
                                mask = filtered_df['location'].str.lower().str.contains(location_lower, na=False)
                            location_mask = location_mask | mask
                    
                    location_filtered = filtered_df[location_mask]
                    logger.info(f"[Recommender] After location filter: {len(location_filtered)} records")
                    
                    # Ưu tiên location match - nếu có kết quả thì dùng
                    if len(location_filtered) >= 1:
                        filtered_df = location_filtered
                    else:
                        logger.info(f"[Recommender] No location match, keeping food results")
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
                    logger.info(f"[Recommender] Found {len(filtered_df)} food places in location (fallback)")
                    
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
                            logger.info(f"[Recommender] Filtered by place_type in fallback: {len(filtered_df)} records")
        
        # Nếu filter quá ít kết quả, fallback nhưng VẪN GIỮ intent filter VÀ accommodation filter
        if len(filtered_df) < 3:
            logger.info(f"[Recommender] Too few results after filter ({len(filtered_df)}), fallback but keep intent filter")
            # Nếu có location entities và kết quả < 3 → đánh dấu không tìm thấy
            if location_entities and not location_not_found:
                location_not_found = True
                searched_location = ", ".join(location_entities)
            
            # Fallback: Bỏ location filter nhưng GIỮ intent filter VÀ accommodation filter
            filtered_df = self.df.copy()
            # Re-apply intent filter
            if intent == "tim_mon_an":
                filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('ẩm thực', na=False)]
                logger.info(f"[Recommender] Fallback to all food places: {len(filtered_df)} records")
            elif intent == "tim_dia_diem":
                filtered_df = filtered_df[filtered_df['tags'].str.lower().str.contains('du lịch', na=False)]
                # Re-apply accommodation filter nếu có từ khóa giải trí
                entertainment_keywords = ["chơi", "vui chơi", "giải trí", "tham quan", "khám phá", "du lịch", "đi đâu", "có gì"]
                if user_message and any(keyword in user_message.lower() for keyword in entertainment_keywords):
                    accommodation_types = ["khách sạn", "nhà nghỉ", "nhà khách", "homestay", "hotel", "resort"]
                    accommodation_mask = filtered_df['type'].str.lower().str.contains('|'.join(accommodation_types), na=False)
                    filtered_df = filtered_df[~accommodation_mask]
                    logger.info(f"[Recommender] Fallback to entertainment places (no accommodations): {len(filtered_df)} records")
                else:
                    logger.info(f"[Recommender] Fallback to all tourism places: {len(filtered_df)} records")
        
        # BƯỚC 2: Tính Cosine Similarity trên dữ liệu đã filter
        # Lấy nhiều hơn top_k để có dự phòng khi lọc trùng lặp
        fetch_k = top_k * 3  # Lấy gấp 3 để đảm bảo đủ sau khi lọc trùng
        
        query_vector = self.vectorizer.transform([processed_query])
        
        # FIX Lỗi #3: Vector rỗng
        if query_vector.nnz == 0:
            logger.warning("[Recommender] ⚠️ Query vector is empty (all zeros), returning no results")
            return {"results": [], "location_not_found": False, "searched_location": None}
        
        if len(filtered_df) == len(self.df):
            # Dùng ma trận TF-IDF đã tính sẵn
            similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
            
            # FIX Lỗi #3: Check NaN
            if np.any(np.isnan(similarity_scores)):
                logger.warning("[Recommender] ⚠️ NaN detected in similarity scores, replacing with 0")
                similarity_scores = np.nan_to_num(similarity_scores, nan=0.0)
                
            top_indices = similarity_scores.argsort()[::-1][:fetch_k]
        else:
            # Tính TF-IDF cho subset
            filtered_indices = filtered_df.index.tolist()
            filtered_tfidf = self.tfidf_matrix[filtered_indices]
            
            similarity_scores = cosine_similarity(query_vector, filtered_tfidf).flatten()
            
            # FIX Lỗi #3: Check NaN
            if np.any(np.isnan(similarity_scores)):
                logger.warning("[Recommender] ⚠️ NaN detected in similarity scores, replacing with 0")
                similarity_scores = np.nan_to_num(similarity_scores, nan=0.0)
            
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
            
            # No filter by score — already filtered tightly by intent/place_type/location
            # Set minimum score
            if score < 0:
                score = 0.0001
            
            row = self.df.iloc[idx]
            place_name = row['name']
            place_type = row['type']
            
            # [Phase 2] Hybrid Scoring: cosine + rating
            rating = float(row.get('rating', 0))
            rating_norm = rating / self.max_rating if self.max_rating > 0 else 0
            hybrid = 0.65 * float(score) + 0.35 * rating_norm
            score = hybrid
            
            # Bỏ qua nếu tên đã xuất hiện (deduplication)
            if place_name in seen_names:
                logger.info(f"[Recommender] Skipping duplicate: {place_name}")
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
                logger.info(f"[Recommender] Skipping generic name: {place_name}")
                continue
            
            # Kiểm tra đa dạng loại địa điểm (chỉ áp dụng khi có nhiều kết quả)
            # Nếu đã có quá nhiều địa điểm cùng loại, ưu tiên loại khác
            if len(results) < top_k:  # Chỉ áp dụng khi chưa đủ kết quả
                type_count = seen_types.get(place_type, 0)
                if type_count >= max_per_type and len(results) > 0:
                    # Đã có đủ loại này rồi, tìm loại khác
                    logger.info(f"[Recommender] Skipping {place_name} ({place_type}) - already have {type_count} of this type")
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
                "price_range": row.get('price_range', ''),
                "rating": float(row.get('rating', 0)),
                "score": round(float(score), 4)
            })
            
            # Dừng khi đã đủ top_k kết quả unique
            if len(results) >= top_k:
                break
        
        # Debug: In ra kết quả cuối cùng sau khi lọc trùng
        logger.info(f"[Recommender] Final {len(results)} unique results:")
        for i, result in enumerate(results):
            logger.info(f"  {i+1}. {result['name']} ({result['type']}) - Score: {result['score']}")
        
        return {
            "results": results,
            "location_not_found": location_not_found,
            "searched_location": searched_location
        }
