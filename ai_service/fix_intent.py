import os

filepath = r'e:\tri_tue_nhan_tao\website-chatbot-amthuc-dulich\Chatbot_AmThuc_Dulich\ai_service\src\core\intent_classifier.py'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports if not present
if "from src.core.logger import logger" not in text:
    text = text.replace("from src.core.nlp_utils import preprocess_text", "from src.core.nlp_utils import preprocess_text\nfrom src.core.config import settings\nfrom src.core.logger import logger")

# Replace prints with loggers where it matters
text = text.replace('print(f"[INFO]', 'logger.info(f"')
text = text.replace('print(f"[WARNING]', 'logger.warning(f"')

text = text.replace('print(f"[Intent]', 'logger.info(f"[Intent]')
text = text.replace('print(f"   [SAI]', 'logger.info(f"   [SAI]')
text = text.replace('print(f"\\n🚀 ĐỘ CHÍNH XÁC', 'logger.info(f"\\n🚀 ĐỘ CHÍNH XÁC')

text = text.replace('print(f"[💾] Đã gói gọn', 'logger.info(f"[💾] Đã gói gọn')
text = text.replace('print(f"[💾] Đã lưu Vectorizer', 'logger.info(f"[💾] Đã lưu Vectorizer')
text = text.replace('print(f"[📝] Đã in Báo cáo', 'logger.info(f"[📝] Đã in Báo cáo')

# To be safe just replace all remaining basic prints outside training output loop? 
# Actually just leaving training loop print as-is is fine, but lets convert most of them.
for line in text.split('\n'):
    if line.strip().startswith('print('):
        new_line = line.replace('print(', 'logger.info(')
        text = text.replace(line, new_line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("Done intentional!")
