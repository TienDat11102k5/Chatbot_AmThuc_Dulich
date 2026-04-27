# Pseudocode các thuật toán chính

## 1. Intent Classification (Phân loại Ý định)

```python
# Thuật toán: LinearSVC + TF-IDF
# Input: user_query (string)
# Output: intent_label (string), confidence (float)

FUNCTION classify_intent(user_query):
    # Bước 1: Tiền xử lý văn bản
    cleaned_text = preprocess(user_query)
        # - Chuyển về lowercase
        # - Loại bỏ dấu câu
        # - Chuẩn hóa Unicode (NFC)
    
    # Bước 2: Tokenization (tách từ tiếng Việt)
    tokens = tokenize_vietnamese(cleaned_text)
        # Sử dụng: Underthesea word_tokenize
        # VD: "tìm quán phở" → ["tìm", "quán", "phở"]
    
    # Bước 3: Loại bỏ stopwords
    filtered_tokens = remove_stopwords(tokens)
        # Loại bỏ: "của", "và", "thì", "là"...
    
    # Bước 4: Chuyển đổi sang vector TF-IDF
    feature_vector = tfidf_vectorizer.transform(filtered_tokens)
        # TF-IDF: Term Frequency - Inverse Document Frequency
        # Vector shape: (1, vocab_size)
    
    # Bước 5: Dự đoán intent bằng LinearSVC
    intent_label = linear_svc_model.predict(feature_vector)
    confidence = linear_svc_model.decision_function(feature_vector)
        # Các intent: "find_restaurant", "find_tourist_spot", 
        #             "ask_price", "ask_location", "greeting"
    
    # Bước 6: Kiểm tra ngưỡng confidence
    IF confidence < THRESHOLD (0.5):
        RETURN "unknown", confidence
    ELSE:
        RETURN intent_label, confidence
END FUNCTION
```

---

## 2. Named Entity Recognition (Trích xuất Thực thể)

```python
# Thuật toán: Rule-based + Regex Pattern Matching
# Input: user_query (string)
# Output: entities (dict)

FUNCTION extract_entities(user_query):
    entities = {
        "location": None,
        "food": None,
        "price_range": None,
        "preferences": []
    }
    
    # Bước 1: Trích xuất địa điểm (Location)
    location_patterns = [
        r"ở\s+(\w+)",           # "ở Hà Nội"
        r"tại\s+(\w+)",         # "tại Cầu Giấy"
        r"quận\s+(\d+|\w+)",    # "quận 1", "quận Tân Bình"
        r"gần\s+(\w+)"          # "gần Hồ Gươm"
    ]
    
    FOR pattern IN location_patterns:
        match = regex_search(pattern, user_query)
        IF match:
            entities["location"] = normalize_location(match.group(1))
                # Chuẩn hóa: "HCM" → "Hồ Chí Minh"
            BREAK
    
    # Bước 2: Trích xuất món ăn (Food)
    food_keywords = load_food_dictionary()
        # Dictionary: ["phở", "bún chả", "cơm tấm", "bánh mì"...]
    
    FOR food IN food_keywords:
        IF food IN user_query:
            entities["food"] = food
            BREAK
    
    # Bước 3: Trích xuất mức giá (Price Range)
    price_patterns = [
        r"dưới\s+(\d+)k",       # "dưới 50k"
        r"từ\s+(\d+)k?\s*đến\s*(\d+)k",  # "từ 30k đến 50k"
        r"khoảng\s+(\d+)k"      # "khoảng 100k"
    ]
    
    FOR pattern IN price_patterns:
        match = regex_search(pattern, user_query)
        IF match:
            entities["price_range"] = parse_price(match.groups())
            BREAK
    
    # Bước 4: Trích xuất sở thích/dị ứng (Preferences)
    preference_keywords = {
        "vegetarian": ["chay", "ăn chay", "không thịt"],
        "no_seafood": ["không hải sản", "dị ứng hải sản"],
        "no_onion": ["không hành", "không ăn hành"],
        "halal": ["halal", "đồ ăn halal"]
    }
    
    FOR pref_type, keywords IN preference_keywords:
        FOR keyword IN keywords:
            IF keyword IN user_query:
                entities["preferences"].append(pref_type)
    
    RETURN entities
END FUNCTION
```

---

## 3. Semantic Search (Tìm kiếm Ngữ nghĩa)

```python
# Thuật toán: TF-IDF + Cosine Similarity
# Input: query_text (string), entities (dict), top_k (int)
# Output: ranked_places (list)

FUNCTION semantic_search(query_text, entities, top_k=5):
    # Bước 1: Xây dựng query vector
    query_tokens = preprocess_and_tokenize(query_text)
    query_vector = tfidf_vectorizer.transform(query_tokens)
        # Shape: (1, vocab_size)
    
    # Bước 2: Lọc database theo entities
    filtered_places = database.query("SELECT * FROM places WHERE 1=1")
    
    IF entities["location"] IS NOT None:
        filtered_places = filtered_places.filter(
            city == entities["location"] OR 
            district == entities["location"]
        )
    
    IF entities["food"] IS NOT None:
        filtered_places = filtered_places.filter(
            tags CONTAINS entities["food"]
        )
    
    IF entities["price_range"] IS NOT None:
        min_price, max_price = entities["price_range"]
        filtered_places = filtered_places.filter(
            price_range BETWEEN min_price AND max_price
        )
    
    # Bước 3: Tính Cosine Similarity
    similarity_scores = []
    
    FOR place IN filtered_places:
        # Lấy vector embedding của place (đã tính trước)
        place_vector = place.embedding
            # Embedding từ: name + description + tags
        
        # Tính cosine similarity
        similarity = cosine_similarity(query_vector, place_vector)
            # Formula: cos(θ) = (A · B) / (||A|| × ||B||)
            # Range: [0, 1], 1 = giống nhất
        
        similarity_scores.append({
            "place_id": place.id,
            "place_name": place.name,
            "similarity": similarity
        })
    
    # Bước 4: Sắp xếp theo similarity giảm dần
    ranked_places = sort_descending(similarity_scores, key="similarity")
    
    # Bước 5: Lấy top K kết quả
    top_results = ranked_places[:top_k]
    
    RETURN top_results
END FUNCTION
```

---

## 4. Context Management (Quản lý Ngữ cảnh)

```python
# Thuật toán: Redis-based Context Storage
# Input: user_id (int), current_entities (dict)
# Output: merged_context (dict)

FUNCTION manage_context(user_id, current_entities):
    # Bước 1: Lấy context cũ từ Redis
    cache_key = f"chat:context:{user_id}"
    previous_context = redis.get(cache_key)
    
    IF previous_context IS None:
        previous_context = {
            "location": None,
            "food": None,
            "price_range": None,
            "last_intent": None,
            "conversation_count": 0
        }
    
    # Bước 2: Merge context (ưu tiên current_entities)
    merged_context = previous_context.copy()
    
    FOR key, value IN current_entities:
        IF value IS NOT None:
            merged_context[key] = value
        # Nếu current_entities không có, giữ nguyên previous_context
    
    merged_context["conversation_count"] += 1
    merged_context["last_updated"] = current_timestamp()
    
    # Bước 3: Lưu lại vào Redis với TTL
    redis.setex(cache_key, ttl=900, value=merged_context)
        # TTL = 900 seconds (15 phút)
    
    RETURN merged_context
END FUNCTION
```

---

## 5. Response Generation (Sinh Phản hồi)

```python
# Thuật toán: Template-based Response
# Input: intent (string), entities (dict), places (list)
# Output: response_text (string)

FUNCTION generate_response(intent, entities, places):
    # Bước 1: Chọn template theo intent
    templates = {
        "find_restaurant": [
            "Mình tìm thấy {count} quán {food} ở {location} phù hợp với bạn:",
            "Dưới đây là {count} gợi ý quán {food} tại {location}:",
        ],
        "find_tourist_spot": [
            "Có {count} địa điểm du lịch ở {location} bạn có thể tham khảo:",
        ],
        "no_results": [
            "Xin lỗi, mình không tìm thấy kết quả phù hợp với yêu cầu của bạn.",
            "Không có địa điểm nào khớp với tiêu chí. Bạn thử mở rộng điều kiện nhé!",
        ]
    }
    
    # Bước 2: Kiểm tra có kết quả không
    IF places IS EMPTY:
        template = random_choice(templates["no_results"])
        RETURN template
    
    # Bước 3: Điền thông tin vào template
    template = random_choice(templates[intent])
    response_text = template.format(
        count=len(places),
        food=entities.get("food", "ăn uống"),
        location=entities.get("location", "khu vực bạn chọn")
    )
    
    # Bước 4: Thêm danh sách địa điểm
    FOR i, place IN enumerate(places):
        response_text += f"\n{i+1}. {place.name}"
        response_text += f"\n   📍 {place.address}"
        response_text += f"\n   💰 {place.price_range}"
        response_text += f"\n   ⭐ {place.rating}/5.0"
    
    RETURN response_text
END FUNCTION
```

---

## Độ phức tạp thuật toán

| Thuật toán | Time Complexity | Space Complexity |
|------------|----------------|------------------|
| Intent Classification | O(n × m) | O(vocab_size) |
| NER Extraction | O(n × p) | O(1) |
| Semantic Search | O(k × d) | O(k × d) |
| Context Management | O(1) | O(u) |

**Chú thích:**
- n: Độ dài câu query
- m: Số lượng features (vocab_size)
- p: Số lượng patterns
- k: Số lượng places trong database
- d: Số chiều của vector embedding
- u: Số lượng users
