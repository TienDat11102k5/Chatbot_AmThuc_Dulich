"""
File: src/core/location_handler.py
Mục đích: Xử lý logic cho intent "hoi_vi_tri" (câu hỏi "gần đây có gì?")
          Khi user hỏi về địa điểm gần đây, cần:
          1. Hỏi lại vị trí hiện tại của user (nếu chưa có)
          2. Tính khoảng cách từ vị trí user đến các địa điểm trong database
          3. Trả về Top 3 địa điểm gần nhất
"""

import os
from typing import Dict, List, Optional
from sqlalchemy import text
from src.core.recommender_postgres import get_engine

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

class LocationHandler:
    """
    Class xử lý các câu hỏi về vị trí và tìm kiếm địa điểm gần đây
    """
    
    def __init__(self):
        """Khởi tạo connection pool để tối ưu performance"""
        self.db_config = get_db_config()
    
    def handle_nearby_query(self, entities: Dict, user_location: Optional[Dict] = None) -> Dict:
        """
        Xử lý câu hỏi "gần đây có gì?"
        
        Args:
            entities: Kết quả từ NER (food, location, raw_query)
            user_location: {"lat": 10.762622, "lng": 106.660172, "address": "TP.HCM"}
            
        Returns:
            Dict với format:
            - Nếu chưa có vị trí: {"ask_location": True, "message": "Bạn đang ở đâu?"}
            - Nếu có vị trí: {"recommendations": [...], "message": "Gần bạn có:"}
        """
        # Bước 1: Kiểm tra xem user đã cung cấp vị trí chưa
        if not user_location or not user_location.get('lat') or not user_location.get('lng'):
            return {
                "ask_location": True,
                "message": "Để tìm địa điểm gần bạn, mình cần biết bạn đang ở đâu. Bạn có thể chia sẻ vị trí hiện tại không?",
                "recommendations": []
            }
        
        # Bước 2: Tìm địa điểm gần nhất trong database
        try:
            nearby_places = self._find_nearby_places(
                user_lat=user_location['lat'],
                user_lng=user_location['lng'],
                food_filter=entities.get('food', []),
                radius_km=10,  # Tìm trong bán kính 10km
                limit=5
            )
            
            if not nearby_places:
                return {
                    "ask_location": False,
                    "message": f"Mình không tìm thấy địa điểm nào gần {user_location.get('address', 'vị trí của bạn')} trong bán kính 10km. Bạn thử mở rộng khu vực tìm kiếm nhé!",
                    "recommendations": []
                }
            
            # Bước 3: Format kết quả
            message = f"🗺️ Gần {user_location.get('address', 'vị trí của bạn')} có những địa điểm này:"
            
            return {
                "ask_location": False,
                "message": message,
                "recommendations": nearby_places
            }
            
        except Exception as e:
            print(f"[LocationHandler] Lỗi khi tìm địa điểm gần: {e}")
            return {
                "ask_location": False,
                "message": "Xin lỗi, có lỗi khi tìm kiếm địa điểm gần bạn. Bạn thử lại sau nhé!",
                "recommendations": []
            }
    
    def _find_nearby_places(self, user_lat: float, user_lng: float, 
                           food_filter: List[str], radius_km: int = 10, 
                           limit: int = 5) -> List[Dict]:
        """
        Tìm địa điểm gần nhất sử dụng PostgreSQL và hàm calculate_distance
        
        Args:
            user_lat, user_lng: Tọa độ GPS của user
            food_filter: Danh sách món ăn user quan tâm (từ NER)
            radius_km: Bán kính tìm kiếm (km)
            limit: Số lượng kết quả tối đa
            
        Returns:
            List[Dict]: Danh sách địa điểm gần nhất với thông tin khoảng cách
        """
        engine = get_engine()
        
        try:
            # Query tìm địa điểm gần với filter món ăn (nếu có)
            base_query = """
                SELECT 
                    CONCAT('PLACE_', id) as id,
                    name,
                    category_vi as type,
                    description,
                    province as location,
                    COALESCE(address, '') as address,
                    COALESCE(domain, '') as tags,
                    latitude,
                    longitude,
                    calculate_distance(:user_lat, :user_lng, latitude, longitude) as distance_km
                FROM places 
                WHERE latitude IS NOT NULL 
                AND longitude IS NOT NULL
                AND calculate_distance(:user_lat, :user_lng, latitude, longitude) <= :radius_km
            """
            
            params = {
                "user_lat": user_lat, 
                "user_lng": user_lng, 
                "radius_km": radius_km,
                "limit": limit
            }
            
            # Thêm filter món ăn nếu có
            if food_filter:
                food_conditions = []
                for i, food in enumerate(food_filter):
                    param_name = f"food_{i}"
                    food_conditions.append(f"(LOWER(name) LIKE :{param_name} OR LOWER(description) LIKE :{param_name} OR LOWER(domain) LIKE :{param_name})")
                    params[param_name] = f"%{food.lower()}%"
                
                base_query += " AND (" + " OR ".join(food_conditions) + ")"
            
            # Sắp xếp theo khoảng cách và giới hạn kết quả
            base_query += " ORDER BY distance_km ASC LIMIT :limit"
            
            with engine.connect() as conn:
                resultproxy = conn.execute(text(base_query), params)
                results = resultproxy.fetchall()
            
            # Format kết quả
            places = []
            for row in results:
                places.append({
                    "id": row._mapping['id'] if hasattr(row, '_mapping') else row[0],
                    "name": row._mapping['name'] if hasattr(row, '_mapping') else row[1],
                    "type": row._mapping['type'] if hasattr(row, '_mapping') else row[2],
                    "description": row._mapping['description'] if hasattr(row, '_mapping') else row[3],
                    "location": row._mapping['location'] if hasattr(row, '_mapping') else row[4],
                    "address": row._mapping['address'] if hasattr(row, '_mapping') else row[5],
                    "tags": row._mapping['tags'] if hasattr(row, '_mapping') else row[6],
                    "distance_km": round(float(row._mapping['distance_km'] if hasattr(row, '_mapping') else row[9]), 2),
                    "score": 1.0 - (float(row._mapping['distance_km'] if hasattr(row, '_mapping') else row[9]) / radius_km)  # Score dựa trên khoảng cách
                })
            
            return places
            
        except Exception as e:
            print(f"[LocationHandler] Lỗi truy vấn database khi tìm địa điểm gần: {e}")
            return []

# Singleton instance để tái sử dụng
_location_handler = None

def get_location_handler() -> LocationHandler:
    """Factory function để tạo singleton LocationHandler"""
    global _location_handler
    if _location_handler is None:
        _location_handler = LocationHandler()
    return _location_handler