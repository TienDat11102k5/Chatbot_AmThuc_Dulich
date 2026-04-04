from dataclasses import dataclass, field
from typing import Dict
import time

@dataclass
class AIMetrics:
    total_requests: int = 0
    intent_distribution: Dict[str, int] = field(default_factory=dict)
    total_response_time: float = 0.0
    cache_hits: int = 0
    cache_misses: int = 0
    errors: int = 0

    def record_request(self, intent: str, response_time: float, has_error: bool = False):
        self.total_requests += 1
        self.total_response_time += response_time
        
        if has_error:
            self.errors += 1
            
        if intent:
            self.intent_distribution[intent] = self.intent_distribution.get(intent, 0) + 1
            
    def record_cache(self, hit: bool):
        if hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1
            
    def get_summary(self) -> dict:
        avg_time = (self.total_response_time / self.total_requests) if self.total_requests > 0 else 0
        cache_rate = (self.cache_hits / (self.cache_hits + self.cache_misses) * 100) if (self.cache_hits + self.cache_misses) > 0 else 0
        
        return {
            "total_requests": self.total_requests,
            "average_response_time_ms": round(avg_time * 1000, 2),
            "cache_hit_rate_percent": round(cache_rate, 2),
            "cache_stats": {
                "hits": self.cache_hits,
                "misses": self.cache_misses
            },
            "error_rate_percent": round((self.errors / self.total_requests * 100), 2) if self.total_requests > 0 else 0,
            "intents": self.intent_distribution
        }

# Khởi tạo singleton instance để dùng chung trong toàn hệ thống
metrics_store = AIMetrics()
