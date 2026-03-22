"""
PREDICT INTENT - Sử dụng model đã train
"""

import pickle
import re
import pandas as pd

class IntentClassifier:
    """
    Class để load và sử dụng model phân loại intent
    """
    
    def __init__(self, model_path='models/intent_model.pkl', vectorizer_path='models/vectorizer.pkl'):
        """
        Load model và vectorizer
        """
        print("🔄 Loading model...")
        
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        
        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        print("✅ Model loaded successfully!")
    
    def preprocess_text(self, text):
        """
        Tiền xử lý text giống như khi train
        """
        if pd.isna(text):
            return ""
        
        # Chuyển về lowercase
        text = str(text).lower()
        
        # Chuẩn hóa khoảng trắng
        text = re.sub(r'\s+', ' ', text)
        
        # Bỏ ký tự đặc biệt (giữ lại chữ cái tiếng Việt, số, khoảng trắng)
        text = re.sub(r'[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', ' ', text)
        
        # Loại bỏ khoảng trắng thừa
        text = text.strip()
        
        return text
    
    def predict(self, text):
        """
        Dự đoán intent từ câu hỏi
        
        Args:
            text (str): Câu hỏi của user
        
        Returns:
            dict: {
                'intent': str,
                'confidence': float
            }
        """
        # Tiền xử lý
        text_clean = self.preprocess_text(text)
        
        if not text_clean:
            return {
                'intent': 'unknown',
                'confidence': 0.0
            }
        
        # Vector hóa
        text_vec = self.vectorizer.transform([text_clean])
        
        # Dự đoán
        intent = self.model.predict(text_vec)[0]
        
        # Lấy confidence score
        decision = self.model.decision_function(text_vec)
        confidence = float(max(decision[0]))
        
        return {
            'intent': intent,
            'confidence': confidence
        }
    
    def predict_batch(self, texts):
        """
        Dự đoán intent cho nhiều câu hỏi
        
        Args:
            texts (list): Danh sách câu hỏi
        
        Returns:
            list: Danh sách kết quả
        """
        results = []
        for text in texts:
            result = self.predict(text)
            results.append(result)
        return results


# ============================================================
# DEMO SỬ DỤNG
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("🤖 DEMO INTENT CLASSIFIER")
    print("=" * 60)
    
    # Khởi tạo classifier
    classifier = IntentClassifier()
    
    # Test với các câu hỏi mẫu
    test_questions = [
        "Hà Nội có gì hay",
        "Quán phở ở đâu ngon",
        "Gần đây có gì",
        "Xin chào",
        "Cảm ơn bạn",
        "Tạm biệt",
        "Bạn là ai",
        "Đà Nẵng đi đâu chơi",
        "Tìm nhà hàng gần đây",
        "Bún bò Huế quán nào ngon",
        "Quanh đây có quán cà phê nào",
        "TP.HCM có địa điểm nào đẹp",
        "Món ăn đặc sản Huế",
        "Goodbye",
        "Thanks",
        "Chatbot này làm gì"
    ]
    
    print("\n🧪 TEST PREDICTIONS:")
    print("=" * 60)
    
    for question in test_questions:
        result = classifier.predict(question)
        print(f"❓ '{question}'")
        print(f"   → Intent: {result['intent']}")
        print(f"   → Confidence: {result['confidence']:.3f}")
        print()
    
    print("=" * 60)
    print("✅ DEMO HOÀN THÀNH!")
    print("=" * 60)
