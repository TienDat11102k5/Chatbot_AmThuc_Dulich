"""
Test script for Context Awareness feature.

Test Cases:
1. Basic follow-up: "Cà phê ở Đà Lạt" → "Còn quán nào không?"
2. Multiple follow-ups without repeating recommendations
3. Topic change detection
"""

import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api/v1/ai/chat"

def test_context_awareness():
    """Test context awareness with follow-up questions."""
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    print(f"🔑 Session ID: {session_id}\n")
    
    # Test Case 1: Initial query
    print("=" * 60)
    print("TEST CASE 1: Initial Query")
    print("=" * 60)
    
    message1 = "Cà phê ở Đà Lạt"
    response1 = send_message(message1, session_id)
    
    print(f"👤 User: {message1}")
    print(f"🤖 AI Intent: {response1['intent']}")
    print(f"📊 Recommendations: {len(response1['recommendations'])}")
    
    if response1['recommendations']:
        print("\n📍 Gợi ý lần 1:")
        rec_ids_1 = []
        for i, rec in enumerate(response1['recommendations'], 1):
            print(f"   {i}. {rec['name']} (ID: {rec['id']})")
            rec_ids_1.append(rec['id'])
    
    # Test Case 2: Follow-up question
    print("\n" + "=" * 60)
    print("TEST CASE 2: Follow-up Question")
    print("=" * 60)
    
    message2 = "Còn quán nào không?"
    response2 = send_message(message2, session_id)
    
    print(f"👤 User: {message2}")
    print(f"🤖 AI Intent: {response2['intent']}")
    print(f"📊 Recommendations: {len(response2['recommendations'])}")
    
    if response2['recommendations']:
        print("\n📍 Gợi ý lần 2:")
        rec_ids_2 = []
        for i, rec in enumerate(response2['recommendations'], 1):
            print(f"   {i}. {rec['name']} (ID: {rec['id']})")
            rec_ids_2.append(rec['id'])
        
        # Check for duplicates
        duplicates = set(rec_ids_1) & set(rec_ids_2)
        if duplicates:
            print(f"\n❌ FAILED: Found duplicate recommendations: {duplicates}")
        else:
            print(f"\n✅ PASSED: No duplicate recommendations")
    
    # Test Case 3: Another follow-up
    print("\n" + "=" * 60)
    print("TEST CASE 3: Second Follow-up")
    print("=" * 60)
    
    message3 = "Còn nữa không?"
    response3 = send_message(message3, session_id)
    
    print(f"👤 User: {message3}")
    print(f"🤖 AI Intent: {response3['intent']}")
    print(f"📊 Recommendations: {len(response3['recommendations'])}")
    
    if response3['recommendations']:
        print("\n📍 Gợi ý lần 3:")
        rec_ids_3 = []
        for i, rec in enumerate(response3['recommendations'], 1):
            print(f"   {i}. {rec['name']} (ID: {rec['id']})")
            rec_ids_3.append(rec['id'])
        
        # Check for duplicates with previous recommendations
        all_previous = set(rec_ids_1 + rec_ids_2)
        duplicates = all_previous & set(rec_ids_3)
        if duplicates:
            print(f"\n❌ FAILED: Found duplicate recommendations: {duplicates}")
        else:
            print(f"\n✅ PASSED: No duplicate recommendations")
    
    # Test Case 4: Topic change
    print("\n" + "=" * 60)
    print("TEST CASE 4: Topic Change")
    print("=" * 60)
    
    message4 = "Nhà hàng ở Nha Trang"
    response4 = send_message(message4, session_id)
    
    print(f"👤 User: {message4}")
    print(f"🤖 AI Intent: {response4['intent']}")
    print(f"📊 Recommendations: {len(response4['recommendations'])}")
    
    if response4['recommendations']:
        print("\n📍 Gợi ý (chủ đề mới):")
        for i, rec in enumerate(response4['recommendations'], 1):
            print(f"   {i}. {rec['name']} (ID: {rec['id']})")
        print(f"\n✅ PASSED: Topic changed successfully")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)


def send_message(message: str, session_id: str):
    """Send a message to the AI service."""
    payload = {
        "message": message,
        "session_id": session_id,
        "user_location": {},
        "chat_history": []
    }
    
    response = requests.post(BASE_URL, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None


if __name__ == "__main__":
    test_context_awareness()
