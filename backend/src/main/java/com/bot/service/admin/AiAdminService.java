package com.bot.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.bot.repository.ChatSessionRepository;

import java.util.Map;

/**
 * Service chứa business logic cho trang quản trị AI.
 *
 * Hai nguồn dữ liệu:
 * 1. AI Service (FastAPI) — proxy qua RestTemplate cho stats + intents
 * 2. PostgreSQL — query trực tiếp cho danh sách users đã chat AI
 *
 * Graceful Degradation: Nếu AI Service sập → trả fallback response,
 * KHÔNG crash toàn bộ backend.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiAdminService {

    private final RestTemplate restTemplate;
    private final ChatSessionRepository chatSessionRepository;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    /**
     * Lấy thống kê AI Service (số intents, mẫu câu, cache stats).
     * Proxy request sang GET /api/v1/ai/admin/stats của AI Service.
     *
     * @return Map chứa JSON response từ AI Service, hoặc fallback nếu lỗi
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getAiStats() {
        try {
            String url = aiServiceUrl + "/api/v1/ai/admin/stats";
            log.info("[AiAdmin] Đang gọi AI Service: GET {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? response : getStatsFallback("Không nhận được phản hồi");
        } catch (Exception e) {
            log.warn("[AiAdmin] AI Service không khả dụng (stats): {}", e.getMessage());
            return getStatsFallback(e.getMessage());
        }
    }

    /**
     * Lấy danh sách intents + mẫu câu từ AI Service.
     * Proxy request sang GET /api/v1/ai/admin/intents.
     *
     * @return Map chứa JSON response, hoặc fallback nếu lỗi
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getIntents() {
        try {
            String url = aiServiceUrl + "/api/v1/ai/admin/intents";
            log.info("[AiAdmin] Đang gọi AI Service: GET {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? response : getIntentsFallback("Không nhận được phản hồi");
        } catch (Exception e) {
            log.warn("[AiAdmin] AI Service không khả dụng (intents): {}", e.getMessage());
            return getIntentsFallback(e.getMessage());
        }
    }

    /**
     * Lấy danh sách users đã tương tác với AI chatbot.
     * Query trực tiếp DB: JOIN chat_sessions + users + messages.
     *
     * @param pageable Phân trang (page, size)
     * @return Page chứa Object[] với thông tin user + tổng số sessions/messages
     */
    public Page<Object[]> getAiUsers(Pageable pageable) {
        return chatSessionRepository.findAiUserSummaries(pageable);
    }

    /**
     * Fallback response khi AI Service không phản hồi.
     * Trả dữ liệu mặc định thay vì crash.
     */
    private Map<String, Object> getStatsFallback(String errorMsg) {
        return Map.of(
                "total_intents", 0,
                "total_samples", 0,
                "intent_breakdown", Map.of(),
                "cache_hit_count", 0,
                "cache_miss_count", 0,
                "cache_hit_rate", 0.0,
                "error", "AI Service không phản hồi: " + errorMsg
        );
    }

    private Map<String, Object> getIntentsFallback(String errorMsg) {
        return Map.of(
                "total_intents", 0,
                "total_samples", 0,
                "intents", java.util.List.of(),
                "error", "AI Service không phản hồi: " + errorMsg
        );
    }
}
