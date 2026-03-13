package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa dữ liệu yêu cầu gửi mã xác thực (OTP) qua email.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordRequest {
    /**
     * Tài khoản Email gắn liền với tài khoản người dùng cần khôi phục mật khẩu.
     */
    private String email;
}
