package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu gửi lên từ form Đăng ký tài khoản của người dùng.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    /**
     * Tên truy cập mong muốn tạo. Yêu cầu tính duy nhất trong toàn hệ thống.
     */
    private String username;

    /**
     * Địa chỉ Email hợp lệ dùng để liên hệ và khôi phục tài khoản khi cần (Quên mật khẩu).
     */
    private String email;

    /**
     * Chuỗi mật khẩu bảo mật nguyên bản người dùng thiết lập.
     */
    private String password;
}
