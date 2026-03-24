"""
Script test AI Service qua HTTP API
Cần chạy server trước: python run_server.py
Sau đó chạy: python test_server.py
"""

import requests
import json
import time

# Cấu hình
API_BASE_URL = "http://localhost:8000"
CHAT_ENDPOINT = f"{API_BASE_URL}/api/v1/ai/chat"
HEALTH_ENDPOINT = f"{API_BASE_URL}/health"

def test_health_check():
    """Test health check endpoint"""
    print("🏥 TEST HEALTH CHECK")
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=10)  # Tăng timeout lên 10s
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Server đang chạy: {data}")
            return True
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Không thể kết nối server: {e}")
        return False

def test_chat_api():
    """Test chat endpoint với nhiều loại câu hỏi"""
    print("\n💬 TEST CHAT API")
    
    test_cases = [
        {
            "message": "Phở Hà Nội ở đâu ngon?",
            "expected_intent": "tim_mon_an"
        },
        {
            "message": "bánh xèo ngon ở đâu?",
            "expected_intent": "tim_mon_an"
        },
        {
            "message": "Đà Lạt có gì chơi?",
            "expected_intent": "tim_dia_diem"
        },
        {
            "message": "Gần đây có quán nào không?",
            "expected_intent": "hoi_vi_tri"
        },
        {
            "message": "Xin chào",
            "expected_intent": "chao_hoi"
        }
    ]
    
    success_count = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test {i}: '{test_case['message']}'")
        
        try:
            payload = {
                "message": test_case["message"],
                "session_id": f"test_session_{i}"
            }
            
            response = requests.post(
                CHAT_ENDPOINT, 
                json=payload, 
                timeout=30,  # Tăng timeout lên 30s vì AI cần thời gian xử lý
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"      → Intent: {data['intent']} (confidence: {data['confidence']:.3f})")
                print(f"      → Recommendations: {len(data['recommendations'])} items")
                
                if data['recommendations']:
                    for j, rec in enumerate(data['recommendations'][:2], 1):
                        print(f"         {j}. {rec['name']} ({rec['location']})")
                
                if data['intent'] == test_case['expected_intent']:
                    print(f"      ✅ Intent đúng")
                    success_count += 1
                else:
                    print(f"      ❌ Intent sai (expected: {test_case['expected_intent']})")
                    
            else:
                print(f"      ❌ API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"      ❌ Request failed: {e}")
    
    print(f"\n   📊 Kết quả: {success_count}/{len(test_cases)} test thành công")
    return success_count == len(test_cases)

def main():
    """Chạy tất cả test API"""
    print("🚀 BẮT ĐẦU TEST AI SERVICE API")
    print("="*50)
    
    # Kiểm tra server có chạy không
    if not test_health_check():
        print("\n❌ Server không chạy. Hãy chạy lệnh:")
        print("   python run_server.py")
        return
    
    # Chờ server khởi động hoàn toàn
    print("\n⏳ Chờ server khởi động hoàn toàn...")
    time.sleep(2)
    
    # Chạy test
    success = test_chat_api()
    
    # Tổng kết
    print("\n" + "="*50)
    print("📊 KẾT QUẢ TEST API")
    print("="*50)
    
    if success:
        print("🎉 TẤT CẢ API TEST THÀNH CÔNG!")
        print("🌐 Swagger UI: http://localhost:8000/docs")
    else:
        print("⚠️ CÓ API TEST THẤT BẠI. Kiểm tra lại server.")

if __name__ == "__main__":
    main()