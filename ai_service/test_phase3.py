import os
import sys

# Test config
try:
    from src.core.config import settings
    print("✅ [TEST] Config tải thành công! DB_HOST =", settings.DB_HOST)
except Exception as e:
    print("❌ Lỗi tải Config:", e)
    sys.exit(1)

# Test Logger
try:
    from src.core.logger import logger
    logger.info("✅ [TEST] Logger hoạt động chuẩn xác!")
except Exception as e:
    print("❌ Lỗi tạo Logger:", e)
    sys.exit(1)

# Test Recommender CSV Fallback
try:
    # Set wrong password to force fallback
    settings.DB_PASSWORD = "sai_password_de_test_fallback"
    logger.warning("Đã đổi DB_PASSWORD thành sai để test fallback CSV.")
    
    from src.core.recommender_postgres import PosgreSQLRecommender
    rec = PosgreSQLRecommender()
    
    if rec.ready:
        logger.info("✅ [TEST] PosgreSQLRecommender fallback qua CSV thành công!")
    else:
        logger.error("❌ [TEST] Fallback qua CSV thất bại!")
except Exception as e:
    logger.error(f"❌ Khởi tạo Recommender có lỗi: {e}")

# Test Response Generator
try:
    settings.TESTING_MODE = True
    from src.core.response_generator import generate_greeting_response
    
    res1 = generate_greeting_response("chao_hoi")
    res2 = generate_greeting_response("chao_hoi")
    
    assert res1 == res2, "Kết quả sinh ra từ 2 lần gọi phải GIỐNG NHAU khi TESTING_MODE = True"
    logger.info("✅ [TEST] Tính năng TESTING_MODE bypass random.choice thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi Response Generator: {e}")
