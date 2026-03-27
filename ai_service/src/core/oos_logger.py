"""
File: src/core/oos_logger.py
Purpose: Log all out-of-scope queries to JSONL file for analysis and model improvement.
Format: One JSON object per line (JSONL) for easy parsing and streaming.
Output: logs/oos_rejected.jsonl
"""

import json
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Log directory relative to project root (ai_service/)
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
LOG_FILE = os.path.join(LOG_DIR, "oos_rejected.jsonl")


def _ensure_log_dir():
    """Create log directory if it doesn't exist."""
    os.makedirs(LOG_DIR, exist_ok=True)


def log_rejected_query(
    user_message: str,
    predicted_intent: str,
    confidence: float,
    rejection_reason: str
) -> None:
    """
    Append a rejected query record to the JSONL log file.

    Args:
        user_message: The original user input text.
        predicted_intent: The intent predicted by the classifier.
        confidence: The confidence score from the classifier.
        rejection_reason: Why the query was rejected
            ("intent_oos" for direct OOS classification,
             "low_confidence" for below-threshold confidence).
    """
    try:
        _ensure_log_dir()

        record = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "predicted_intent": predicted_intent,
            "confidence": round(confidence, 4),
            "rejection_reason": rejection_reason
        }

        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    except Exception as e:
        # Never let logging failures crash the main pipeline
        logger.warning(f"Failed to write OOS log: {e}")
