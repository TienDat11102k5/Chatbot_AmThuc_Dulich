# -*- coding: utf-8 -*-
"""
Phase 4 Fix B: Thêm mẫu KHÔNG DẤU cho các intent bị nhầm
Giải quyết: Test 2 (chao ban→cam_on), Test 5 (ban la ai→OOS), Test 10 (cho nao→OOS)
"""
import csv
import os
import collections

DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "intent_dataset.csv")

# Mẫu không dấu cho chao_hoi
chao_hoi_nodiac = [
    "chao ban", "chao ban nhe", "chao nha", "xin chao ban",
    "chao buoi sang", "chao buoi chieu", "chao buoi toi",
    "hey chao ban", "hi chao nha", "chao bot nhe",
    "e oi chao ban", "chao moi nguoi", "chao ban oi",
    "chao nhe ban", "minh chao ban", "xin chao nhe",
    "chao ban minh moi den", "chao ban giup minh voi",
    "alo chao ban", "hello chao nha",
]

# Mẫu không dấu cho hoi_thong_tin
hoi_thong_tin_nodiac = [
    "ban la ai", "ban la gi", "chatbot la gi", "bot la ai",
    "ban lam duoc gi", "bot giup gi duoc", "tinh nang cua bot",
    "huong dan su dung", "cach dung bot", "bot hoat dong the nao",
    "cho minh hoi bot la gi", "gioi thieu chatbot di",
    "ban co the giup gi", "bot biet lam gi", "menu bot",
    "danh sach tinh nang", "help me", "tro giup",
    "ban biet gi", "bot co thong minh khong",
]

# Mẫu không dấu cho tim_dia_diem
tim_dia_diem_nodiac = [
    "cho nao vui choi o Nha Trang", "dia diem du lich Da Nang",
    "di dau choi o Sai Gon", "cho nao dep o Da Lat",
    "di dau o Ha Noi", "diem den noi tieng o Hue",
    "kham pha o dau", "cho nao hay o Phu Quoc",
    "dia diem tham quan Hoi An", "cho nao vui o Quy Nhon",
    "di choi o dau dep", "cho nao thu vi",
    "dia diem du lich mien Trung", "di dau cuoi tuan",
    "cho nao chup hinh dep", "dia diem check in",
    "cho nao an uong vui choi", "khu vui choi giai tri",
    "cong vien o dau", "bai bien dep nhat",
]

# Mẫu không dấu cho cam_on (tránh nhầm với chao_hoi)
cam_on_nodiac = [
    "cam on ban", "cam on nhe", "cam on nhieu",
    "thanks ban", "tks nha", "cam on da giup",
    "cam on bot", "cam on chatbot", "cam on goi y",
    "ok cam on", "duoc roi cam on", "cam on ban nhe",
]

all_new = []
for t in chao_hoi_nodiac: all_new.append((t, "chao_hoi"))
for t in hoi_thong_tin_nodiac: all_new.append((t, "hoi_thong_tin"))
for t in tim_dia_diem_nodiac: all_new.append((t, "tim_dia_diem"))
for t in cam_on_nodiac: all_new.append((t, "cam_on"))

print(f"=== FIX B: Mẫu không dấu ===")
print(f"  chao_hoi: +{len(chao_hoi_nodiac)}")
print(f"  hoi_thong_tin: +{len(hoi_thong_tin_nodiac)}")
print(f"  tim_dia_diem: +{len(tim_dia_diem_nodiac)}")
print(f"  cam_on: +{len(cam_on_nodiac)}")
print(f"  TỔNG: {len(all_new)}")

# Dedup
existing = set()
if os.path.exists(DATASET_PATH):
    with open(DATASET_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if row: existing.add(row[0].strip())

new_only = [(t, i) for t, i in all_new if t.strip() not in existing]
skipped = len(all_new) - len(new_only)

with open(DATASET_PATH, 'a', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    for t, i in new_only:
        writer.writerow([t, i])

print(f"\nĐã append {len(new_only)} mẫu (bỏ {skipped} trùng)")

# Phân bố mới
with open(DATASET_PATH, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    next(reader)
    counts = collections.Counter(row[-1] for row in reader if row)
total = sum(counts.values())
print(f"\nPhân bố sau Fix B: TỔNG {total} mẫu")
for intent, count in counts.most_common():
    print(f"  {intent}: {count}")
