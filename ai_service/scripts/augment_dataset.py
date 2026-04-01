"""
Script: augment_dataset.py
Purpose: Data Augmentation for small intents to balance training dataset.
         Generates new training samples using synonym replacement, word shuffling,
         and template-based generation for underrepresented intents.

Target: Bring small intents (chao_hoi, cam_on, tam_biet, hoi_thong_tin, 
        out_of_scope, hoi_vi_tri) up to ~1500-3000 samples each.
"""

import pandas as pd
import random
import re

# ==============================================================================
# AUGMENTATION TEMPLATES — Vietnamese-specific
# ==============================================================================

GREETING_TEMPLATES = [
    "xin chào", "chào bạn", "hi", "hello", "hey", "chào nhé",
    "xin chào bạn", "chào bạn nhé", "mình chào bạn", "hi bạn",
    "ê chào", "chào nha", "hello nha", "hey yo", "yo",
    "xin chào chatbot", "chào bot", "hi bot", "chào ai đó",
    "chào buổi sáng", "chào buổi chiều", "chào buổi tối",
    "good morning", "good afternoon", "good evening",
    "chào bạn ơi", "ê bạn ơi", "bạn ơi", "ơi bạn",
    "mình muốn hỏi", "cho mình hỏi", "mình cần giúp đỡ",
    "bạn giúp mình với", "giúp mình nha", "tư vấn giúp mình",
    "chào mừng", "xin chào mọi người", "hello mọi người",
    "bạn có ở đây không", "có ai không", "ai đó giúp mình",
    "mình mới tới", "mình mới vào", "lần đầu mình dùng",
    "hehe chào", "hihi xin chào", "chào xìu", "yo yo",
]

THANKS_TEMPLATES = [
    "cảm ơn", "cảm ơn bạn", "cảm ơn nhiều", "cảm ơn nhé",
    "thank you", "thanks", "tks", "thank", "cám ơn",
    "cảm ơn bạn nhiều", "cảm ơn bạn nhé", "cảm ơn nha",
    "cảm ơn rất nhiều", "quá tuyệt cảm ơn", "hay quá cảm ơn",
    "ok cảm ơn", "oke cảm ơn", "okie cảm ơn",
    "tuyệt vời cảm ơn", "hay lắm cảm ơn", "đúng rồi cảm ơn",
    "mình cảm ơn", "xin cảm ơn", "cảm ơn bạn rất nhiều",
    "vui quá cảm ơn", "đẹp quá cảm ơn", "ngon quá cảm ơn",
    "cảm ơn đã giúp", "cảm ơn đã tư vấn", "cảm ơn đã gợi ý",
    "bạn tuyệt vời cảm ơn", "mình biết ơn", "biết ơn bạn",
    "cảm ơn thông tin", "cảm ơn gợi ý", "cảm ơn lời khuyên",
]

GOODBYE_TEMPLATES = [
    "tạm biệt", "bye", "bye bye", "tạm biệt nhé", "bye nha",
    "hẹn gặp lại", "chào nhé tạm biệt", "goodbye", "see you",
    "mình đi đây", "bye bạn", "tạm biệt bạn", "bai bai",
    "hẹn gặp", "gặp lại sau nhé", "mình phải đi rồi",
    "thôi tạm biệt", "ok bye", "oke bye", "ok tạm biệt",
    "chào tạm biệt", "tạm biệt nha", "bye bye nhé",
    "mình đi nghe", "mình offline đây", "mình tắt đây",
    "cảm ơn bye", "ok cảm ơn bye", "tuyệt vời bye",
    "lát gặp lại", "mai gặp", "khi nào gặp lại",
    "chào thân ái", "bái bai", "pa pa", "bai",
]

INFO_TEMPLATES = [
    "bạn là ai", "bạn biết gì", "bạn có thể làm gì",
    "chatbot này là gì", "bạn hỗ trợ gì", "giới thiệu bạn",
    "bạn tên gì", "mày là ai", "bạn là chatbot gì",
    "bạn biết những gì", "bạn giỏi cái gì", "chức năng của bạn",
    "bạn làm được gì", "hướng dẫn sử dụng", "cách dùng chatbot",
    "bạn có thông minh không", "bạn là robot à", "bạn là AI à",
    "giới thiệu về bạn", "tell me about yourself", "who are you",
    "bạn có thể giúp gì", "bạn hỗ trợ những gì", "bạn làm gì",
    "bạn được tạo ra bởi ai", "ai tạo ra bạn", "bạn từ đâu ra",
    "sử dụng bạn như thế nào", "mình hỏi bạn được gì",
    "chatbot hoạt động thế nào", "bạn hiểu tiếng việt không",
]

OOS_TEMPLATES = [
    "thời tiết hôm nay thế nào", "hôm nay trời đẹp quá",
    "bao nhiêu độ hôm nay", "trời nóng quá", "trời mưa không",
    "1 cộng 1 bằng mấy", "giải phương trình cho mình",
    "dịch tiếng anh giúp", "translate this", "how are you",
    "kể chuyện cười", "hát bài gì đi", "bạn có người yêu không",
    "mấy giờ rồi", "hôm nay ngày mấy", "tin tức hôm nay",
    "giá vàng hôm nay", "tỷ giá đô la", "bitcoin bao nhiêu",
    "lập trình python", "code javascript", "fix bug giúp",
    "bạn thích gì", "bạn ghét gì", "bạn buồn không",
    "thi đại học", "học bài gì", "bài tập toán",
    "phim hay không", "nhạc gì hay", "game nào vui",
    "bóng đá hôm nay", "kết quả bóng đá", "world cup",
    "chính trị", "kinh tế vĩ mô", "chiến tranh",
    "sức khỏe", "bệnh gì", "thuốc gì", "đau đầu",
    "tình yêu", "crush", "người yêu", "chia tay",
    "xe máy", "ô tô", "mua xe", "sửa xe",
    "mua nhà", "thuê phòng", "bất động sản",
    "tuyển dụng", "xin việc", "lương bao nhiêu",
    "crypto", "chứng khoán", "đầu tư",
    "bạn làm bài tập được không", "giải toán cho mình",
    "viết email cho mình", "viết văn giúp",
    "thủ đô nước pháp là gì", "dân số việt nam",
    "ai là tổng thống mỹ", "elon musk là ai",
]

HOI_VI_TRI_TEMPLATES = [
    "quán {food} gần đây", "{food} gần đây ở đâu",
    "gần đây có quán {food} nào không", "tìm quán {food} gần mình",
    "quán ăn gần đây", "nhà hàng gần đây", "quán cà phê gần đây",
    "ở gần đây có gì ăn", "gần đây có gì ngon",
    "quán nào gần nhất", "chỗ nào gần đây", "tìm quán gần đây",
    "quanh đây có quán nào", "xung quanh đây có gì ăn",
    "{food} ở đâu gần đây", "tìm {food} ở gần",
    "cho mình quán {food} gần đây", "gợi ý quán gần đây",
    "quán gần nhất ở đâu", "ăn gì gần đây",
    "có quán nào gần hông", "quán {food} gần hông",
]

FOOD_ITEMS = [
    "phở", "bún bò", "bún chả", "bánh mì", "cơm tấm", "hủ tiếu",
    "bún riêu", "bánh xèo", "bánh cuốn", "gỏi cuốn", "bún đậu",
    "cà phê", "trà sữa", "nước mía", "sinh tố", "chè",
    "mì quảng", "cao lầu", "nem nướng", "bò kho", "lẩu",
    "cơm", "cháo", "xôi", "bánh canh", "cá kho",
]


def augment_with_variations(text: str) -> list:
    """Generate variations of a text using simple augmentation techniques."""
    variations = [text]
    
    # Add/remove diacritics variations are already in templates
    # Add emoji variations
    emojis = ["😊", "🤗", "👋", "🙏", "😄", "🥰", "✨", "🌟", ""]
    for emoji in random.sample(emojis, min(3, len(emojis))):
        if emoji:
            variations.append(f"{emoji} {text}")
            variations.append(f"{text} {emoji}")
    
    # Add filler words
    fillers = ["ạ", "nha", "nhé", "nè", "hen", "nghen", "ha", "vậy", "đi"]
    for filler in random.sample(fillers, min(3, len(fillers))):
        variations.append(f"{text} {filler}")
    
    # Capitalize variations
    variations.append(text.capitalize())
    variations.append(text.upper())
    
    return variations


def generate_augmented_samples(templates: list, intent: str, target_count: int, 
                                food_items: list = None) -> list:
    """Generate augmented samples from templates."""
    samples = []
    
    while len(samples) < target_count:
        template = random.choice(templates)
        
        # Replace {food} placeholder if present
        if "{food}" in template and food_items:
            food = random.choice(food_items)
            template = template.replace("{food}", food)
        
        # Generate variations
        variations = augment_with_variations(template)
        for v in variations:
            if len(samples) < target_count:
                samples.append({"text": v.strip(), "intent": intent})
    
    return samples[:target_count]


def main():
    print("=" * 60)
    print("🧬 DATA AUGMENTATION — Cân bằng Dataset")
    print("=" * 60)
    
    # Load current dataset
    df = pd.read_csv("data/intent_dataset.csv")
    print(f"\n📊 Dataset hiện tại: {len(df)} mẫu")
    print(df["intent"].value_counts().to_string())
    
    # Target counts for small intents
    targets = {
        "chao_hoi": 2000,
        "cam_on": 2000,
        "tam_biet": 2000,
        "hoi_thong_tin": 2000,
        "out_of_scope": 2500,
        "hoi_vi_tri": 2500,
    }
    
    template_map = {
        "chao_hoi": GREETING_TEMPLATES,
        "cam_on": THANKS_TEMPLATES,
        "tam_biet": GOODBYE_TEMPLATES,
        "hoi_thong_tin": INFO_TEMPLATES,
        "out_of_scope": OOS_TEMPLATES,
        "hoi_vi_tri": HOI_VI_TRI_TEMPLATES,
    }
    
    all_new_samples = []
    
    for intent, target in targets.items():
        current_count = len(df[df["intent"] == intent])
        needed = target - current_count
        
        if needed <= 0:
            print(f"  ✅ {intent}: already at {current_count} (target: {target})")
            continue
        
        templates = template_map[intent]
        new_samples = generate_augmented_samples(
            templates, intent, needed, 
            food_items=FOOD_ITEMS if intent == "hoi_vi_tri" else None
        )
        all_new_samples.extend(new_samples)
        print(f"  🧬 {intent}: +{len(new_samples)} mẫu (from {current_count} → {target})")
    
    # Merge and save
    if all_new_samples:
        df_new = pd.DataFrame(all_new_samples)
        df_augmented = pd.concat([df, df_new], ignore_index=True)
        
        # Shuffle
        df_augmented = df_augmented.sample(frac=1, random_state=42).reset_index(drop=True)
        
        # Remove exact duplicates
        before_dedup = len(df_augmented)
        df_augmented = df_augmented.drop_duplicates(subset=["text", "intent"])
        after_dedup = len(df_augmented)
        
        df_augmented.to_csv("data/intent_dataset.csv", index=False)
        
        print(f"\n✅ Augmentation hoàn tất!")
        print(f"   Trước: {len(df)} mẫu")
        print(f"   Thêm: {len(all_new_samples)} mẫu")
        print(f"   Loại trùng: {before_dedup - after_dedup}")
        print(f"   Sau: {after_dedup} mẫu")
        print(f"\n📊 Phân bổ mới:")
        print(df_augmented["intent"].value_counts().to_string())
    else:
        print("\n✅ Dataset đã cân bằng, không cần augment thêm.")


if __name__ == "__main__":
    main()
