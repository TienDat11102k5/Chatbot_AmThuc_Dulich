package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa dữ liệu yêu cầu xác nhận đổi mật khẩu dựa trên mã OTP.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    /**
     * Địa chỉ Email đang sở hữu tài khoản cần thiết lập lại mật khẩu.
     */
    private String email;
    
    /**
     * Trình tự 6 chữ số ngẫu nhiên do hệ thống đã gửi vào Email để dùng định danh phiên xác thực OTP hiện hành.
     */
    private String otp;
    
    /**
     * Chuỗi Mật khẩu hoàn toàn mới mà người dùng nhập từ Client để thiết lập cho tài khoản.
     */
    private String newPassword;
}
