package com.bot.controller.auth;

import com.bot.controller.auth.dto.AuthResponse;
import com.bot.controller.auth.dto.ForgotPasswordRequest;
import com.bot.controller.auth.dto.LoginRequest;
import com.bot.controller.auth.dto.RegisterRequest;
import com.bot.controller.auth.dto.ResetPasswordRequest;
import com.bot.controller.auth.dto.GoogleLoginRequest;
import com.bot.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller đảm nhận các API liên quan đến Xác thực người dùng:
 * Đăng ký, Đăng nhập, Đăng nhập Google, Quên mật khẩu.
 * Exception được xử lý tập trung tại GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * API Đăng ký tài khoản mới.
     * @param request DTO gồm username, email, password.
     * @return AuthResponse chứa JWT token và thông tin người dùng.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * API Đăng nhập bằng username/password.
     * @param request DTO gồm username và password.
     * @return AuthResponse chứa JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * API Đăng nhập bằng tài khoản Google.
     * @param request DTO chứa Google ID Token.
     * @return AuthResponse chứa JWT token nội bộ.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request.getIdToken()));
    }

    /**
     * API Quên mật khẩu - Gửi mã OTP qua email.
     * @param request DTO chứa email.
     * @return Thông báo kết quả.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
    }

    /**
     * API Đặt lại mật khẩu mới bằng OTP.
     * @param request DTO chứa email, OTP và mật khẩu mới.
     * @return Thông báo kết quả.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
    }
}
