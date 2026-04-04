"""
File: src/core/config.py
Mục đích: Tập trung toàn bộ cấu hình (Environment Variables, Constants) vào một nơi, 
          giúp dễ dàng quản lý và thay đổi khi chuyển môi trường.
"""

import os

class Settings:
    # Redis configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))

    # Database configuration
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "chatbot_db")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")

    # AI Model thresholds & configuration
    CONFIDENCE_THRESHOLD: float = 0.4
    CONVERSATION_INTENTS: set = {"chao_hoi", "cam_on", "tam_biet", "hoi_thong_tin"}

    # Environment
    TESTING_MODE: bool = os.getenv("TESTING_MODE", "false").lower() == "true"

settings = Settings()
