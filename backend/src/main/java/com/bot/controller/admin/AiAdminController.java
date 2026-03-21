package com.bot.controller.admin;

import com.bot.service.admin.AiAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller xử lý API quản trị AI cho trang Admin.
 *
 * Prefix: /api/v1/admin/ai
 * Tự động bảo vệ bởi SecurityConfig: .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
 *
 * 3 endpoints:
 * - GET /stats   → Proxy thống kê từ AI Service
 * - GET /intents → Proxy danh sách intents từ AI Service
 * - GET /users   → Query DB lấy danh sách users đã chat AI
 */
@RestController
@RequestMapping("/api/v1/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiAdminService aiAdminService;

    /**
     * Lấy thống kê tổng quan AI Service.
     * Proxy request sang AI Service FastAPI.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAiStats() {
        Map<String, Object> stats = aiAdminService.getAiStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy danh sách intents + mẫu câu huấn luyện.
     * Proxy request sang AI Service FastAPI.
     */
    @GetMapping("/intents")
    public ResponseEntity<Map<String, Object>> getIntents() {
        Map<String, Object> intents = aiAdminService.getIntents();
        return ResponseEntity.ok(intents);
    }

    /**
     * Lấy danh sách users đã tương tác với AI chatbot.
     * Query trực tiếp PostgreSQL: JOIN chat_sessions + users + messages.
     *
     * @param page Trang hiện tại (bắt đầu từ 0)
     * @param size Số lượng users mỗi trang
     * @return Danh sách users + thông tin phân trang
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAiUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> result = aiAdminService.getAiUsers(pageable);

        // Chuyển đổi Object[] thành Map dễ đọc cho Frontend
        List<Map<String, Object>> users = new ArrayList<>();
        for (Object[] row : result.getContent()) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("userId", row[0] != null ? row[0].toString() : null);
            userMap.put("fullName", row[1]);
            userMap.put("email", row[2]);
            userMap.put("avatarUrl", row[3]);
            userMap.put("status", row[4]);
            userMap.put("totalSessions", row[5]);
            userMap.put("totalMessages", row[6]);
            userMap.put("lastSessionAt", row[7] != null ? row[7].toString() : null);
            users.add(userMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("users", users);
        response.put("currentPage", result.getNumber());
        response.put("totalPages", result.getTotalPages());
        response.put("totalElements", result.getTotalElements());

        return ResponseEntity.ok(response);
    }
}
