"""
TRAIN INTENT CLASSIFICATION MODEL
Phân loại intent cho chatbot du lịch & ẩm thực Việt Nam
"""

import pandas as pd
import numpy as np
import re
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🤖 TRAIN INTENT CLASSIFICATION MODEL")
print("=" * 60)

# ============================================================
# BƯỚC 1: LOAD DỮ LIỆU
# ============================================================
print("\n📂 BƯỚC 1: Load dữ liệu từ intent_dataset.csv...")
df = pd.read_csv("data/intent_dataset.csv", encoding='utf-8-sig')
print(f"   ✅ Tổng: {len(df):,} câu hỏi")
print(f"\n📊 Phân bố intent:")
for intent, count in df['intent'].value_counts().items():
    percentage = (count / len(df)) * 100
    print(f"   {intent}: {count:,} ({percentage:.2f}%)")

# ============================================================
# BƯỚC 1.5: KIỂM TRA DỮ LIỆU (VALIDATION)
# ============================================================
print("\n🛡️ BƯỚC 1.5: Validate dữ liệu...")
if 'text' not in df.columns or 'intent' not in df.columns:
    print("❌ LỖI: Dataset thiều cột 'text' hoặc 'intent'. Hủy quá trình huấn luyện!")
    exit(1)

missing_intents = df['intent'].isnull().sum()
missing_texts = df['text'].isnull().sum()
if missing_intents > 0 or missing_texts > 0:
    print(f"⚠️ CẢNH BÁO: Phát hiện {missing_texts} dòng thiếu text, {missing_intents} dòng thiếu intent. Đang loại bỏ...")
    df = df.dropna(subset=['text', 'intent'])

unique_intents = df['intent'].unique()
if len(unique_intents) < 2:
    print("❌ LỖI: Dataset phải có ít nhất 2 intents để phân loại. Hủy quá trình huấn luyện!")
    exit(1)

print("   ✅ Dữ liệu hợp lệ chuẩn cấu trúc!")

# ============================================================
# BƯỚC 2: TIỀN XỬ LÝ DỮ LIỆU
# ============================================================
print("\n🔄 BƯỚC 2: Tiền xử lý dữ liệu...")

def preprocess_text(text):
    """
    Tiền xử lý text tiếng Việt
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

# Áp dụng tiền xử lý
df['text_clean'] = df['text'].apply(preprocess_text)

# Loại bỏ câu trống
df = df[df['text_clean'].str.len() > 0].copy()
print(f"   ✅ Sau khi làm sạch: {len(df):,} câu hỏi")

# ============================================================
# BƯỚC 3: CHIA DỮ LIỆU TRAIN/TEST
# ============================================================
print("\n📊 BƯỚC 3: Chia dữ liệu train/test (80/20)...")

X = df['text_clean']
y = df['intent']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42, 
    stratify=y  # Đảm bảo tỷ lệ intent giống nhau
)

print(f"   ✅ Train: {len(X_train):,} câu")
print(f"   ✅ Test: {len(X_test):,} câu")

# ============================================================
# BƯỚC 4: VECTOR HÓA (TF-IDF)
# ============================================================
print("\n🔄 BƯỚC 4: Vector hóa với TF-IDF...")

vectorizer = TfidfVectorizer(
    max_features=10000,      # Giới hạn số từ vựng
    ngram_range=(1, 3),      # Unigram, bigram, trigram
    min_df=2,                # Từ phải xuất hiện ít nhất 2 lần
    max_df=0.8,              # Bỏ từ xuất hiện quá nhiều
    sublinear_tf=True        # Giảm ảnh hưởng của từ xuất hiện nhiều
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print(f"   ✅ Vocabulary size: {len(vectorizer.vocabulary_):,} từ")
print(f"   ✅ Train vector shape: {X_train_vec.shape}")
print(f"   ✅ Test vector shape: {X_test_vec.shape}")

# ============================================================
# BƯỚC 5: TRAIN MODEL
# ============================================================
print("\n🤖 BƯỚC 5: Train model (LinearSVC)...")

model = LinearSVC(
    C=1.0,                   # Regularization
    max_iter=2000,           # Số vòng lặp tối đa
    random_state=42,
    class_weight='balanced'  # Cân bằng class không đều
)

model.fit(X_train_vec, y_train)
print(f"   ✅ Model trained!")

# ============================================================
# BƯỚC 6: ĐÁNH GIÁ MODEL
# ============================================================
print("\n📊 BƯỚC 6: Đánh giá model...")

# Dự đoán trên tập test
y_pred = model.predict(X_test_vec)

# Tính accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"\n🎯 ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Classification report chi tiết
print(f"\n📋 CLASSIFICATION REPORT:")
print(classification_report(y_test, y_pred, zero_division=0))

# Confusion matrix
print(f"\n📊 CONFUSION MATRIX:")
cm = confusion_matrix(y_test, y_pred, labels=model.classes_)
print(f"Classes: {model.classes_}")
print(cm)

# ============================================================
# BƯỚC 7: LƯU MODEL
# ============================================================
print("\n💾 BƯỚC 7: Lưu model...")
from datetime import datetime
import shutil
import os

os.makedirs('models', exist_ok=True)

# Lưu model
with open('models/intent_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print(f"   ✅ Đã lưu: models/intent_model.pkl")

# Versioning
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2('models/intent_model.pkl', f'models/intent_model_{timestamp}.pkl')
print(f"   ✅ Đã phân bản: models/intent_model_{timestamp}.pkl")

# Lưu vectorizer
with open('models/vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
print(f"   ✅ Đã lưu: models/vectorizer.pkl")

# ============================================================
# HÀM PREDICT
# ============================================================
def predict_intent(text, model, vectorizer):
    """
    Dự đoán intent từ câu hỏi
    
    Args:
        text (str): Câu hỏi của user
        model: Model đã train
        vectorizer: TF-IDF vectorizer
    
    Returns:
        str: Intent dự đoán
    """
    # Tiền xử lý
    text_clean = preprocess_text(text)
    
    # Vector hóa
    text_vec = vectorizer.transform([text_clean])
    
    # Dự đoán
    intent = model.predict(text_vec)[0]
    
    # Lấy confidence score (khoảng cách đến decision boundary)
    decision = model.decision_function(text_vec)
    confidence = np.max(decision)
    
    return intent, confidence

# ============================================================
# TEST THỬ MODEL
# ============================================================
print("\n🧪 TEST THỬ MODEL:")
print("=" * 60)

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
    "Bún bò Huế quán nào ngon"
]

for question in test_questions:
    intent, confidence = predict_intent(question, model, vectorizer)
    print(f"❓ '{question}'")
    print(f"   → Intent: {intent} (confidence: {confidence:.3f})")
    print()

# ============================================================
# THỐNG KÊ CUỐI CÙNG
# ============================================================
print("=" * 60)
print("✅ HOÀN THÀNH!")
print("=" * 60)
print(f"📊 Tổng dữ liệu: {len(df):,} câu hỏi")
print(f"📊 Train: {len(X_train):,} câu")
print(f"📊 Test: {len(X_test):,} câu")
print(f"🎯 Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"💾 Model đã lưu: models/intent_model.pkl")
print(f"💾 Vectorizer đã lưu: models/vectorizer.pkl")
print("=" * 60)
