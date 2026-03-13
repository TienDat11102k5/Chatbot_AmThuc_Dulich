package com.bot.controller.auth;

import com.bot.controller.auth.dto.AuthResponse;
import com.bot.controller.auth.dto.ForgotPasswordRequest;
import com.bot.controller.auth.dto.LoginRequest;
import com.bot.controller.auth.dto.RegisterRequest;
import com.bot.controller.auth.dto.ResetPasswordRequest;
import com.bot.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller đảm nhận các API liên quan đến Xác thực người dùng: 
 * Đăng ký, Đăng nhập, Quên mật khẩu.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * API Đăng ký tài khoản người dùng mới vào hệ thống.
     * Cung cấp thông tin qua một DTO và trả về Token truy cập nếu thành công.
     *
     * @param request Data Transfer Object bao gồm cấu trúc Tên truy cập, Mật khẩu, và Email.
     * @return 1 JSON đóng gói bên trong ResponseEntity mô tả AuthResponse (Bao gồm UUID, Token JWT...). Trả về lỗi 500 nếu có biến cố.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * API Đăng nhập.
     * Trả về JWT token dùng để chèn vào Authorization Header (Bearer) cho chuỗi các session truy cập API cấp cao kế tiếp.
     *
     * @param request DTO bao gồm `username` và `password` thô do người dùng cung cấp.
     * @return Đối tượng AuthResponse đóng gói chứa thông tin Token, quyền người dùng và 1 số thông tin cơ bản. Lỗi 401 nếu xác thực thất bại.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Luồng API cung cấp tính năng cấp lại thông tin đăng nhập. 
     * Hệ thống gửi một thư chứa khối mã OTP tới email định trước.
     *
     * @param request Cấu trúc JSON chứa mỗi thuộc tính "email" của Client đang yêu cầu. 
     * @return Thông báo String thông báo kết quả qua HTTP Status 200 (Thành công) hoặc 400 (Lỗi validation).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * API Xác thực mã OTP nhận từ email (hoặc thiết bị liên kết) nhằm kích hoạt tiến trình tạo / đổi sang một mật khẩu hoàn toàn mới.
     *
     * @param request Dữ liệu đầu vào đi kèm mã OTP xác nhận, Email truy vấn, và Mật khẩu mới mong muốn đổi sang.
     * @return Thông điệp chuỗi HTTP Response xác nhận đặt lại thành công hay quá trình xác minh OTP dính lỗi (status 400).
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }
}
