package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu gửi lên từ form Đăng nhập của người dùng.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    /**
     * Email người dùng gửi lên.
     */
    private String email;

    /**
     * Mật khẩu dạng thuần (thô) người dùng nhập từ bàn phím.
     */
    private String password;
}
