"""
File: test_context_follow_up.py
Mục đích: Integration test — Kiểm tra chatbot có NHỚ ngữ cảnh sau when follow-up không.

Kịch bản test:
  1. Single-intent follow-up: Hỏi cà phê → rồi "gợi ý thêm" → bot phải nhớ Hà Nội + cà phê
  2. Multi-intent follow-up: Hỏi phở + khách sạn → rồi "gợi ý thêm" → bot phải nhớ context

Chạy: py test_context_follow_up.py
"""

import sys
import os
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from src.main import app

PASS = "✅ PASS"
FAIL = "❌ FAIL"
results = []


def chat(client, message: str, session_id: str) -> dict:
    """Gửi 1 tin nhắn và trả về response dict."""
    resp = client.post("/api/v1/ai/chat", json={
        "message": message,
        "session_id": session_id,
    })
    assert resp.status_code == 200, f"API error {resp.status_code}: {resp.text[:200]}"
    return resp.json()


def get_ids(data: dict) -> set:
    """Lấy list ID từ recommendations."""
    recs = data.get("recommendations", [])
    return {r.get("id") for r in recs if r.get("id")}


def check(condition: bool, name: str, detail: str = ""):
    status = PASS if condition else FAIL
    results.append((status, name, detail))
    print(f"  {status} {name}")
    if not condition and detail:
        print(f"       → {detail}")


# ==============================================================================
# SCENARIO 1: Single-intent Follow-up
# "3 quán cà phê ở Hà Nội" → "gợi ý thêm" → phải nhớ Hà Nội + cà phê
# ==============================================================================

def test_single_intent_followup():
    print("\n" + "="*60)
    print("SCENARIO 1: Single-intent follow-up")
    print("="*60)

    session_id = str(uuid.uuid4())

    with TestClient(app) as client:
        # Turn 1: Câu hỏi gốc
        print("\n  Turn 1: '3 quán cà phê ở Hà Nội'")
        d1 = chat(client, "3 quán cà phê ở Hà Nội", session_id)
        ids1 = get_ids(d1)
        print(f"    Intent: {d1.get('intent')} | Recs: {len(d1.get('recommendations', []))}")

        check(d1.get("intent") in ("tim_mon_an",), "Turn1: intent = tim_mon_an",
              f"actual: {d1.get('intent')}")
        check(len(d1.get("recommendations", [])) > 0, "Turn1: có kết quả")

        # Turn 2: Follow-up "gợi ý thêm"
        print("\n  Turn 2: 'gợi ý thêm nữa'")
        d2 = chat(client, "gợi ý thêm nữa", session_id)
        ids2 = get_ids(d2)
        print(f"    Intent: {d2.get('intent')} | Recs: {len(d2.get('recommendations', []))}")

        check(d2.get("intent") in ("tim_mon_an", "tim_dia_diem"), "Turn2: intent hợp lệ (không phải multi_intent)",
              f"actual: {d2.get('intent')}")
        check(len(d2.get("recommendations", [])) > 0, "Turn2: có kết quả")

        overlap = ids1.intersection(ids2)
        check(len(overlap) == 0, "Turn2: không lặp kết quả từ Turn1",
              f"Trùng: {overlap}")

        # Turn 3: Follow-up lần 2
        print("\n  Turn 3: 'còn quán nào không?'")
        d3 = chat(client, "còn quán nào không?", session_id)
        ids3 = get_ids(d3)
        print(f"    Intent: {d3.get('intent')} | Recs: {len(d3.get('recommendations', []))}")

        check(d3.get("intent") in ("tim_mon_an", "tim_dia_diem"), "Turn3: intent hợp lệ",
              f"actual: {d3.get('intent')}")

        overlap2 = (ids1 | ids2).intersection(ids3)
        check(len(overlap2) == 0, "Turn3: không lặp kết quả từ Turn1+2",
              f"Trùng: {overlap2}")


# ==============================================================================
# SCENARIO 2: Multi-intent Follow-up
# "3 quán phở + 2 khách sạn ở Đà Lạt" → "gợi ý thêm" → phải nhớ Đà Lạt
# ==============================================================================

def test_multi_intent_followup():
    print("\n" + "="*60)
    print("SCENARIO 2: Multi-intent follow-up")
    print("="*60)

    session_id = str(uuid.uuid4())

    with TestClient(app) as client:
        # Turn 1: Câu multi-intent
        print("\n  Turn 1: '3 quán phở và 2 khách sạn ở Đà Lạt'")
        d1 = chat(client, "3 quán phở và 2 khách sạn ở Đà Lạt", session_id)
        ids1 = get_ids(d1)
        is_multi = d1.get("is_multi_intent", False)
        print(f"    is_multi_intent: {is_multi} | Intent: {d1.get('intent')} | Recs: {len(d1.get('recommendations', []))}")

        check(is_multi, "Turn1: nhận diện là multi-intent",
              f"is_multi_intent = {is_multi}")
        check(len(d1.get("sub_intent_results", [])) >= 2, "Turn1: có >= 2 sections",
              f"sections = {len(d1.get('sub_intent_results', []))}")

        # Turn 2: "gợi ý thêm"
        print("\n  Turn 2: 'gợi ý thêm đi'")
        d2 = chat(client, "gợi ý thêm đi", session_id)
        ids2 = get_ids(d2)
        print(f"    Intent: {d2.get('intent')} | Recs: {len(d2.get('recommendations', []))}")

        check(d2.get("intent") in ("tim_mon_an", "tim_dia_diem"), "Turn2: intent hợp lệ (không phải multi_intent)",
              f"actual: {d2.get('intent')}")
        check(len(d2.get("recommendations", [])) > 0, "Turn2: có kết quả")

        overlap = ids1.intersection(ids2)
        check(len(overlap) == 0, "Turn2: không lặp kết quả từ Turn1",
              f"Trùng: {overlap}")

        # Turn 3: "còn chỗ nào ở Đà Lạt?"
        print("\n  Turn 3: 'còn chỗ nào ở Đà Lạt không?'")
        d3 = chat(client, "còn chỗ nào ở Đà Lạt không?", session_id)
        print(f"    Intent: {d3.get('intent')} | Recs: {len(d3.get('recommendations', []))}")

        check(d3.get("intent") in ("tim_mon_an", "tim_dia_diem"), "Turn3: intent hợp lệ",
              f"actual: {d3.get('intent')}")


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == "__main__":
    print("\n🧠 BẮT ĐẦU TEST CONTEXT FOLLOW-UP")
    print("="*60)

    test_single_intent_followup()
    test_multi_intent_followup()

    # Tổng kết
    print("\n" + "="*60)
    total = len(results)
    passed = sum(1 for s, _, _ in results if s == PASS)
    failed = total - passed
    print(f"📊 KẾT QUẢ: {passed}/{total} PASS | {failed} FAIL")
    print("="*60)
    if failed > 0:
        print("\n❌ Các test thất bại:")
        for status, name, detail in results:
            if status == FAIL:
                print(f"   - {name}: {detail}")
    else:
        print("\n🎉 TẤT CẢ TEST ĐÃ PASS! Context memory hoạt động đúng.")

    with open("test_followup_result.txt", "w", encoding="utf-8") as f:
        for status, name, detail in results:
            line = f"{status} {name}"
            if detail:
                line += f"\n       Detail: {detail}"
            f.write(line + "\n")
    print("\nĐã ghi kết quả ra: test_followup_result.txt")
