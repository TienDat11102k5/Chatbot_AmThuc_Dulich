package com.bot.controller.admin;

import com.bot.controller.admin.dto.AdminStatsResponse;
import com.bot.controller.admin.dto.AdminUserRequest;
import com.bot.controller.admin.dto.AdminUserResponse;
import com.bot.entity.User;
import com.bot.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller cho Admin Dashboard.
 * Prefix: /api/v1/admin
 * Tất cả endpoints yêu cầu role ADMIN (bảo vệ bởi SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Lấy danh sách users có phân trang.
     *
     * GET /api/v1/admin/users?page=0&size=10&search=keyword
     */
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        // Search nếu có keyword
        if (search != null && !search.isBlank()) {
            List<AdminUserResponse> results = adminService.searchUsers(search)
                    .stream()
                    .map(AdminUserResponse::from)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of(
                    "content", results,
                    "totalElements", results.size(),
                    "totalPages", 1,
                    "page", 0
            ));
        }

        // Pagination
        Page<User> usersPage = adminService.getAllUsers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<AdminUserResponse> content = usersPage.getContent()
                .stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "content", content,
                "totalElements", usersPage.getTotalElements(),
                "totalPages", usersPage.getTotalPages(),
                "page", usersPage.getNumber()
        ));
    }

    /**
     * Lấy chi tiết 1 user.
     *
     * GET /api/v1/admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        try {
            User user = adminService.getUserById(id);
            return ResponseEntity.ok(AdminUserResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Admin tạo user mới.
     *
     * POST /api/v1/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminUserRequest request) {
        try {
            User created = adminService.createUser(request);
            return ResponseEntity.ok(AdminUserResponse.from(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Admin cập nhật user.
     *
     * PUT /api/v1/admin/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id,
            @RequestBody AdminUserRequest request) {
        try {
            User updated = adminService.updateUser(id, request);
            return ResponseEntity.ok(AdminUserResponse.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Admin xóa user.
     *
     * DELETE /api/v1/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa user thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Toggle trạng thái user (ACTIVE ↔ INACTIVE).
     *
     * PATCH /api/v1/admin/users/{id}/status
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID id) {
        try {
            User updated = adminService.toggleUserStatus(id);
            return ResponseEntity.ok(AdminUserResponse.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Lấy thống kê tổng quan hệ thống.
     *
     * GET /api/v1/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
