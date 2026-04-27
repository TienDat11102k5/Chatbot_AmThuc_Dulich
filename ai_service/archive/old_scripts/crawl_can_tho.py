import requests
import pandas as pd
import time
import os

# Đổi sang server Đức để ổn định hơn
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

print(" BƯỚC 1: CRAWL TỌA ĐỘ TOÀN THÀNH PHỐ CẦN THƠ (SAU SÁP NHẬP)...")

# CHIA NHỎ: Cần Thơ được chia làm 4 box để tránh nghẽn server
boxes = [
    (10.00, 105.70, 10.10, 105.85), # Quận Ninh Kiều, Bình Thủy, Cái Răng
    (10.10, 105.50, 10.25, 105.75), # Quận Ô Môn, Phong Điền
    (10.20, 105.35, 10.40, 105.65), # Quận Thốt Nốt, Vĩnh Thạnh
    (9.90, 105.40, 10.15, 105.65),  # Huyện Thới Lai, Cờ Đỏ
]

category_vi = {
    "restaurant": "nhà hàng", "cafe": "quán cà phê", "fast_food": "quán thức ăn nhanh",
    "bar": "quán bar", "pub": "quán pub", "food_court": "khu ẩm thực", "ice_cream": "quán kem",
    "hotel": "khách sạn", "motel": "nhà nghỉ", "guest_house": "nhà khách/homestay",
    "mall": "trung tâm thương mại", "marketplace": "chợ truyền thống",
    "park": "công viên", "attraction": "địa điểm du lịch", "museum": "bảo tàng", "historic": "di tích lịch sử"
}

domain_mapping = {
    "nhà hàng": "Ẩm thực", "quán cà phê": "Ẩm thực", "quán thức ăn nhanh": "Ẩm thực",
    "quán bar": "Ẩm thực", "quán pub": "Ẩm thực", "khu ẩm thực": "Ẩm thực", "quán kem": "Ẩm thực",
    "khách sạn": "Du lịch", "nhà nghỉ": "Du lịch", "nhà khách/homestay": "Du lịch",
    "trung tâm thương mại": "Du lịch", "chợ truyền thống": "Du lịch",
    "công viên": "Du lịch", "địa điểm du lịch": "Du lịch", "bảo tàng": "Du lịch", "di tích lịch sử": "Du lịch"
}

places = []
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for box_id, (s, w, n, e) in enumerate(boxes):
    print(f" Đang quét vùng {box_id+1}/{len(boxes)}...")
    
    query = f"""
    [out:json][timeout:180];
    (
      nwr["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|marketplace"]({s},{w},{n},{e});
      nwr["tourism"~"hotel|attraction|museum|guest_house|motel"]({s},{w},{n},{e});
      nwr["historic"]({s},{w},{n},{e});
      nwr["leisure"="park"]({s},{w},{n},{e});
      nwr["shop"="mall"]({s},{w},{n},{e});
    );
    out center;
    """
    
    for attempt in range(3):
        try:
            # Sử dụng data={'data': query} và truyền headers
            r = requests.post(OVERPASS_URL, data={'data': query}, headers=headers, timeout=200)
            
            if r.status_code == 200:
                elements = r.json().get("elements", [])
                for el in elements:
                    tags = el.get("tags", {})
                    name = tags.get("name")
                    if not name: 
                        continue
                    
                    lat = el.get("lat") if el["type"] == "node" else el.get("center", {}).get("lat")
                    lon = el.get("lon") if el["type"] == "node" else el.get("center", {}).get("lon")
                    
                    if not lat or not lon: continue

                    cat = (tags.get("amenity") or tags.get("tourism") or 
                           tags.get("historic") or tags.get("shop") or tags.get("leisure"))
                    
                    cat_vn = category_vi.get(cat, "địa điểm")
                    
                    places.append({
                        "name": name, 
                        "domain": domain_mapping.get(cat_vn, "Khác"),
                        "category_vi": cat_vn, 
                        "latitude": lat, 
                        "longitude": lon
                    })
                
                print(f"Vùng {box_id+1} OK: Lấy được {len(elements)} điểm.")
                break 
            else:
                print(f"Vùng {box_id+1} lỗi HTTP {r.status_code}. Thử lại lần {attempt+1}...")
                time.sleep(15)
        except Exception as e:
            print(f"Lỗi kết nối vùng {box_id+1}: {e}. Đang thử lại...")
            time.sleep(15)
            
    time.sleep(3)

df_coords = pd.DataFrame(places)

if df_coords.empty:
    print("Không lấy được dữ liệu. Kiểm tra lại mạng.")
    exit()

df_coords['lat_round'] = df_coords['latitude'].astype(float).round(4)
df_coords['lon_round'] = df_coords['longitude'].astype(float).round(4)
df_coords = df_coords.drop_duplicates(subset=["name", "lat_round", "lon_round"]).drop(columns=['lat_round', 'lon_round'])


# --- BƯỚC 2: DỊCH ĐỊA CHỈ, LỌC SẠCH & LƯU LIÊN TỤC ---
filename = "Can_Tho_Moi.csv"
print(f"\nBƯỚC 2: ĐANG XỬ LÝ {len(df_coords)} ĐỊA ĐIỂM VÀ LƯU VÀO {filename}...")

if not os.path.exists(filename):
    headers_df = pd.DataFrame(columns=['id', 'name', 'domain', 'category_vi', 'latitude', 'longitude', 'address', 'district', 'description', 'search_text'])
    headers_df.to_csv(filename, index=False, encoding="utf-8-sig")

# Các từ khóa để lọc sạch rác ở địa chỉ
keywords = [
    "Đường", "Phố", "Hẻm", "Số", "Ngõ", "Quận", "Phường", "Huyện", "Xã", 
    "Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn", "Thốt Nốt", 
    "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
]

for idx, row in df_coords.iterrows():
    lat, lon = row['latitude'], row['longitude']
    addr, district = "", ""
    
    try:
        arcgis_url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location={lon},{lat}&f=json"
        geo = requests.get(arcgis_url, timeout=10).json()
        
        raw_addr = geo.get("address", {}).get("LongLabel", "").replace(", VNM", "").strip()
        
        # Logic gọt giũa địa chỉ (Lọc tên công ty/thuốc thú y rác)
        parts = [p.strip() for p in raw_addr.split(",")]
        clean_parts = []
        found_start = False
        
        for p in parts:
            if any(key in p for key in keywords) or any(char.isdigit() for char in p):
                found_start = True
            if found_start: 
                clean_parts.append(p)
        
        addr = ", ".join(clean_parts) if clean_parts else ", ".join(parts[-3:])
        
        # Bắt Quận/Huyện chính xác
        for p in parts:
            if any(d in p for d in keywords[9:]):  # Lọc từ Ninh Kiều trở đi
                # Format lại cho đẹp: Nếu là 5 quận đầu thì gắn "Quận", nếu là 4 huyện sau thì gắn "Huyện"
                if p in ["Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn", "Thốt Nốt"]:
                    district = f"Quận {p}"
                else:
                    district = f"Huyện {p}"
                break
                
    except Exception as e:
        addr = "Tỉnh Cần Thơ"
    
    # Tạo dòng dữ liệu hoàn chỉnh
    new_row = {
        "id": f"DIA_CT{idx+1:05d}",
        "name": row['name'],
        "domain": row['domain'],
        "category_vi": row['category_vi'],
        "latitude": lat,
        "longitude": lon,
        "address": addr,
        "district": district,
        "description": f"{row['name']} là {row['category_vi']} tại {district if district else 'TP. Cần Thơ'}.",
        "search_text": f"{row['name']} {row['domain']} {row['category_vi']} {district}".strip()
    }
    
    # LƯU NGAY LẬP TỨC VÀO FILE
    pd.DataFrame([new_row]).to_csv(filename, mode='a', header=False, index=False, encoding="utf-8-sig")
    
    if (idx + 1) % 20 == 0:
        print(f" Đã lưu: {idx + 1}/{len(df_coords)}")
    
    time.sleep(0.4)  # Nghỉ để tránh bị ArcGIS chặn

print(f"\nXONG! File '{filename}' đã sẵn sàng cho chatbot của bạn.")