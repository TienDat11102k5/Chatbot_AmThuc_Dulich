package com.bot.controller.user;

import com.bot.controller.user.dto.ChangePasswordRequest;
import com.bot.controller.user.dto.ProfileUpdateRequest;
import com.bot.controller.user.dto.UserProfileResponse;
import com.bot.entity.User;
import com.bot.service.user.FileStorageService;
import com.bot.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller cung cấp các API quản lý Hồ sơ Người dùng:
 * - Xem thông tin cá nhân
 * - Cập nhật hồ sơ
 * - Đổi mật khẩu
 * - Upload ảnh đại diện (Avatar)
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    /**
     * Lấy thông tin user đang đăng nhập hiện tại.
     * Dùng JWT principal từ SecurityContextHolder.
     *
     * GET /api/v1/users/me
     * @return UserProfileResponse DTO (không chứa passwordHash)
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return userService.getCurrentUser()
                .map(user -> ResponseEntity.ok(UserProfileResponse.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy thông tin user theo ID (UUID).
     *
     * GET /api/v1/users/{id}
     * @param id UUID của người dùng
     * @return UserProfileResponse DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable UUID id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(UserProfileResponse.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật thông tin hồ sơ cá nhân (fullName, username, email).
     *
     * PUT /api/v1/users/{id}/profile
     * @param id  UUID của user cần cập nhật
     * @param req DTO chứa thông tin cần cập nhật
     * @return UserProfileResponse đã cập nhật
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable UUID id,
            @RequestBody ProfileUpdateRequest req) {
        try {
            User updated = userService.updateProfile(id, req);
            return ResponseEntity.ok(UserProfileResponse.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Đổi mật khẩu người dùng.
     * Yêu cầu xác minh mật khẩu cũ.
     *
     * PUT /api/v1/users/{id}/password
     * @param id  UUID của user
     * @param req DTO chứa currentPassword, newPassword, confirmPassword
     * @return 200 nếu thành công, 400 nếu sai mật khẩu cũ
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable UUID id,
            @RequestBody ChangePasswordRequest req) {
        try {
            userService.changePassword(id, req);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Upload ảnh đại diện (Avatar) của người dùng.
     * Nhận file multipart, lưu vào resources/db/uploads/, cập nhật avatarUrl trong DB.
     *
     * POST /api/v1/users/{id}/avatar
     * @param id   UUID của user
     * @param file File ảnh từ client (multipart/form-data)
     * @return UserProfileResponse đã cập nhật với avatarUrl mới
     */
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Xóa avatar cũ nếu có
            userService.findById(id).ifPresent(user -> {
                if (user.getAvatarUrl() != null) {
                    fileStorageService.deleteAvatar(user.getAvatarUrl());
                }
            });

            // Lưu file mới và lấy URL
            String avatarUrl = fileStorageService.saveAvatar(file);

            // Cập nhật avatar URL vào DB
            User updated = userService.updateAvatarUrl(id, avatarUrl);
            return ResponseEntity.ok(UserProfileResponse.from(updated));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Lỗi khi lưu ảnh: " + e.getMessage()));
        }
    }

    /**
     * Xóa ảnh đại diện (Avatar) của người dùng.
     *
     * @param id UUID của user
     * @return UserProfileResponse đã cập nhật (avatarUrl = null)
     */
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable UUID id) {
        try {
            userService.findById(id).ifPresent(user -> {
                if (user.getAvatarUrl() != null) {
                    fileStorageService.deleteAvatar(user.getAvatarUrl());
                }
            });
            User updated = userService.removeAvatar(id);
            return ResponseEntity.ok(UserProfileResponse.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Cập nhật sở thích (preferences) của người dùng.
     *
     * PUT /api/v1/users/{id}/preferences
     * @param id              UUID của user
     * @param preferencesJson Chuỗi JSON linh hoạt
     * @return UserProfileResponse đã cập nhật
     */
    @PutMapping("/{id}/preferences")
    public ResponseEntity<?> updatePreferences(
            @PathVariable UUID id,
            @RequestBody String preferencesJson) {
        try {
            User updated = userService.updatePreferences(id, preferencesJson);
            return ResponseEntity.ok(UserProfileResponse.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Tạo người dùng mới - CHỈ DÀNH CHO ADMIN.
     *
     * POST /api/v1/users
     * @param user User object đầy đủ
     * @return User mới được tạo
     */
    @PostMapping
    public ResponseEntity<UserProfileResponse> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.ok(UserProfileResponse.from(created));
    }
}
