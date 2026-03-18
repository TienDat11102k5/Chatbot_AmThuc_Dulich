package com.bot.controller.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO nhận dữ liệu cập nhật thông tin hồ sơ cá nhân.
 * Dùng cho endpoint: PUT /api/v1/users/{id}/profile
 */
@Data
public class ProfileUpdateRequest {

    /** Tên đầy đủ (họ và tên), tối đa 100 ký tự */
    @Size(max = 100, message = "Tên đầy đủ không được vượt quá 100 ký tự")
    private String fullName;

    /** Tên đăng nhập mới, tối thiểu 3 ký tự */
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    /** Địa chỉ email mới */
    @Email(message = "Email không hợp lệ")
    private String email;

}
