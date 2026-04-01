"""
File: src/api/admin_router.py
Mục đích: Router chứa các endpoint ADMIN cho AI Service.
           Tách riêng khỏi router.py (chat endpoint) theo nguyên tắc Single Responsibility.
           
           Cung cấp 2 endpoint GET cho trang admin:
           1. GET /api/v1/ai/admin/stats  — Thống kê tổng quan AI
           2. GET /api/v1/ai/admin/intents — Danh sách intents + mẫu câu

Lưu ý: Các endpoint này được Backend (Spring Boot) gọi qua RestTemplate,
        KHÔNG phải Frontend gọi trực tiếp. Backend sẽ kiểm tra quyền ADMIN trước.
"""

import csv
import os
from collections import defaultdict
from fastapi import APIRouter, Request

from src.api.schemas import AiStatsResponse, IntentItem, IntentListResponse

# Khởi tạo router với prefix và tags cho Swagger UI
admin_router = APIRouter(
    prefix="/api/v1/ai/admin",
    tags=["Admin AI"]
)

# Đường dẫn tới file CSV chứa dữ liệu huấn luyện
# Khi chạy từ thư mục gốc ai_service: python -m uvicorn src.main:app
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "intent_dataset.csv")


def _parse_intent_dataset():
    """
    Đọc và phân tích file intent_dataset.csv.
    
    Trả về:
        dict: { "intent_tag": ["câu mẫu 1", "câu mẫu 2", ...] }
    
    Ví dụ:
        {
            "tim_mon_an": ["Phở ngon ở đâu", "Bún bò Huế chỗ nào", ...],
            "tim_dia_diem": ["Đà Lạt có gì chơi", ...],
            "hoi_thoi_tiet": ["Thời tiết Hà Nội", ...]
        }
    """
    intent_data = defaultdict(list)
    
    resolved_path = os.path.abspath(DATASET_PATH)
    if not os.path.exists(resolved_path):
        print(f"[Admin] ⚠️ Không tìm thấy dataset tại: {resolved_path}")
        return intent_data
    
    with open(resolved_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row.get("text", "").strip()
            intent = row.get("intent", "").strip()
            if text and intent:
                intent_data[intent].append(text)
    
    return intent_data


@admin_router.get(
    "/stats",
    response_model=AiStatsResponse,
    summary="Thống kê tổng quan AI Service",
    description="Trả về số lượng intents, mẫu câu, và thống kê cache Redis."
)
async def get_ai_stats(request: Request):
    """
    Endpoint thống kê AI cho trang Giám sát AI (admin).
    
    Luồng xử lý:
    1. Đọc CSV → đếm số intents và mẫu câu
    2. Lấy cache stats từ SemanticCache (hit/miss count)
    3. Tính tỉ lệ cache hit rate
    """
    # Bước 1: Parse dataset
    intent_data = _parse_intent_dataset()
    
    total_intents = len(intent_data)
    total_samples = sum(len(samples) for samples in intent_data.values())
    intent_breakdown = {tag: len(samples) for tag, samples in intent_data.items()}
    
    # Bước 2: Lấy cache stats từ app.state
    cache = request.app.state.cache
    hit_count = cache.hit_count
    miss_count = cache.miss_count
    total_cache = hit_count + miss_count
    hit_rate = round((hit_count / total_cache * 100), 1) if total_cache > 0 else 0.0
    
    return AiStatsResponse(
        total_intents=total_intents,
        total_samples=total_samples,
        intent_breakdown=intent_breakdown,
        cache_hit_count=hit_count,
        cache_miss_count=miss_count,
        cache_hit_rate=hit_rate
    )


@admin_router.get(
    "/intents",
    response_model=IntentListResponse,
    summary="Danh sách intents + mẫu câu huấn luyện",
    description="Parse CSV dataset, group theo intent, trả tối đa 5 câu mẫu mỗi intent."
)
async def get_intents():
    """
    Endpoint lấy danh sách intents cho trang Dữ liệu Huấn luyện (admin).
    
    Mỗi intent trả về:
    - tag: tên intent
    - sample_count: số mẫu câu
    - examples: tối đa 5 câu đại diện
    """
    intent_data = _parse_intent_dataset()
    
    intents = []
    total_samples = 0
    
    for tag, samples in sorted(intent_data.items()):
        sample_count = len(samples)
        total_samples += sample_count
        intents.append(IntentItem(
            tag=tag,
            sample_count=sample_count,
            examples=samples[:5]  # Chỉ trả 5 câu mẫu đại diện
        ))
    
    return IntentListResponse(
        total_intents=len(intents),
        total_samples=total_samples,
        intents=intents
    )

@admin_router.get(
    "/oos-logs",
    summary="Danh sách câu hỏi Out of Scope",
    description="Truy xuất dữ liệu câu hỏi mà người dùng gọi bị Bot reject (Out of Scope)."
)
async def get_oos_logs(limit: int = 50):
    """
    Đọc từ file data/oos_rejected.jsonl và trả về top N dòng mới nhất.
    """
    import json
    
    log_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "oos_rejected.jsonl")
    resolved_path = os.path.abspath(log_path)
    
    if not os.path.exists(resolved_path):
        return {"total": 0, "logs": []}
    
    logs = []
    try:
        with open(resolved_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    logs.append(json.loads(line.strip()))
    except Exception as e:
        print(f"[Admin] ⚠️ Không đọc được oos logs: {e}")
        return {"total": 0, "logs": []}
    
    # Lấy N record mới nhất (đảo ngược mảng)
    logs.reverse()
    return {
        "total": len(logs),
        "logs": logs[:limit]
    }
