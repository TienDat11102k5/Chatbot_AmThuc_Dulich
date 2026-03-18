package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO đại diện cho dữ liệu trả về sau khi người dùng Đăng ký hoặc Đăng nhập thành công.
 * Bao gồm chuỗi Token JWT để truy cập các API bị bảo mật.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    /**
     * Chuỗi mã thông báo bảo mật JWT cấp quyền truy cập các đường dẫn API nội bộ.
     */
    private String token;

    /**
     * Mã định danh duy nhất (UUID) của người dùng. Frontend cần field này
     * để gọi các API như chat sessions, favorites, user profile.
     */
    private UUID userId;

    /**
     * Tên đăng nhập gốc của tài khoản vừa thao tác.
     */
    private String username;

    /**
     * Địa chỉ hòm thư liên lạc của người dùng.
     */
    private String email;

    /**
     * Vai trò phân quyền trên hệ thống (Ví dụ: USER, ADMIN).
     */
    private String role;

    /**
     * Tên đầy đủ (họ và tên) của người dùng, dùng để hiển thị trên Navbar và Profile.
     */
    private String fullName;

    /**
     * Đường dẫn URL ảnh đại diện (avatar) của người dùng.
     */
    private String avatarUrl;
}
