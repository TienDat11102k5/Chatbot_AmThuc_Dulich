package com.bot.controller.user.dto;

import com.bot.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin hồ sơ người dùng (không chứa passwordHash).
 * Dùng cho endpoint: GET /api/v1/users/me và GET /api/v1/users/{id}
 */
@Data
public class UserProfileResponse {

    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String preferences;
    private LocalDateTime createdAt;

    /**
     * Factory method: Chuyển đổi từ User entity sang DTO an toàn
     * (loại bỏ trường passwordHash khỏi response).
     *
     * @param user User entity từ database
     * @return UserProfileResponse DTO
     */
    public static UserProfileResponse from(User user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRole(user.getRole());
        dto.setPreferences(user.getPreferences());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
