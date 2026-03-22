import pandas as pd

print("🔄 THÊM CÂU HỎI 'GẦN ĐÂY' VÀO TIM_DIA_DIEM.CSV")
print("=" * 60)

# Đọc file hiện tại
print("📂 Đọc tim_dia_diem.csv...")
df_current = pd.read_csv("data/tim_dia_diem.csv", encoding='utf-8-sig')
print(f"   ✅ Hiện có {len(df_current):,} câu hỏi")

# Đọc knowledge base để lấy categories
df_kb = pd.read_csv("data/knowledge_base.csv", encoding='utf-8-sig')
categories = df_kb['category_vi'].unique().tolist()
print(f"   📊 Tìm thấy {len(categories)} categories")

# Tạo câu hỏi "gần đây"
gan_day_questions = []

# 1. Câu hỏi chung "gần đây"
general_gan_day = [
    "Gần đây có gì",
    "Quanh đây có gì",
    "Xung quanh có gì", 
    "Lân cận có gì",
    "Gần tôi có gì",
    "Gần chỗ tôi có gì",
    "Quanh chỗ này có gì",
    "Địa điểm gần đây",
    "Tìm gần đây",
    "Nearby",
    "Around here",
    "Gần đây có địa điểm nào",
    "Gần đây có chỗ nào hay",
    "Gần đây đi đâu chơi",
    "Gần đây có gì thú vị",
    "Checkin gần đây",
    "Du lịch gần đây"
]

print("🔄 Tạo câu hỏi chung 'gần đây'...")
for question in general_gan_day:
    gan_day_questions.append({
        "text": question,
        "intent": "tim_dia_diem"
    })

# 2. Câu hỏi theo category "gần đây"
category_gan_day = [
    "{category} gần đây",
    "Gần đây có {category} nào",
    "Tìm {category} gần đây",
    "{category} gần tôi",
    "{category} quanh đây",
    "{category} xung quanh",
    "{category} lân cận",
    "Gần đây {category} nào hay",
    "Gợi ý {category} gần đây"
]

print("🔄 Tạo câu hỏi theo category 'gần đây'...")
for category in categories:
    for pattern in category_gan_day:
        question = pattern.format(category=category)
        gan_day_questions.append({
            "text": question,
            "intent": "tim_dia_diem"
        })

print(f"   ✅ Tạo {len(gan_day_questions):,} câu hỏi 'gần đây'")

# 3. Gộp với dữ liệu hiện tại
df_gan_day = pd.DataFrame(gan_day_questions)
df_final = pd.concat([df_current, df_gan_day], ignore_index=True)

# Loại trùng lặp
df_final = df_final.drop_duplicates(subset=['text'])
print(f"   Sau khi loại trùng: {len(df_final):,}")

# Lưu file
output_file = "data/tim_dia_diem.csv"
df_final.to_csv(output_file, index=False, encoding="utf-8-sig")
print(f"\n💾 Đã cập nhật {output_file}")

print(f"\n📊 KẾT QUẢ:")
print(f"Trước: {len(df_current):,} câu hỏi")
print(f"Sau: {len(df_final):,} câu hỏi")
print(f"Thêm: {len(df_final) - len(df_current):,} câu hỏi")

# Sample câu hỏi "gần đây"
print(f"\n📋 SAMPLE CÂU HỎI 'GẦN ĐÂY' (15 câu):")
gan_day_samples = df_final[df_final['text'].str.contains('gần|quanh|xung|lân|nearby|around', case=False, na=False)].head(15)
for _, row in gan_day_samples.iterrows():
    print(f"   '{row['text']}'")

print(f"\n🎉 HOÀN THÀNH! Đã thêm câu hỏi 'gần đây' vào tim_dia_diem.csv")