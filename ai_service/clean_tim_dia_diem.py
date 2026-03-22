import pandas as pd

print("🔄 XÓA CÂU HỎI 'GẦN ĐÂY' KHỎI TIM_DIA_DIEM.CSV")
print("=" * 60)

# Đọc file hiện tại
print("📂 Đọc tim_dia_diem.csv...")
df = pd.read_csv("data/tim_dia_diem.csv", encoding='utf-8-sig')
print(f"   ✅ Hiện có {len(df):,} câu hỏi")

# Tìm câu hỏi có "gần đây" và các từ tương tự
gan_day_keywords = ['gần', 'quanh', 'xung', 'lân', 'nearby', 'around']
gan_day_mask = df['text'].str.contains('|'.join(gan_day_keywords), case=False, na=False)

gan_day_count = gan_day_mask.sum()
print(f"   📊 Tìm thấy {gan_day_count:,} câu hỏi có từ 'gần đây'")

# Lọc bỏ câu hỏi "gần đây"
df_clean = df[~gan_day_mask].copy()
print(f"   ✅ Sau khi xóa: {len(df_clean):,} câu hỏi")

# Lưu file đã làm sạch
output_file = "data/tim_dia_diem.csv"
df_clean.to_csv(output_file, index=False, encoding="utf-8-sig")
print(f"\n💾 Đã cập nhật {output_file}")

print(f"\n📊 KẾT QUẢ:")
print(f"Trước: {len(df):,} câu hỏi")
print(f"Sau: {len(df_clean):,} câu hỏi")
print(f"Đã xóa: {gan_day_count:,} câu hỏi có 'gần đây'")

# Sample câu hỏi đã xóa
if gan_day_count > 0:
    gan_day_samples = df[gan_day_mask].head(10)
    print(f"\n📋 SAMPLE CÂU HỎI ĐÃ XÓA (10 câu):")
    for _, row in gan_day_samples.iterrows():
        print(f"   '{row['text']}'")

print(f"\n🎉 HOÀN THÀNH! Đã làm sạch tim_dia_diem.csv")