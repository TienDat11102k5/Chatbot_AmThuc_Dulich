# -*- coding: utf-8 -*-
"""
Patch v2: Thêm keyword-based intent refinement + dynamic PROTECTED_INTENTS
"""

path = '/app/src/core/intent_classifier.py'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Tìm dòng chứa "# 4. Rule-based override" VÀ "QUAN TR"
start_idx = None
for i, line in enumerate(lines):
    if '# 4. Rule-based override' in line:
        start_idx = i
        break

if start_idx is None:
    print("ERROR: Cannot find '# 4. Rule-based override'")
    exit(1)

# Tìm dòng "if prediction not in PROTECTED_INTENTS:" sau start_idx
end_idx = None
for i in range(start_idx, min(start_idx + 15, len(lines))):
    if 'if prediction not in PROTECTED_INTENTS:' in lines[i]:
        end_idx = i
        break

if end_idx is None:
    print("ERROR: Cannot find 'if prediction not in PROTECTED_INTENTS:'")
    exit(1)

print(f"Target: lines {start_idx+1} to {end_idx+1}")
print(f"Removing {end_idx - start_idx + 1} lines, replacing with new block")

# Đọc indent từ dòng đầu tiên
indent = '            '

new_lines = [
    indent + '# ==================================================================\n',
    indent + '# 3b. Phase 4: Keyword-based intent refinement cho 3 intent moi\n',
    indent + '# Phat hien tu khoa gia/danh gia/so sanh de override SVM prediction\n',
    indent + '# Chay TRUOC rule-based food/place de lay quyen uu tien\n',
    indent + '# ==================================================================\n',
    indent + 'user_lower = user_message.lower()\n',
    indent + '\n',
    indent + '# Tu khoa gia ca (hoi_gia)\n',
    indent + 'PRICE_KW = ["bao nhi\u00eau", "bao nhieu", "gi\u00e1", "gia bao", "ti\u1ec1n", "tien",\n',
    indent + '            "\u0111\u1eaft", "r\u1ebb", "m\u1eafc", "chi ph\u00ed", "chi phi", "t\u1ed1n", "budget"]\n',
    indent + '# Tu khoa danh gia (danh_gia)\n',
    indent + 'REVIEW_KW = ["review", "\u0111\u00e1nh gi\u00e1", "danh gia", "nh\u1eadn x\u00e9t", "nhan xet",\n',
    indent + '             "t\u1ed1t kh\u00f4ng", "ngon kh\u00f4ng", "c\u00f3 t\u1ed1t", "c\u00f3 ngon", "c\u00f3 hay",\n',
    indent + '             "c\u00f3 \u0111\u01b0\u1ee3c", "\u0111\u00e1ng", "worth", "feedback", "rating"]\n',
    indent + '# Tu khoa so sanh (so_sanh)\n',
    indent + 'COMPARE_KW = ["so s\u00e1nh", "so sanh", "hay h\u01a1n", "ngon h\u01a1n", "t\u1ed1t h\u01a1n",\n',
    indent + '              "\u0111\u1eb9p h\u01a1n", "n\u00ean ch\u1ecdn", "nen chon", "n\u00ean \u0103n", "nen an",\n',
    indent + '              "n\u00ean \u0111i", "hay l\u00e0", "hay la", "compare"]\n',
    indent + '\n',
    indent + 'has_price = any(kw in user_lower for kw in PRICE_KW)\n',
    indent + 'has_review = any(kw in user_lower for kw in REVIEW_KW)\n',
    indent + 'has_compare = any(kw in user_lower for kw in COMPARE_KW)\n',
    indent + '\n',
    indent + '# Override prediction neu phat hien tu khoa ro rang\n',
    indent + 'if has_price and prediction != "out_of_scope":\n',
    indent + '    prediction = "hoi_gia"\n',
    indent + '    confidence = max(confidence, 0.85)\n',
    indent + 'elif has_review and prediction != "out_of_scope":\n',
    indent + '    prediction = "danh_gia"\n',
    indent + '    confidence = max(confidence, 0.85)\n',
    indent + 'elif has_compare and prediction != "out_of_scope":\n',
    indent + '    prediction = "so_sanh"\n',
    indent + '    confidence = max(confidence, 0.85)\n',
    indent + '\n',
    indent + '# ==================================================================\n',
    indent + '# 4. Rule-based override: Uu tien place_type truoc!\n',
    indent + '# PROTECTED_INTENTS: Dynamic - chi protect intent moi khi co keyword\n',
    indent + '# ==================================================================\n',
    indent + 'PROTECTED_INTENTS = {\n',
    indent + '    "out_of_scope", "chao_hoi", "cam_on", "tam_biet", "hoi_thong_tin"\n',
    indent + '}\n',
    indent + '# Chi protect 3 intent moi khi co keyword tuong ung (Phase 4)\n',
    indent + 'if has_price: PROTECTED_INTENTS.add("hoi_gia")\n',
    indent + 'if has_review: PROTECTED_INTENTS.add("danh_gia")\n',
    indent + 'if has_compare: PROTECTED_INTENTS.add("so_sanh")\n',
    indent + 'if prediction not in PROTECTED_INTENTS:\n',
]

result = lines[:start_idx] + new_lines + lines[end_idx+1:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(result)

# Verify
with open(path, 'r', encoding='utf-8') as f:
    verify = f.readlines()
    
count = 0
for line in verify:
    if 'PRICE_KW' in line or 'REVIEW_KW' in line or 'COMPARE_KW' in line:
        count += 1
    if 'has_price' in line:
        count += 1

print(f"SUCCESS! Patched. Verification: found {count} new keyword references")
print(f"Total lines: {len(lines)} -> {len(result)}")
