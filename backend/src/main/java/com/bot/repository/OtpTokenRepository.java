package com.bot.repository;

import com.bot.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository xử lý các thao tác truy vấn Database cho Entity OtpToken.
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    // Tìm kiếm một mã OTP dựa trên Email và Nội dung mã OTP do người dùng nhập vào
    Optional<OtpToken> findByEmailAndOtp(String email, String otp);
    
    // Xóa tất cả các mã OTP đã quá hạn (thường chạy bằng Scheduled Job để dọn rác DB)
    void deleteByExpiryDateBefore(LocalDateTime expiryDate);
    
    // Xóa tất cả các mã OTP cũ của một Email khi người dùng yêu cầu mã mới
    void deleteByEmail(String email);
}
