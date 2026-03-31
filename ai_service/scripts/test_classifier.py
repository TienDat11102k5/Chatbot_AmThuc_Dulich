# -*- coding: utf-8 -*-
"""Test classifier with Vietnamese accent input"""
import sys, os
sys.path.insert(0, "/app")

from src.core.intent_classifier import IntentClassifier

clf = IntentClassifier()

# Test classifier directly
tests = [
    ("xin chào", "chao_hoi"),
    ("cảm ơn bạn nhiều", "cam_on"),
    ("tạm biệt", "tam_biet"),
    ("phở bao nhiêu tiền", "hoi_gia"),
    ("so sánh bún bò và phở", "so_sanh"),
    ("Đà Nẵng ăn gì ngon", "tim_mon_an"),
    ("hai cộng hai bằng mấy", "out_of_scope"),
    ("bạn là ai", "hoi_thong_tin"),
    ("quán phở nào ngon ở Hà Nội", "tim_mon_an"),
    ("tìm quán cà phê Đà Lạt", "tim_dia_diem"),
]

print("=== DIRECT CLASSIFIER TEST ===")
passed = 0
for msg, exp in tests:
    try:
        r = clf.predict_intent(msg)
        intent = r["intent"]
        conf = r["confidence"]
        ok = "V" if intent == exp else "X"
        if ok == "V":
            passed += 1
        print(f"[{ok}] {intent:15s} (exp:{exp:15s}) c={conf:.2f} | {msg}")
    except Exception as e:
        print(f"[E] ERROR for '{msg}': {e}")
        
print(f"\nRESULT: {passed}/{len(tests)} PASSED")
