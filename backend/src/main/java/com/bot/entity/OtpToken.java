package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity lưu trữ mã xác thực OTP dùng cho việc đặt lại mật khẩu.
 * Chứa thông tin email người dùng, mã OTP 6 số, và thời gian hết hạn (thường là 5 phút).
 */
@Entity
@Table(name = "otp_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Địa chỉ Email đang sở hữu mã OTP dùng để xác thực.
     */
    @Column(nullable = false)
    private String email;

    /**
     * Chuỗi ký tự biểu diễn mã OTP (gồm 6 chữ số ngẫu nhiên).
     */
    @Column(nullable = false, length = 6)
    private String otp;

    /**
     * Dấu thời gian xác định mốc hết hạn của chuỗi OTP. Sau mốc này mã sẽ trở nên vô lực.
     */
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /**
     * Thời điểm hệ thống bắt đầu khởi tạo ra hàng dữ liệu mã OTP này.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
