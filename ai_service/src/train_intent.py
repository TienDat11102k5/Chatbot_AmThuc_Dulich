import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report
import joblib
import os

# 1. Tạo Dữ liệu Huấn Luyện (Dataset) dạng Demo
# Trong thực tế, nhóm mình sẽ làm 1 file CSV chứa hàng ngàn câu này (Task DAT-01)
data = {
    'text': [
        "tìm cho mình quán phở ở gần đây",
        "có quán bún bò huế nào ngon ở quận 1 không",
        "chỉ đường đi từ đây ra sân bay nội bài",
        "làm sao để đi đến hồ gươm",
        "thời tiết ngày mai thế nào",
        "hôm nay hà nội có mưa không",
        "gợi ý món ăn chay ở đà nẵng",
        "quán lẩu thái giá rẻ",
        "bản đồ đường lên sapa",
        "mưa to quá có ngập đường không"
    ],
    'intent': [
        "tim_mon_an",
        "tim_mon_an",
        "hoi_duong",
        "hoi_duong",
        "hoi_thoi_tiet",
        "hoi_thoi_tiet",
        "tim_mon_an",
        "tim_mon_an",
        "hoi_duong",
        "hoi_thoi_tiet"
    ]
}

# Chuyển đổi thành DataFrame (Bảng dữ liệu giống Excel)
df = pd.DataFrame(data)

def train_intent_model():
    print("🚀 Bắt đầu huấn luyện mô hình (Training Model)...")
    
    # 2. Tiền xử lý Dữ liệu (Chia tập Train & Test)
    # Chia 80% câu để AI học (Train), 20% để làm bài kiểm tra (Test)
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df['intent'], test_size=0.2, random_state=42)
    
    # 3. Xây dựng bộ não AI (Pipeline Thuật Toán)
    # B1: TfidfVectorizer: Chuyển text (chữ) -> Vector (Danh sách các con số) để máy tính hiểu.
    # B2: SVC (Support Vector Classifier): Thuật toán học máy sẽ tìm đường ranh giới phân tách các loại Intent (ý định).
    model = make_pipeline(TfidfVectorizer(), SVC(kernel='linear', probability=True))
    
    # 4. Học Machine Learning
    model.fit(X_train, y_train)
    
    # 5. Đánh giá Đội chính xác trên tập Test (Chấm điểm bài kiểm tra)
    y_pred = model.predict(X_test)
    print("\n📊 Bảng Cáo Cáo Điểm Số (Metrics):")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    # 6. Lưu mô hình (Export Model File) để FastAPI lấy ra xài sau này
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/intent_model.pkl')
    print("✅ Đã lưu mô hình thành công tại: models/intent_model.pkl")

#============================================
# Phần Test nhanh Model (Giả lập FastAPI nhận tin nhắn)
#============================================
def test_chatbot():
    print("\n--- TEST CHATBOT Nhanh ---")
    # Load mô hình đã lưu từ ổ cứng lên
    loaded_model = joblib.load('models/intent_model.pkl')
    
    # Thử với câu nói mới chưa từng có trong tập huấn luyện
    test_sentences = [
        "bà ơi ở cầu giấy có quán phở nào ngon không?",
        "bạn map cho mình đường ra lăng bác đi",
        "chiều nay có lạnh không?"
    ]
    
    for text in test_sentences:
        # Máy tiên đoán xem ý định là gì
        prediction = loaded_model.predict([text])[0]
        # Lấy Tỉ lệ phần trăm chắc chắn của máy
        confidence = max(loaded_model.predict_proba([text])[0]) * 100
        
        print(f"Câu hỏi: '{text}' -> Intent: [{prediction}] (Tự tin: {confidence:.2f}%)")

if __name__ == "__main__":
    train_intent_model()
    test_chatbot()
