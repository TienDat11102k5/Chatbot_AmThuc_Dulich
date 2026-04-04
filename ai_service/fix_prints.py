import os

filepath = r'e:\tri_tue_nhan_tao\website-chatbot-amthuc-dulich\Chatbot_AmThuc_Dulich\ai_service\src\core\recommender_postgres.py'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('print(', 'logger.info(')
text = text.replace('logger.info(\'[Recommender] ⚠️', 'logger.warning(\'[Recommender] ⚠️')
text = text.replace('logger.info(\"[Recommender] ⚠️', 'logger.warning(\"[Recommender] ⚠️')
text = text.replace('logger.info(\'[Recommender] ❌', 'logger.error(\'[Recommender] ❌')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("Done!")
