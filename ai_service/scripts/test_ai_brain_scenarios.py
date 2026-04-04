import requests
import json
import time
import sys
import codecs

# Override stdout with utf-8 writer to avoid console cp1258 crashing
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
log_file = open("brain_test_output.md", "w", encoding="utf-8")

def slog(msg):
    print(msg)
    log_file.write(msg + "\n")
    log_file.flush()

URL = "http://localhost:8000/api/v1/ai/chat"
SESSION_ID = "test_ai_brain_e2e"

def ask_chatbot(question):
    slog(f"\n**[❓ CÂU HỎI]:** *{question}*")
    payload = {"message": question, "session_id": SESSION_ID}
    try:
        start_time = time.time()
        response = requests.post(URL, json=payload, timeout=10)
        
        if response.status_code != 200:
            slog(f"*[❌ LỖI API]: HTTP {response.status_code} - {response.text}*")
            return
            
        data = response.json()
        reply = data.get("message", "Không có tin nhắn trả về")
        intent = data.get("intent", "[]")
        entities = data.get("entities", {})
        
        slog(f"**[🤖 TRẢ LỜI]** ({time.time() - start_time:.2f}s):\n> {reply}")
        slog(f"- **Intent**: `{intent}`")
        slog(f"- **Entities**: `{entities}`")
    except requests.exceptions.RequestException as e:
        slog(f"*[❌ LỖI MẠNG/SERVER]: {e}*")
    except Exception as e:
        slog(f"*[❌ LỖI KHÁC]: {e}*")

locations = ["Vũng Tàu", "Hà Nội", "Hồ Chí Minh", "Đà Lạt", "Nha Trang"]
foods = ["phở", "cơm", "bánh mì", "hủ tiếu", "bún riêu", "bánh canh"]
drinks = ["cafe", "trà sữa", "sinh tố", "nước ép"]

slog("="*80)
slog(" 🚀 BẮT ĐẦU KIỂM TRA BỘ NÃO AI (E2E SCENARIOS)")
slog("="*80)

slog("\n" + "="*40 + "\n--- 1. HỎI VỀ ĐỒ ĂN CÁC TỈNH/THÀNH ---\n" + "="*40)
for loc in locations:
    for food in foods:
        ask_chatbot(f"ở {loc} có quán nào bán {food} ngon không?")

slog("\n" + "="*40 + "\n--- 2. HỎI VỀ QUÁN NƯỚC ---\n" + "="*40)
for loc in locations:
    for drink in drinks:
        ask_chatbot(f"tìm giúp mình quán {drink} ở {loc} với")

slog("\n" + "="*40 + "\n--- 3. HỎI VỀ ĐỊA ĐIỂM DU LỊCH ---\n" + "="*40)
for loc in locations:
    ask_chatbot(f"địa điểm du lịch nào thú vị ở {loc} vậy?")

slog("\n" + "="*40 + "\n--- 4. HỎI VỀ KHÁCH SẠN ---\n" + "="*40)
for loc in locations:
    ask_chatbot(f"mình muốn tìm khách sạn hoặc nhà nghỉ ở {loc} để lưu trú")

slog("\n" + "="*40 + "\n--- 5. CÂU HỎI NHIỀU Ý (MULTI-INTENT/COMPLEX) ---\n" + "="*40)
multi_intent_questions = [
    "tìm quán cafe và khách sạn ở Đà Lạt",
    "ở Vũng Tàu có món hải sản nào ngon, và tiện thể giới thiệu nhà nghỉ rẻ luôn nhé",
    "gợi ý mình chỗ vui chơi và chỗ ăn phở ở Hà Nội",
    "mình đi Hồ Chí Minh muốn ăn bún riêu và chụp ảnh đẹp ở trung tâm",
    "cần tìm khách sạn nha trang, có quán nước ép hay trà sữa nào gần đó không?"
]

for q in multi_intent_questions:
    ask_chatbot(q)

slog("\n" + "="*80)
slog(" ✅ HOÀN TẤT BÀI KIỂM TRA (Tất cả Output đã in ra màn hình)")
slog("="*80)
log_file.close()
