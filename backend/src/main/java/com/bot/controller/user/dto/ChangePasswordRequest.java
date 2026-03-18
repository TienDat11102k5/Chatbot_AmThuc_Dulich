package com.bot.controller.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO nhận dữ liệu đổi mật khẩu của người dùng.
 * Dùng cho endpoint: PUT /api/v1/users/{id}/password
 */
@Data
public class ChangePasswordRequest {

    /** Mật khẩu hiện tại để xác minh danh tính */
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String currentPassword;

    /** Mật khẩu mới, tối thiểu 8 ký tự */
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
    private String newPassword;

    /** Xác nhận mật khẩu mới (phải trùng với newPassword) */
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
}
