"""
File: src/core/recommender.py
Mục đích: Hệ thống Đề xuất (Recommender System) dựa trên Cosine Similarity.
          Khi biết người dùng đang hỏi về MÓN ĂN hoặc ĐỊA ĐIỂM nào,
          hệ thống sẽ tìm trong Cơ sở Tri thức (knowledge_base.csv) những bản ghi
          GIỐNG NHẤT với yêu cầu, rồi trả về Top 3 kết quả.

Nguyên lý hoạt động (TF-IDF + Cosine Similarity):
    1. Mỗi bản ghi trong knowledge_base.csv có cột "description" + "tags" mô tả chi tiết.
    2. Dùng TfidfVectorizer biến TẤT CẢ các mô tả đó thành MA TRẬN SỐ (Vector).
    3. Khi người dùng hỏi, NER trích xuất ra từ khóa (ví dụ: "lẩu bò đà lạt").
    4. Biến từ khóa đó thành 1 Vector số (cùng cách với bước 2).
    5. Tính Cosine Similarity = Góc giữa 2 Vector.
       - Nếu góc = 0° → Cosine = 1.0 → Hoàn toàn giống nhau.
       - Nếu góc = 90° → Cosine = 0.0 → Hoàn toàn khác nhau.
    6. Sắp xếp giảm dần và lấy Top 3 bản ghi có điểm Cosine cao nhất.
"""

import os             # Xử lý đường dẫn file
import pandas as pd   # Đọc CSV thành DataFrame dễ thao tác

# Thư viện scikit-learn cho Machine Learning
from sklearn.feature_extraction.text import TfidfVectorizer  # Biến text thành Vector số
from sklearn.metrics.pairwise import cosine_similarity       # Tính độ tương đồng Cosine

# Gọi hàm tiền xử lý NLP đã viết ở Phase 2
from src.core.nlp_utils import preprocess_text

# ==============================================================================
# CẤU HÌNH ĐƯỜNG DẪN FILE DỮ LIỆU
# ==============================================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWLEDGE_BASE_PATH = os.path.join(CURRENT_DIR, "..", "..", "data", "knowledge_base.csv")


class RecommenderSystem:
    """
    Class RecommenderSystem — Bộ não tìm kiếm ngữ nghĩa (Semantic Search).
    
    Quy trình khởi tạo:
    1. Nạp file knowledge_base.csv vào RAM.
    2. Ghép cột "description" và "tags" thành 1 chuỗi duy nhất cho mỗi bản ghi.
    3. Chạy TfidfVectorizer.fit_transform() để biến tất cả thành Ma trận TF-IDF.
    4. Lưu Ma trận đó vào thuộc tính `self.tfidf_matrix` → Sẵn sàng để so sánh.
    
    Khi cần tìm: Chỉ cần biến câu truy vấn thành 1 Vector, rồi so sánh với Ma trận.
    """
    
    def __init__(self):
        """
        Hàm khởi tạo: Thực hiện việc nạp dữ liệu và tiền tính toán Ma trận TF-IDF.
        Hàm này chỉ chạy MỘT LẦN khi Server khởi động (nhờ FastAPI lifespan).
        Sau đó mọi request đều dùng lại Ma trận đã tính sẵn → Cực nhanh.
        """
        # Bước 1: Đọc file CSV chưa cơ sở tri thức
        if not os.path.exists(KNOWLEDGE_BASE_PATH):
            raise FileNotFoundError(
                f"Không tìm thấy file tri thức: {KNOWLEDGE_BASE_PATH}\n"
                "Hãy chắc chắn đã tạo file data/knowledge_base.csv trước."
            )
        
        self.df = pd.read_csv(KNOWLEDGE_BASE_PATH)
        print(f"[Recommender] Đã nạp {len(self.df)} bản ghi từ knowledge_base.csv")
        
        # Bước 2: Tạo cột phụ "combined_text" = ghép nội dung "description" + "tags" + "name" + "region"
        # Mục đích: Cho TF-IDF có nhiều thông tin hơn để so sánh chính xác hơn.
        # Ví dụ sẽ ra dạng: "Phở Bò Hà Nội phở bò hà nội miền bắc truyền thống..."
        self.df['combined_text'] = (
            self.df['name'].fillna('') + " " +
            self.df['description'].fillna('') + " " +
            self.df['region'].fillna('') + " " +
            self.df['tags'].fillna('')
        )
        
        # Bước 3: Tiền xử lý NLP cho cột ghép (cắt từ tiếng Việt + loại bỏ stop words)
        self.df['processed_text'] = self.df['combined_text'].apply(preprocess_text)
        
        # Bước 4: Tính toán trước Ma trận TF-IDF cho toàn bộ 30 bản ghi
        # Kết quả là 1 ma trận kích thước: (30 bản ghi) x (số lượng từ vựng duy nhất)
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['processed_text'])
        print(f"[Recommender] Đã tính xong Ma trận TF-IDF: {self.tfidf_matrix.shape}")
        # Ví dụ output: (30, 250) → 30 bản ghi, 250 từ vựng riêng biệt
    
    def recommend(self, entities: dict, top_k: int = 3) -> list:
        """
        Hàm chính: Tìm kiếm Top K bản ghi GIỐNG NHẤT với yêu cầu của người dùng.
        
        Thuật toán Cosine Similarity:
        1. Lấy raw_query (câu truy vấn ghép) từ kết quả NER.
        2. Biến raw_query thành 1 Vector TF-IDF (cùng Vectorizer đã fit sẵn).
        3. Tính Cosine giữa Vector này với TẤT CẢ bản ghi trong Ma trận.
        4. Sắp xếp từ cao xuống thấp, lấy Top K.
        
        Tham số:
            entities (dict): Kết quả từ hàm ner.extract_entities().
                Ví dụ: {"food": ["lẩu bò"], "location": ["đà lạt"], "raw_query": "lẩu bò đà lạt"}
            top_k (int): Số lượng kết quả trả về (mặc định = 3).
            
        Trả về:
            list: Danh sách các Dict, mỗi Dict là 1 bản ghi kết quả.
            Ví dụ: [
                {"id": "MON011", "name": "Lẩu Bò Đà Lạt", "score": 0.87, ...},
                {"id": "MON004", "name": "Bún Bò Huế",     "score": 0.42, ...},
                {"id": "DIA009", "name": "Hồ Xuân Hương",  "score": 0.31, ...}
            ]
        """
        # 1. Lấy câu truy vấn thô từ NER (đã ghép food+location lại)
        raw_query = entities.get("raw_query", "")
        
        # Nếu không có gì để tìm thì trả mảng rỗng
        if not raw_query.strip():
            return []
        
        # 2. Tiền xử lý NLP cho câu truy vấn (cắt từ, loại stop words)
        processed_query = preprocess_text(raw_query)
        
        if not processed_query.strip():
            return []
        
        # 3. Chuyển câu truy vấn thành Vector TF-IDF
        # transform() (không phải fit_transform) vì Vectorizer đã học từ vựng rồi
        query_vector = self.vectorizer.transform([processed_query])
        
        # 4. Tính Cosine Similarity giữa Vector truy vấn với TOÀN BỘ Ma Trận
        # Kết quả: Mảng 1 chiều kích thước (1, 30) → 30 điểm tương đồng
        similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        # 5. Sắp xếp chỉ số (index) theo điểm giảm dần và lấy Top K
        # argsort() trả về danh sách index sắp tăng dần, nên dùng [::-1] để đảo ngược
        top_indices = similarity_scores.argsort()[::-1][:top_k]
        
        # 6. Đóng gói kết quả thành danh sách Dict trả về cho API
        results = []
        for idx in top_indices:
            score = similarity_scores[idx]
            
            # Bỏ qua các kết quả có điểm = 0 (hoàn toàn không liên quan)
            if score <= 0:
                continue
                
            row = self.df.iloc[idx]  # Lấy dòng dữ liệu tại vị trí index
            results.append({
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "description": row['description'],
                "location": row['region'],
                "address": row.get('address', ''),  # Lấy địa chỉ nếu có
                "tags": row['tags'],
                "score": round(float(score), 4)  # Làm tròn 4 chữ số thập phân
            })
        
        return results


# ==============================================================================
# DEMO: Chạy thử trực tiếp bằng lệnh `python -m src.core.recommender`
# ==============================================================================
if __name__ == "__main__":
    print("="*55)
    print(" 🔎 DEMO: Hệ thống Đề xuất Cosine Similarity")
    print("="*55)
    
    # Khởi tạo (chỉ cần 1 lần)
    recommender = RecommenderSystem()
    
    # Giả lập kết quả từ NER (như thể đã chạy ner.extract_entities() xong rồi)
    test_queries = [
        {"food": ["lẩu bò"], "location": ["đà lạt"], "raw_query": "lẩu bò đà lạt"},
        {"food": ["phở"],    "location": ["hà nội"],  "raw_query": "phở hà nội"},
        {"food": [],         "location": ["hội an"],  "raw_query": "hội an"},
        {"food": ["bánh mì"], "location": [],         "raw_query": "bánh mì"},
        {"food": ["hải sản"], "location": ["nha trang"], "raw_query": "hải sản nha trang"},
    ]
    
    for query in test_queries:
        print(f"\n📩 Truy vấn: \"{query['raw_query']}\"")
        results = recommender.recommend(query, top_k=3)
        
        if not results:
            print("   ❌ Không tìm thấy kết quả phù hợp.")
        else:
            for i, r in enumerate(results, 1):
                print(f"   🏆 Top {i}: [{r['id']}] {r['name']} ({r['location']}) — Điểm: {r['score']}")
