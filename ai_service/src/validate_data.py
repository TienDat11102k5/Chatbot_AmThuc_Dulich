"""
Script: validate_data.py
Mục đích: Kiểm tra tính toàn vẹn (integrity) của 2 file CSV dữ liệu AI
          trước khi đưa vào train model và tích hợp vào hệ thống.

Cách chạy: python validate_data.py (từ thư mục ai_service)
"""

import pandas as pd  # Dùng để đọc và xử lý file CSV
import os            # Dùng để kiểm tra file có tồn tại không

# ============================================================
# 1. ĐỊNH NGHĨA ĐƯỜNG DẪN FILE
# ============================================================
# Hai file CSV chứa dữ liệu AI cần kiểm tra
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Thư mục hiện tại của script
INTENT_FILE = os.path.join(BASE_DIR, "..", "data", "intent_dataset.csv")
KNOWLEDGE_FILE = os.path.join(BASE_DIR, "..", "data", "knowledge_base.csv")


def validate_intent_dataset(filepath: str) -> bool:
    """
    Hàm kiểm tra file tập dữ liệu huấn luyện Intent (intent_dataset.csv).
    
    Các bước kiểm tra:
    - File có tồn tại không?
    - Có đúng 2 cột 'text' và 'intent' không?
    - Có dòng nào bị NULL/NaN không?
    - Phân phối nhãn (intent) có cân bằng không? (Tránh mất cân bằng dữ liệu)
    
    Tham số:
        filepath (str): Đường dẫn tuyệt đối đến file CSV cần kiểm tra.
    
    Trả về:
        bool: True nếu dữ liệu hợp lệ, False nếu phát hiện lỗi.
    """
    print("\n📂 === KIỂM TRA FILE INTENT DATASET ===")

    # Bước 1: Kiểm tra file có tồn tại trên ổ cứng không
    if not os.path.exists(filepath):
        print(f"  ❌ LỖI: Không tìm thấy file tại: {filepath}")
        return False
    print(f"  ✅ File tồn tại: {filepath}")

    # Bước 2: Đọc file CSV vào DataFrame của pandas
    df = pd.read_csv(filepath)
    print(f"  📊 Tổng số dòng dữ liệu: {len(df)}")

    # Bước 3: Kiểm tra các cột bắt buộc phải có đúng tên
    required_columns = {"text", "intent"}
    missing_cols = required_columns - set(df.columns)
    if missing_cols:
        print(f"  ❌ LỖI: Thiếu cột bắt buộc: {missing_cols}")
        return False
    print(f"  ✅ Cột hợp lệ: {list(df.columns)}")

    # Bước 4: Kiểm tra xem có dòng nào chứa giá trị NULL (rỗng) không
    # Nếu có null trong cột 'text' hoặc 'intent' thì model sẽ bị lỗi khi train
    null_count = df.isnull().sum()
    if null_count.any():
        print(f"  ⚠️  CẢNH BÁO: Phát hiện giá trị NULL:\n{null_count[null_count > 0]}")
        # Tự động loại bỏ các dòng null để tránh lỗi
        df = df.dropna()
        print(f"  🔧 Đã tự động xóa các dòng NULL. Còn lại: {len(df)} dòng")
    else:
        print("  ✅ Không có giá trị NULL")

    # Bước 5: In phân phối nhãn (label distribution)
    # Kiểm tra xem từng class có đủ số câu để train không (tối thiểu 10 câu/class)
    print("\n  📊 Phân phối nhãn (intent) trong dataset:")
    intent_counts = df["intent"].value_counts()
    for intent_name, count in intent_counts.items():
        status = "✅" if count >= 10 else "⚠️ THIẾU (cần thêm)"
        print(f"     {status} {intent_name}: {count} câu")

    print("  ✅ Kiểm tra intent_dataset.csv HOÀN TẤT!\n")
    return True


def validate_knowledge_base(filepath: str) -> bool:
    """
    Hàm kiểm tra file cơ sở tri thức (knowledge_base.csv).
    
    Các bước kiểm tra:
    - File có tồn tại không?
    - Có đúng các cột cần thiết cho thuật toán Recommender không?
      (bắt buộc: id, name, type, description, location, tags)
    - Có ô nào bị NULL không? (Đặc biệt cột 'description' và 'tags' về ngữ nghĩa)
    - Tỉ lệ giữa 'food' (món ăn) và 'place' (địa điểm) có hợp lý không?
    
    Tham số:
        filepath (str): Đường dẫn tuyệt đối đến file CSV cần kiểm tra.
    
    Trả về:
        bool: True nếu dữ liệu hợp lệ, False nếu phát hiện lỗi.
    """
    print("\n📂 === KIỂM TRA FILE KNOWLEDGE BASE ===")

    # Bước 1: Kiểm tra file có tồn tại trên ổ cứng không
    if not os.path.exists(filepath):
        print(f"  ❌ LỖI: Không tìm thấy file tại: {filepath}")
        return False
    print(f"  ✅ File tồn tại: {filepath}")

    # Bước 2: Đọc file CSV vào DataFrame
    df = pd.read_csv(filepath)
    print(f"  📊 Tổng số bản ghi (món ăn / địa điểm): {len(df)}")

    # Bước 3: Kiểm tra các cột quan trọng phải có
    required_columns = {"id", "name", "type", "description", "location", "tags"}
    missing_cols = required_columns - set(df.columns)
    if missing_cols:
        print(f"  ❌ LỖI: Thiếu cột bắt buộc: {missing_cols}")
        return False
    print(f"  ✅ Cột hợp lệ: {list(df.columns)}")

    # Bước 4: Kiểm tra NULL đặc biệt ở cột 'description' và 'tags'
    # Đây là 2 cột dùng để tính toán Cosine Similarity nên không được phép rỗng
    critical_cols = ["description", "tags"]
    for col in critical_cols:
        null_rows = df[df[col].isnull()]
        if not null_rows.empty:
            print(f"  ⚠️  CẢNH BÁO: Cột '{col}' có {len(null_rows)} dòng NULL!")
        else:
            print(f"  ✅ Cột '{col}': không có NULL")

    # Bước 5: Kiểm tra tỉ lệ loại bản ghi (food vs place)
    print("\n  📊 Phân phối loại bản ghi trong Knowledge Base:")
    type_counts = df["type"].value_counts()
    for type_name, count in type_counts.items():
        print(f"     ✅ {type_name}: {count} bản ghi")

    print("  ✅ Kiểm tra knowledge_base.csv HOÀN TẤT!\n")
    return True


def main():
    """
    Hàm chính: Chạy tuần tự toàn bộ các kiểm tra.
    Kết quả cuối cùng thông báo dữ liệu đã sẵn sàng để train hay chưa.
    """
    print("=" * 55)
    print("  🤖 VALIDATE DATA — AI Chatbot Ẩm Thực & Du Lịch VN")
    print("=" * 55)

    # Kiểm tra từng file riêng biệt
    intent_ok = validate_intent_dataset(INTENT_FILE)
    knowledge_ok = validate_knowledge_base(KNOWLEDGE_FILE)

    # Kết luận cuối
    print("=" * 55)
    if intent_ok and knowledge_ok:
        print("✅ PASSED: Tất cả dữ liệu hợp lệ. Sẵn sàng train Model!")
    else:
        print("❌ FAILED: Phát hiện lỗi, hãy kiểm tra lại dữ liệu!")
    print("=" * 55)


if __name__ == "__main__":
    main()
