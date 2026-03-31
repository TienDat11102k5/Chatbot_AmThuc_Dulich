# -*- coding: utf-8 -*-
"""Script test 12 cases Phase 4"""
import sys
sys.path.insert(0, '/app')
from src.core.intent_classifier import IntentClassifier

c = IntentClassifier()

tests = [
    ('xin chao', 'chao_hoi'),
    ('chao ban', 'chao_hoi'),
    ('cam on nhe', 'cam_on'),
    ('bye bye', 'tam_biet'),
    ('ban la ai', 'hoi_thong_tin'),
    ('pho o Ha Noi gia bao nhieu', 'hoi_gia'),
    ('so sanh pho va bun bo', 'so_sanh'),
    ('review quan an Da Lat', 'danh_gia'),
    ('quan pho ngon o dau', 'tim_mon_an'),
    ('cho nao vui choi o Nha Trang', 'tim_dia_diem'),
    ('Bitcoin hom nay gia bao nhieu', 'out_of_scope'),
    ('', 'out_of_scope'),
]

passed = 0
failed = 0
fail_details = []

for i, (text, expected) in enumerate(tests, 1):
    result = c.predict_intent(text)
    actual = result['intent']
    conf = result['confidence']
    ok = (actual == expected)
    if ok:
        passed += 1
        tag = "PASS"
    else:
        failed += 1
        tag = "FAIL"
        fail_details.append((i, text, expected, actual, conf))
    
    display = text if text else "(empty)"
    print("Test %2d [%s] %-45s expect=%-15s got=%-15s conf=%.4f" % (i, tag, display, expected, actual, conf))

print("")
print("=" * 80)
print("SCORE: %d/%d PASS, %d FAIL" % (passed, passed + failed, failed))

if failed > 0:
    print("")
    print("FAILED TESTS:")
    for (num, txt, exp, act, co) in fail_details:
        print("  #%d: '%s' -> expected=%s, got=%s (conf=%.4f)" % (num, txt, exp, act, co))
else:
    print("ALL 12 TESTS PASSED!")
