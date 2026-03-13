package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể đại diện cho người dùng trong hệ thống (khách hàng hoặc quản trị viên).
 * Lưu trữ thông tin đăng nhập, vai trò và các tùy chọn cá nhân hóa.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Tên đăng nhập của người dùng. Thuộc tính này là duy nhất (unique) và không được để trống.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * Chuỗi mật khẩu đã được mã hóa (bằng hệ mã như Bcrypt hoặc Argon2), đảm bảo an toàn lưu trữ.
     */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Địa chỉ Email dùng để liên hệ, xác thực, lấy lại mật khẩu và nhận thông báo.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Vai trò phân quyền trong hệ thống, quyết định quyền truy cập API (ví dụ: "ADMIN", "USER").
     */
    @Column(nullable = false)
    private String role; // "ADMIN" or "USER"

    /**
     * Dữ liệu JSON lưu trữ các tùy chọn, sở thích cá nhân (ví dụ: món ăn yêu thích, lịch sử tìm kiếm).
     * Được map dưới dạng kiểu jsonb tiết kiệm hiệu năng trên DB.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String preferences;

    /**
     * Dấu thời gian hệ thống ghi nhận lúc tài khoản được khởi tạo lần đầu tiên.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

