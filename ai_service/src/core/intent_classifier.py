"""
File: src/core/intent_classifier.py
Mục đích: Chứa thuật toán Huấn luyện (Train) mô hình AI phân loại Ý định (Intent Classification).
          Sử dụng scikit-learn để nạp dataset, huấn luyện mô hình Support Vector Machine (SVM),
          tính toán kết quả (Accuracy, Precision, F1-Score) và xuất ra file model .pkl.
"""

import os               # Thư viện để tìm đường dẫn tuyệt đối của các file
import json             # Lưu lại các thông số phụ trợ (nếu có)
import joblib           # Cực kỳ quan trọng: Thư viện nén/lưu và giải nén/tải Model AI ra file cứng
import pandas as pd     # Quản lý đọc, ghi và xử lý DataFrame từ Excel/CSV

# Thư viện scikit-learn cho quy trình Machine Learning
from sklearn.feature_extraction.text import TfidfVectorizer # Bộ biến đổi Text thành Ma trận số (Vector)
from sklearn.svm import SVC                                 # Thuật toán Máy học: Support Vector Machine
from sklearn.pipeline import Pipeline                       # Ống nước gộp nhiều bước lại với nhau
from sklearn.model_selection import train_test_split        # Hàm xén nhỏ Dataset (ví dụ: Chẻ 80% Train, 20% Test)
from sklearn.metrics import classification_report, accuracy_score # Đồ thị và số liệu để làm báo cáo đồ án

# Gọi bộ tiền xử lý NLP mà chúng ta vừa mới code ở file bên cạnh (nlp_utils.py)
from src.core.nlp_utils import preprocess_text

# ==============================================================================
# 1. CẤU HÌNH CÁC ĐƯỜNG DẪN CƠ BẢN (PATHS) DÙNG CHUNG TOÀN FILE
# ==============================================================================
# Lấy ra đường dẫn tuyệt đối đến thư mục chứa file `intent_classifier.py` này
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Lùi ra 2 cấp thư mục (về ai_service) để truy cập lấy file dataset
DATA_PATH = os.path.join(CURRENT_DIR, "..", "..", "data", "intent_dataset.csv")
# Đường dẫn chỉ định nơi xuất model đã train xong (vào thư mục models/)
MODEL_DIR = os.path.join(CURRENT_DIR, "..", "..", "models")
MODEL_FILE = os.path.join(MODEL_DIR, "intent_model.pkl")

class IntentClassifier:
    """
    Class quản lý toàn bộ vòng đời của Model Phân Loại Ý Định.
    Từ lúc nạp data, Train model, Đo lường cho đến lúc dự đoán (Predict).
    """
    
    def __init__(self):
        """
        Hàm khởi tạo. Khi tạo Instance mới của Object này:
        - Tự động tải trước Model và Vectorizer (nếu có file trong ổ cứng) để chạy ngay.
        """
        self.model = None
        self.vectorizer = None
        
        # Nếu đã có model cũ đang lưu trên ổ C cứng, LOAD (nạp) thẳng vô RAM luôn!
        model_file = os.path.join(MODEL_DIR, "intent_model.pkl")
        vectorizer_file = os.path.join(MODEL_DIR, "vectorizer.pkl")
        
        if os.path.exists(model_file) and os.path.exists(vectorizer_file):
            self.model = joblib.load(model_file)
            self.vectorizer = joblib.load(vectorizer_file)
            print(f"[INFO] Đã load Model và Vectorizer thành công từ {MODEL_DIR}")
        else:
            print(f"[WARNING] Không tìm thấy model files. Cần train trước.")
            # Khởi tạo pipeline để train (nếu cần)
            self.pipeline = Pipeline([
                ('tfidf', TfidfVectorizer()),
                ('clf', SVC(kernel='linear', C=1.0, probability=True)) 
            ])

    def train_and_evaluate(self):
        """
        Hàm trung tâm (Core function). Thực hiện 1 lúc 5 nhiệm vụ:
        1. Đọc Dataset CSV.
        2. Clean Text (Chạy NLP Pipeline tiếng Việt dọn dẹp chữ bẩn).
        3. Tách (Train/Test Split) theo tỉ lệ 80% Học - 20% Làm bài Thi.
        4. Huấn luyện (Fit).
        5. Xuất Metric báo cáo cho môn học AI. (Lưu cả file metrics.txt).
        """
        print("\n" + "="*50)
        print(" BẮT ĐẦU QUÁ TRÌNH HUẤN LUYỆN (TRAINING MODEL)")
        print("="*50)
        
        # 1. ĐỌC DỮ LIỆU
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Không tìm được dataset tại: {DATA_PATH}")
        
        df = pd.read_csv(DATA_PATH)
        print(f"[1] Đã nạp thành công {len(df)} câu hỏi vào bộ nhớ.")
        
        # 2. XỬ LÝ NLP CHO CỘT VĂN BẢN
        print("[2] Đang chạy Tokenizer (Cắt từ tiếng Việt) & Loại bỏ Stop words...")
        # Lặp qua tất cả 180+ dòng, áp dụng hàm preprocess_text đã viết
        df['cleaned_text'] = df['text'].apply(preprocess_text)
        
        # 3. TÁCH TỶ LỆ DỮ LIỆU
        # x_data: Đề bài (Dữ liệu chữ sạch). 
        # y_data: Đáp án (Ý định thực sự - Intent).
        x_data = df['cleaned_text']
        y_data = df['intent']
        
        # test_size=0.2 Nghĩa là: Cắt 80% câu đi học sinh AI luyện thi, 
        # 20% còn lại giấu đi để sau luyện xong vác ra test xem nó có đoán bừa hay không.
        x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.2, random_state=42)
        print(f"[3] Đã chia tập dữ liệu: Train ({len(x_train)} câu) - Test ({len(x_test)} câu)")
        
        # 4. THỰC HIỆN HUẤN LUYỆN (FIT)
        print("[4] Đang khởi động thuật toán TfidfVectorizer + Support Vector Machine ...")
        self.pipeline.fit(x_train, y_train)
        self.model = self.pipeline # Cập nhật thuộc tính model của class thành bản đã Train xong
        print("    -> Huấn luyện THÀNH CÔNG!")
        
        # 5. LÀM BÀI KIỂM TRA (ĐÁNH GIÁ METRICS ĐỒ ÁN MÔN HỌC)
        print("[5] Lôi 20% đề dự phòng ra kiểm tra năng lực Model...")
        y_pred = self.model.predict(x_test) # Ra lệnh Model làm bài thử
        
        acc_score = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred)
        
        print(f"\n🚀 ĐỘ CHÍNH XÁC (ACCURACY): {acc_score * 100:.2f} %")
        print(f"📊 BÁO CÁO CHI TIẾT (Classification Report):\n")
        print(report)
        
        # In các dòng bị đoán sai (Miss classification) để Developer Debug
        print("\n🔍 CÁC MẪU DỰ ĐOÁN SAI (NẾU CÓ):")
        errors = 0
        for text, true_label, pred_label in zip(x_test, y_test, y_pred):
            if true_label != pred_label:
                print(f"   [SAI] Câu: '{text}' | Lời giải đúng: '{true_label}' | AI Đoán thành: '{pred_label}'")
                errors += 1
        if errors == 0:
            print("   👉 Không có câu nào bị sai! (Quá hoàn hảo, hoặc dataset quá ít :D)")
            
        # 6. SAO LƯU MODEL & BÁO CÁO LẠI RA FILE CỨNG
        self._save_model()
        self._save_metrics_report(acc_score, report)
        
        print("\n" + "="*50)
        print(" QUÁ TRÌNH HUẤN LUYỆN ĐÃ KẾT THÚC.")
        print("="*50 + "\n")

    def _save_model(self):
        """
        Tiểu hàm tư (Private method) để Lưu Model ra đuôi file .pkl
        Tạo folder models/ nếu nó đột nhiên bị xóa mất.
        """
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(self.model, MODEL_FILE)
        print(f"[💾] Đã gói gọn não bộ AI và Lưu trữ Model vật lý vô: {MODEL_FILE}")
        
    def _save_metrics_report(self, accuracy, report):
        """
        Tiểu hàm xuất thẳng báo cáo ra file Text cho anh copy thẳng vô Word đồ án.
        Nằm ở folder docs/metrics.txt
        """
        docs_dir = os.path.join(CURRENT_DIR, "..", "..", "docs")
        os.makedirs(docs_dir, exist_ok=True)
        report_path = os.path.join(docs_dir, "metrics.txt")
        
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("="*40 + "\n")
            f.write(" BÁO CÁO KẾT QUẢ HUẤN LUYỆN MÔ HÌNH AI\n")
            f.write(" (Môn học: Trí Tuệ Nhân Tạo)\n")
            f.write("="*40 + "\n\n")
            f.write(f"1. Tổng quan độ chính xác (Accuracy): {accuracy * 100:.2f} %\n\n")
            f.write("2. Bảng phân tích chi tiết nhãn phân loại (Precision, Recall, F1-Score):\n")
            f.write(report)
            f.write("\n\n3. Thiết lập hệ thống (Configuration):\n")
            f.write("   - Model Core: Support Vector Machine (SVC)\n")
            f.write("   - Vectorizer: TF-IDF (TfidfVectorizer)\n")
            f.write("   - NLP Preprocessor: Underthesea + Custom Stopwords\n")
            
        print(f"[📝] Đã in Báo cáo Metrics thành công ra: {report_path}")

    def predict_intent(self, user_message: str) -> dict:
        """
        Hàm chính chạy độc lập mỗi khi có 1 tin nhắn bay về từ API Gateway (Spring Boot / Fast API).
        
        Ví dụ lúc gọi ở Service API:
           model_intent = IntentClassifier()
           result = model_intent.predict_intent("Bạn ơi phở nào ngon")
           
        Tham số:
            user_message (str): Tin nhắn thuần túy của khách.
            
        Trả về JSON:
            dict: {
                "intent": "tim_mon_an", 
                "confidence": 0.98,
                "cleaned_text": "phở ngon"
            }
        """
        if self.model is None or self.vectorizer is None:
            raise RuntimeError("LỖI: Mô hình AI chưa được huấn luyện (hoặc file .pkl chưa được tạo). Hãy gõ lệnh Train trước!")
            
        # 1. Quét dọn câu nguyên thủy của khách hàng
        cleaned_text = preprocess_text(user_message)
        
        # Nếu nhập khoảng trắng trống không thì Default luôn vào intent nói nhảm (giao_tiep_bot)
        if not cleaned_text.strip():
            return {
                "intent": "giao_tiep_bot",
                "confidence": 1.0,
                "cleaned_text": cleaned_text
            }
            
        # 2. Vector hóa text bằng vectorizer đã train
        try:
            text_vector = self.vectorizer.transform([cleaned_text])
            
            # 3. Dự đoán bằng model
            prediction = self.model.predict(text_vector)[0]
            
            # LinearSVC không có predict_proba, dùng decision_function thay thế
            if hasattr(self.model, 'predict_proba'):
                probs = self.model.predict_proba(text_vector)[0]
                confidence = max(probs)
            else:
                # Dùng decision_function cho LinearSVC
                decision_scores = self.model.decision_function(text_vector)[0]
                if isinstance(decision_scores, (list, tuple)) or hasattr(decision_scores, '__len__'):
                    confidence = max(abs(score) for score in decision_scores)
                else:
                    confidence = abs(decision_scores)
                # Normalize về 0-1
                confidence = min(confidence / 2.0, 1.0)
            
            # 4. Rule-based override: Nếu có món ăn cụ thể → override thành tim_mon_an
            # Import NER để kiểm tra entities
            from src.core.ner import extract_entities
            entities = extract_entities(user_message)
            food_entities = entities.get("food", [])
            
            # Danh sách từ chung chung không đủ để xác định là tìm món ăn
            generic_food_words = ["ăn", "ngon", "tốt", "hay", "đồ ăn", "thức ăn", "món ăn"]
            
            # Nếu có món ăn cụ thể (không chỉ là từ chung chung)
            specific_foods = [f for f in food_entities if f not in generic_food_words]
            if specific_foods and prediction != "tim_mon_an":
                print(f"[Intent] Rule-based override: Found specific food {specific_foods}, changing intent to tim_mon_an")
                prediction = "tim_mon_an"
                confidence = 1.0  # High confidence vì rule-based
            
            return {
                "intent": prediction,
                "confidence": round(float(confidence), 4),
                "cleaned_text": cleaned_text
            }
            
        except Exception as e:
            print(f"[Intent] Lỗi khi predict: {e}")
            return {
                "intent": "giao_tiep_bot",
                "confidence": 0.5,
                "cleaned_text": cleaned_text
            }

# Nếu gọi thẳng script này bằng lệnh `python intent_classifier.py` ở Terminal:
if __name__ == "__main__":
    classifier = IntentClassifier()
    classifier.train_and_evaluate()
