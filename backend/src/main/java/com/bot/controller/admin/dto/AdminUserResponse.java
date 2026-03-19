package com.bot.controller.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin User cho Admin Dashboard.
 * Không bao gồm passwordHash — chỉ hiển thị dữ liệu an toàn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    /**
     * Factory method chuyển đổi từ User entity sang DTO.
     */
    public static AdminUserResponse from(com.bot.entity.User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
