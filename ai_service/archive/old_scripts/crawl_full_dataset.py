import requests
import pandas as pd
import time

# Thử đổi sang server của Đài Loan (nchc) thường ổn định và ít bị 504 hơn server Đức
OVERPASS_URL = "https://overpass.nchc.org.tw/api/interpreter"

print("🌐 BƯỚC 1: CRAWL TỌA ĐỘ VÀ TÊN TỪ OPENSTREETMAP...")

# Chia vùng TP.HCM
boxes = [
    (10.70, 106.60, 10.80, 106.70),
    (10.70, 106.70, 10.80, 106.80),
    (10.80, 106.60, 10.90, 106.70),
    (10.80, 106.70, 10.90, 106.80),
]

category_vi = {
    "restaurant": "nhà hàng", 
    "cafe": "quán cà phê", 
    "fast_food": "quán thức ăn nhanh",
    "bar": "quán bar", 
    "hotel": "khách sạn", 
    "mall": "trung tâm thương mại",
    "park": "công viên", 
    "attraction": "địa điểm du lịch"
}

domain_mapping = {
    "nhà hàng": "Ẩm thực", 
    "quán cà phê": "Ẩm thực", 
    "quán thức ăn nhanh": "Ẩm thực",
    "quán bar": "Ẩm thực", 
    "khách sạn": "Du lịch", 
    "trung tâm thương mại": "Du lịch",
    "công viên": "Du lịch", 
    "địa điểm du lịch": "Du lịch"
}

places = []

for box_id, (s, w, n, e) in enumerate(boxes):
    print(f"📦 Đang tải vùng {box_id+1}/{len(boxes)}...")
    
    query = f"""
    [out:json][timeout:120];
    (
      nwr["amenity"~"restaurant|cafe|fast_food|bar"]({s},{w},{n},{e});
      nwr["tourism"~"hotel|attraction"]({s},{w},{n},{e});
      nwr["leisure"="park"]({s},{w},{n},{e});
      nwr["shop"="mall"]({s},{w},{n},{e});
    );
    out center;
    """
    
    # Cơ chế thử lại tối đa 3 lần nếu vùng đó bị lỗi mạng/server
    max_retries = 3
    for attempt in range(max_retries):
        try:
            r = requests.post(OVERPASS_URL, data=query, timeout=130)
            if r.status_code == 200:
                data = r.json()
                elements = data.get("elements", [])
                for el in elements:
                    name = el.get("tags", {}).get("name")
                    if not name: continue
                    
                    lat = el.get("lat") if el["type"] == "node" else el.get("center", {}).get("lat")
                    lon = el.get("lon") if el["type"] == "node" else el.get("center", {}).get("lon")
                    
                    cat = (el.get("tags", {}).get("amenity") or 
                           el.get("tags", {}).get("tourism") or 
                           el.get("tags", {}).get("shop") or 
                           el.get("tags", {}).get("leisure"))
                    
                    cat_vn = category_vi.get(cat, "địa điểm")
                    
                    places.append({
                        "name": name, 
                        "domain": domain_mapping.get(cat_vn, "Khác"),
                        "category_vi": cat_vn, 
                        "latitude": lat, 
                        "longitude": lon
                    })
                print(f"✅ Vùng {box_id+1} thành công: Lấy được {len(elements)} điểm.")
                break 
            else:
                print(f"⚠️ Vùng {box_id+1} lỗi HTTP {r.status_code}. Thử lại lần {attempt+1}...")
                time.sleep(10)
        except Exception as e:
            print(f"🔄 Vùng {box_id+1} gặp sự cố kết nối. Thử lại sau 10s... ({e})")
            time.sleep(10)
            if attempt == max_retries - 1:
                print(f"💥 Đã thử {max_retries} lần nhưng vùng {box_id+1} vẫn thất bại.")

    time.sleep(3)

df = pd.DataFrame(places)
if df.empty:
    print("❌ Không lấy được dữ liệu nào. Vui lòng kiểm tra lại kết nối mạng.")
    exit()

# Xóa trùng tọa độ
df['lat_round'] = df['latitude'].round(3)
df['lon_round'] = df['longitude'].round(3)
df = df.drop_duplicates(subset=["name", "lat_round", "lon_round"]).drop(columns=['lat_round', 'lon_round'])

print(f"\n📊 TỔNG CỘNG: Đã tải xong {len(df)} địa điểm duy nhất.")

print("\n🌐 BƯỚC 2: DỊCH TỌA ĐỘ SANG ĐỊA CHỈ BẰNG API ARCGIS...")
print("⚠️ Quá trình này sẽ tốn khoảng 1 giây cho mỗi địa điểm. Vui lòng kiên nhẫn.")

addresses = []
districts = []
descriptions = []

# Chạy toàn bộ dữ liệu (bỏ .head() để lấy full)
for idx, row in df.iterrows():
    lat, lon = row['latitude'], row['longitude']
    name, cat_vn = row['name'], row['category_vi']
    
    address = ""
    district = ""
    
    try:
        arcgis_url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location={lon},{lat}&f=json"
        geo = requests.get(arcgis_url, timeout=10).json()
        addr_info = geo.get("address", {})
        
        address = addr_info.get("LongLabel", "").replace(", VNM", "").strip()
        
        if address:
            parts = [p.strip() for p in address.split(",")]
            special_districts = ["Phú Nhuận", "Tân Bình", "Tân Phú", "Bình Thạnh", "Gò Vấp", "Bình Tân", "Thủ Đức", "Thành phố Thủ Đức"]
            
            for part in parts:
                if part.startswith("Quận ") or part.startswith("Huyện ") or part in special_districts:
                    district = part
                    break
    except:
        pass
    
    addresses.append(address)
    districts.append(district)
    
    loc = f"{district}, TP.HCM" if district else "TP.HCM"
    descriptions.append(f"{name} là {cat_vn} tại {loc}.")
    
    if (idx + 1) % 50 == 0:
        print(f"📍 Đã xử lý xong địa chỉ cho {idx + 1}/{len(df)} địa điểm...")
    
    time.sleep(0.5)

df['address'] = addresses
df['district'] = districts
df['description'] = descriptions

# Sắp xếp và tạo ID
df = df[['name', 'domain', 'category_vi', 'latitude', 'longitude', 'address', 'district', 'description']]
df.insert(0, "id", [f"DIA_SG{i+1:05d}" for i in range(len(df))])

# Tạo text tìm kiếm
df["search_text"] = (
    df["name"].astype(str) + " " + 
    df["domain"].astype(str) + " " +
    df["category_vi"].astype(str) + " " + 
    df["district"].fillna("").astype(str)
).str.strip()

filename = "TP_HCM.csv"
df.to_csv(filename, index=False, encoding="utf-8-sig")

print(f"\n✅ HOÀN THÀNH TẤT CẢ! Đã lưu {len(df)} dòng vào file: {filename}")