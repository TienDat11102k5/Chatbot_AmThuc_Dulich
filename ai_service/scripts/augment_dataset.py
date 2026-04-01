"""
Script để sinh thêm dữ liệu huấn luyện cho các intent đang thiếu hụt (lap_ke_hoach, hoi_thoi_tiet)
Bằng cách tạo thêm các mẫu thay đổi địa danh và mốc thời gian.
"""
import pandas as pd
import os

DATASET_PATH = 'data/intent_dataset.csv'

# Danh sách địa danh, thời gian cho Augmentation
locations = ["Hà Nội", "Đà Nẵng", "Sài Gòn", "Hồ Chí Minh", "Đà Lạt", "Nha Trang", "Phú Quốc", "Hội An", "Sa Pa", "Vũng Tàu", "Huế", "Ninh Bình", "Quy Nhơn", "Cần Thơ", "Mũi Né"]
durations = ["3 ngày", "2 ngày 1 đêm", "4 ngày 3 đêm", "1 tuần", "vài ngày", "2 ngày", "5 ngày", "cuối tuần"]

times = ["hôm nay", "ngày mai", "cuối tuần này", "tuần sau", "chiều nay", "sáng nay", "tối nay", "tháng sau", "tháng 12"]

new_samples = []

print("🔄 Bắt đầu sinh thêm mẫu dữ liệu (Data Augmentation)...")

# 1. Tạo mẫu lap_ke_hoach
for loc in locations:
    for dur in durations:
        new_samples.append({"text": f"Lên kế hoạch đi {loc} trong {dur}", "intent": "lap_ke_hoach"})
        new_samples.append({"text": f"Gợi ý lịch trình du lịch {loc} {dur}", "intent": "lap_ke_hoach"})
        new_samples.append({"text": f"Xin kế hoạch tham quan {loc} {dur}", "intent": "lap_ke_hoach"})
        new_samples.append({"text": f"Mình muốn đi {loc} {dur} thì nên đi đâu", "intent": "lap_ke_hoach"})

# 2. Tạo mẫu hoi_thoi_tiet
for loc in locations:
    for t in times:
        new_samples.append({"text": f"Thời tiết {loc} {t} thế nào", "intent": "hoi_thoi_tiet"})
        new_samples.append({"text": f"{t} ở {loc} có mưa không", "intent": "hoi_thoi_tiet"})
        new_samples.append({"text": f"Dự báo thời tiết {loc} {t}", "intent": "hoi_thoi_tiet"})
        new_samples.append({"text": f"Cho mình hỏi thời tiết ở {loc} {t}", "intent": "hoi_thoi_tiet"})

df_new = pd.DataFrame(new_samples)

if os.path.exists(DATASET_PATH):
    df_existing = pd.read_csv(DATASET_PATH, encoding='utf-8-sig')
    initial_len = len(df_existing)
    
    # Gộp data hiện tại với data mới, sau đó xóa trùng lặp (nếu có)
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    df_combined = df_combined.drop_duplicates(subset=['text'], keep='first')
    
    added_count = len(df_combined) - initial_len
    
    if added_count > 0:
        df_combined.to_csv(DATASET_PATH, index=False, encoding='utf-8-sig')
        print(f"✅ Đã thêm {added_count} mẫu câu tự nhiên mới vào {DATASET_PATH}")
    else:
        print("⚡ Các mẫu sinh ra đã tồn tại trong dataset. Bỏ qua.")
else:
    print(f"❌ Không tìm thấy dataset tại {DATASET_PATH}")
