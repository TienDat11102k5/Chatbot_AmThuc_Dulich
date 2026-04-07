import sys
import os
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.main import app

def run_test():
    with TestClient(app) as client:
        # User message
        message = "Tôi vừa tới Đà Lạt, giúp tôi liệt kê 3 địa điểm du lịch, 4 quán phở và vài khách sạn nhé."
        print(f"User: {message}")
        print("-" * 50)
        
        payload = {
            "message": message,
            "session_id": "test_multi_intent_demo"
        }
        
        # Gọi API Chat
        response = client.post("/api/v1/ai/chat", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            is_multi = data.get("is_multi_intent", False)
            out_str = f"Is Multi Intent: {is_multi}\n"
            out_str += "\nResponse Message:\n"
            out_str += data.get("message", "")
            
            out_str += "\n\n" + "=" * 50 + "\n"
            out_str += "Sub-Intent Sections:\n"
            for section in data.get("sub_intent_results", []):
                out_str += f"- Category: {section['category']} | Label: {section['category_label']}\n"
                out_str += f"  Số lượng yêu cầu: {section['quantity_requested']}\n"
                out_str += f"  Kết quả thực tế: {len(section['recommendations'])} items\n"
            
            with open("test_result_output.txt", "w", encoding="utf-8") as f:
                f.write(out_str)
            print("Đã ghi thành công ra test_result_output.txt")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    run_test()
