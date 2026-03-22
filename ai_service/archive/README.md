# 📦 Archive - Dữ liệu và Scripts Cũ

Thư mục này chứa các file đã hoàn thành nhiệm vụ và không còn cần thiết cho hệ thống production.

## 📁 old_data/
Chứa các file CSV trung gian đã được merge vào `knowledge_base.csv` và `intent_dataset.csv`:
- `vietnam_foods.csv` - 16,857 câu hỏi về món ăn
- `tim_dia_diem.csv` - 109,780 câu hỏi về địa điểm  
- `gan_day.csv` - 763 câu hỏi "gần đây"
- `Food/vietnam_food_realistic_dataset.csv` - Dataset món ăn gốc

## 📁 old_scripts/
Chứa các script đã hoàn thành nhiệm vụ crawl và merge dữ liệu:
- `crawl_*.py` - Scripts crawl dữ liệu từ OpenStreetMap
- `merge_*.py` - Scripts gộp dữ liệu từ nhiều nguồn
- `create_*.py` - Scripts tạo dataset huấn luyện

## ⚠️ Lưu ý
- Các file này được giữ lại để tham khảo và backup
- KHÔNG xóa thư mục này trước khi đảm bảo hệ thống hoạt động ổn định
- Nếu cần mở rộng dataset, có thể tham khảo logic trong các script cũ