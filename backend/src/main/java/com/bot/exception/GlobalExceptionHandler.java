package com.bot.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global Exception Handler xử lý tập trung tất cả exception trong ứng dụng.
 * Trả về response chuẩn hóa theo RFC 7807 (Problem Details).
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi xác thực (sai mật khẩu, tài khoản không tồn tại).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "AUTH_INVALID_CREDENTIALS",
                "Tên đăng nhập hoặc mật khẩu không đúng."
        );
    }

    /**
     * Xử lý các RuntimeException nghiệp vụ (user đã tồn tại, OTP hết hạn, ...).
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime error: {}", ex.getMessage());
        HttpStatus status = determineStatus(ex.getMessage());
        return buildErrorResponse(status, "BUSINESS_ERROR", ex.getMessage());
    }

    /**
     * Xử lý tất cả exception không mong đợi.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
        );
    }

    /**
     * Xây dựng response body chuẩn RFC 7807.
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String errorCode, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("errorCode", errorCode);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    /**
     * Xác định HTTP Status phù hợp dựa trên nội dung thông báo lỗi.
     */
    private HttpStatus determineStatus(String message) {
        if (message == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        if (message.contains("đã tồn tại") || message.contains("đã được sử dụng")) {
            return HttpStatus.CONFLICT;
        }
        if (message.contains("không tìm thấy") || message.contains("không tồn tại")) {
            return HttpStatus.NOT_FOUND;
        }
        if (message.contains("không hợp lệ") || message.contains("hết hạn")) {
            return HttpStatus.BAD_REQUEST;
        }
        if (message.contains("Google") || message.contains("xác thực")) {
            return HttpStatus.UNAUTHORIZED;
        }
        return HttpStatus.BAD_REQUEST;
    }
}
