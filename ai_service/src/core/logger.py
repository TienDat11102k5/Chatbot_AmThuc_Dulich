"""
File: src/core/logger.py
Mục đích: Setup Python logging tiêu chuẩn thay cho các lệnh print rải rác.
"""

import logging
import sys

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        # Ngăn chặn log bị nhân bản nếu setup nhiều lần
        logger.propagate = False
        
    return logger

# Re-usable global logger
logger = setup_logger("AIService")
