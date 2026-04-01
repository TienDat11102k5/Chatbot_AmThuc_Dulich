"""
File: src/core/intent_classifier.py
Mục đích: Chứa thuật toán Huấn luyện (Train) mô hình AI phân loại Ý định (Intent Classification).
          Sử dụng scikit-learn để nạp dataset, huấn luyện mô hình Support Vector Machine (SVM),
          tính toán kết quả (Accuracy, Precision, F1-Score) và xuất ra file model .pkl.
"""

import os               # Thư viện để tìm đường dẫn tuyệt đối của các file
import json             # Lưu lại các thông số phụ trợ (nếu có)
import joblib           # Cực kỳ quan trọng: Thư viện nén/lưu và giải nén/tải Model AI ra file cứng
import numpy as np      # Tính toán Softmax cho confidence scoring (Phase 4)
import pandas as pd     # Quản lý đọc, ghi và xử lý DataFrame từ Excel/CSV

# Thư viện scikit-learn cho quy trình Machine Learning
from sklearn.feature_extraction.text import TfidfVectorizer # Bộ biến đổi Text thành Ma trận số (Vector)
from sklearn.svm import LinearSVC                            # Thuật toán SVM tối ưu cho phân loại text (nhanh hơn SVC 10-50x)
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
                ('clf', LinearSVC(C=1.0, class_weight='balanced', max_iter=10000)) 
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
        # Tạo pipeline mới để train
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', LinearSVC(C=1.0, class_weight='balanced', max_iter=10000)) 
        ])
        self.pipeline.fit(x_train, y_train)
        self.model = self.pipeline # Cập nhật thuộc tính model của class thành bản đã Train xong
        self.vectorizer = self.pipeline.named_steps['tfidf']  # Lưu vectorizer để dùng sau
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
        # Lưu vectorizer riêng để dùng khi predict
        vectorizer_file = os.path.join(MODEL_DIR, "vectorizer.pkl")
        joblib.dump(self.vectorizer, vectorizer_file)
        print(f"[💾] Đã gói gọn não bộ AI và Lưu trữ Model vật lý vô: {MODEL_FILE}")
        print(f"[💾] Đã lưu Vectorizer vào: {vectorizer_file}")
        
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
        
        # Nếu nhập khoảng trắng trống → trả về out_of_scope (Phase 4 fix: giao_tiep_bot không tồn tại trong dataset)
        if not cleaned_text.strip():
            return {
                "intent": "out_of_scope",
                "confidence": 0.0,
                "cleaned_text": cleaned_text
            }
            
        # 2. Vector hóa text và dự đoán
        try:
            # Kiểm tra nếu model là Pipeline (chứa cả TF-IDF + SVC)
            # thì truyền trực tiếp cleaned_text, Pipeline sẽ tự vectorize
            is_pipeline = hasattr(self.model, 'named_steps')
            
            if is_pipeline:
                # Pipeline tự vectorize bên trong
                prediction = self.model.predict([cleaned_text])[0]
                if hasattr(self.model, 'predict_proba'):
                    probs = self.model.predict_proba([cleaned_text])[0]
                    confidence = max(probs)
                else:
                    # Phase 4: Softmax — chuyển decision_function scores → xác suất thực (tổng=1.0)
                    decision_scores = self.model.decision_function([cleaned_text])[0]
                    if isinstance(decision_scores, (list, tuple)) or hasattr(decision_scores, '__len__'):
                        scores = np.array(decision_scores, dtype=np.float64) * 3.0  # Temperature scaling để làm sắc nét phân phối
                        exp_scores = np.exp(scores - np.max(scores))  # Trừ max tránh overflow
                        probs = exp_scores / exp_scores.sum()
                        confidence = float(np.max(probs))
                    else:
                        confidence = min(abs(float(decision_scores)), 1.0)
            else:
                # Model và vectorizer riêng biệt
                text_vector = self.vectorizer.transform([cleaned_text])
                prediction = self.model.predict(text_vector)[0]
                if hasattr(self.model, 'predict_proba'):
                    probs = self.model.predict_proba(text_vector)[0]
                    confidence = max(probs)
                else:
                    # Phase 4: Softmax — tương tự pipeline mode ở trên
                    decision_scores = self.model.decision_function(text_vector)[0]
                    if isinstance(decision_scores, (list, tuple)) or hasattr(decision_scores, '__len__'):
                        scores = np.array(decision_scores, dtype=np.float64) * 3.0  # Temperature scaling
                        exp_scores = np.exp(scores - np.max(scores))
                        probs = exp_scores / exp_scores.sum()
                        confidence = float(np.max(probs))
                    else:
                        confidence = min(abs(float(decision_scores)), 1.0)
            
            # ==================================================================
            # 3b. Phase 4: Keyword-based intent refinement cho 3 intent moi
            # Phat hien tu khoa gia/danh gia/so sanh de override SVM prediction
            # Chay TRUOC rule-based food/place de lay quyen uu tien
            # ==================================================================
            user_lower = user_message.lower()
            
            # Tu khoa gia ca (hoi_gia)
            PRICE_KW = ["bao nhiêu", "bao nhieu", "giá", "gia bao", "tiền", "tien",
                        "đắt", "rẻ", "mắc", "chi phí", "chi phi", "tốn", "budget"]
            # Tu khoa danh gia (danh_gia)
            REVIEW_KW = ["review", "đánh giá", "danh gia", "nhận xét", "nhan xet",
                         "tốt không", "ngon không", "có tốt", "có ngon", "có hay",
                         "có được", "đáng", "worth", "feedback", "rating"]
            # Tu khoa so sanh (so_sanh)
            COMPARE_KW = ["so sánh", "so sanh", "hay hơn", "ngon hơn", "tốt hơn",
                          "đẹp hơn", "nên chọn", "nen chon", "nên ăn", "nen an",
                          "nên đi", "hay là", "hay la", "compare"]
            
            has_price = any(kw in user_lower for kw in PRICE_KW)
            has_review = any(kw in user_lower for kw in REVIEW_KW)
            has_compare = any(kw in user_lower for kw in COMPARE_KW)
            
            # Override prediction neu phat hien tu khoa ro rang
            if has_price and prediction != "out_of_scope":
                prediction = "hoi_gia"
                confidence = max(confidence, 0.85)
            elif has_review and prediction != "out_of_scope":
                prediction = "danh_gia"
                confidence = max(confidence, 0.85)
            elif has_compare and prediction != "out_of_scope":
                prediction = "so_sanh"
                confidence = max(confidence, 0.85)
            
            # ==================================================================
            # 4. Extract Entities SỚM để phục vụ Rule-based override
            # ==================================================================
            from src.core.ner import extract_entities
            entities = extract_entities(user_message)
            place_type_entities = entities.get("place_type", [])
            food_entities = entities.get("food", [])
            location_entities = entities.get("location", [])
            
            user_message_lower = user_message.lower()

            # ==================================================================
            # 5. Rule-based override: Uu tien place_type truoc!
            # PROTECTED_INTENTS: Dynamic - chi protect intent moi khi co keyword
            # ==================================================================
            PROTECTED_INTENTS = {
                "out_of_scope", "chao_hoi", "cam_on", "tam_biet", "hoi_thong_tin"
            }
            # Chi protect 3 intent moi khi co keyword tuong ung (Phase 4)
            if has_price: PROTECTED_INTENTS.add("hoi_gia")
            if has_review: PROTECTED_INTENTS.add("danh_gia")
            if has_compare: PROTECTED_INTENTS.add("so_sanh")
            
            # GIẢI PHÓNG out_of_scope NẾU LÀ CÂU TÌM KIẾM CỤ THỂ
            # Ví dụ: "địa điểm du lịch ở phú quốc" -> model có thể bị nhầm out_of_scope vì ngắn
            # Nếu NER tìm thấy location hoặc user dùng từ khóa tìm địa điểm, gỡ bỏ khiên bảo vệ
            LISTING_PLACE_PATTERNS = [
                "địa điểm", "điểm du lịch", "điểm đến", "nơi nào", "chỗ nào",
                "có những", "những gì", "danh lam", "thắng cảnh", "tham quan",
                "khách sạn", "nhà nghỉ", "resort", "homestay", "villa"
            ]
            if "out_of_scope" in PROTECTED_INTENTS:
                if location_entities or place_type_entities or food_entities or any(p in user_message_lower for p in LISTING_PLACE_PATTERNS):
                    PROTECTED_INTENTS.remove("out_of_scope")

            if prediction not in PROTECTED_INTENTS:
                
                LISTING_FOOD_PATTERNS = [
                    "món gì", "ăn gì", "món nào", "đặc sản", "nổi tiếng",
                    "nên ăn", "thử gì", "gì ngon", "ẩm thực",
                    "đồ ăn", "thức ăn", "món ăn"
                ]
                LISTING_PLACE_PATTERNS = [
                    "địa điểm", "điểm du lịch", "điểm đến", "nơi nào", "chỗ nào",
                    "có những", "những gì", "danh lam", "thắng cảnh", "tham quan",
                    "khách sạn", "nhà nghỉ", "resort", "homestay", "villa", "khu nghỉ dưỡng"
                ]

                ACCOMMODATION_TYPES = ["khách sạn", "hotel", "homestay", "resort", "nhà nghỉ", "villa", "khu nghỉ dưỡng"]
                is_accommodation = any(ptype in ACCOMMODATION_TYPES for ptype in place_type_entities)

                # Bắt đầu chuỗi nếu (if-elif) ưu tiên để không bị ghi đè lẫn nhau:
                if "quán" in user_message_lower:
                    print(f"[Intent] Rule-based override: Found 'quán', changing intent to tim_mon_an")
                    prediction = "tim_mon_an"
                    confidence = 1.0

                elif any(p in user_message_lower for p in LISTING_PLACE_PATTERNS) and entities.get("location"):
                    print(f"[Intent] Rule-based override: Found list place pattern, changing intent to tim_dia_diem")
                    prediction = "tim_dia_diem"
                    confidence = 0.95

                elif any(p in user_message_lower for p in LISTING_FOOD_PATTERNS) and entities.get("location"):
                    print(f"[Intent] Rule-based override: Found list food pattern, changing intent to tim_mon_an")
                    prediction = "tim_mon_an"
                    confidence = 0.95
                
                elif any(keyword in user_message_lower for keyword in [
                    "chơi", "vui chơi", "giải trí", "du lịch", "tham quan", 
                    "checkin", "check in", "đi đâu", "có gì", "gì hay",
                    "khám phá", "tour", "travel"
                ]) and not food_entities and not (place_type_entities and not is_accommodation):
                    print(f"[Intent] Rule-based override: Found entertainment keyword without F&B intent, changing to tim_dia_diem")
                    prediction = "tim_dia_diem"
                    confidence = 1.0
                
                elif place_type_entities:
                    if is_accommodation:
                        print(f"[Intent] Rule-based override: Found accommodation place type, changing intent to tim_dia_diem")
                        prediction = "tim_dia_diem"
                        confidence = 1.0
                    else:
                        print(f"[Intent] Rule-based override: Found F&B place type, changing intent to tim_mon_an")
                        prediction = "tim_mon_an"
                        confidence = 1.0
                
                elif food_entities:
                    # Danh sách từ chung chung — không đủ để override intent
                    generic_food_words = [
                        "ăn", "ngon", "tốt", "hay", "đồ ăn", "thức ăn", "món ăn",
                        "uống", "nước", "đồ uống",      # Từ uống chung chung
                        "quán", "nhà hàng", "tiệm",     # Loại địa điểm
                        "ở đâu", "chỗ nào", "gần đây",  # Từ hỏi vị trí
                        "nổi tiếng", "truyền thống", "đặc sản",  # Tính từ chung
                    ]
                    
                    # Chỉ override nếu có tên món CỤ THỂ (phở, bún bò, bánh mì...)
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
            # Phase 4 fix: trả out_of_scope thay vì giao_tiep_bot (không tồn tại)
            return {
                "intent": "out_of_scope",
                "confidence": 0.0,
                "cleaned_text": cleaned_text
            }

# Nếu gọi thẳng script này bằng lệnh `python intent_classifier.py` ở Terminal:
if __name__ == "__main__":
    classifier = IntentClassifier()
    classifier.train_and_evaluate()
