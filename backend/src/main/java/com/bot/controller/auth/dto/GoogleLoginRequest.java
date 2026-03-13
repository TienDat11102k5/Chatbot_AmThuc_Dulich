package com.bot.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) để nhận thông tin xác thực từ Google Login.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GoogleLoginRequest {

    /**
     * Chuỗi JSON Web Token (JWT) do Google cấp cho client (giao diện người dùng).
     * Token này chứa thông tin xác thực và định danh của người dùng để
     * backend xác minh với máy chủ Google.
     */
    private String idToken;

}
