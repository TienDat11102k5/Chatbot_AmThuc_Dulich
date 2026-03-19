package com.bot.controller.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu khi Admin tạo hoặc cập nhật User.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserRequest {

    private String username;
    private String email;
    private String password;
    private String fullName;
    private String role;     // "ADMIN" or "USER"
    private String status;   // "ACTIVE", "INACTIVE", "BANNED"
}
