package com.bot.service.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service xử lý các nghiệp vụ liên quan đến gửi Email thông qua JavaMailSender.
 * Kết nối SMTP được cấu hình bên trong application.properties.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi Email chứa mã OTP chuẩn định dạng bản văn để người dùng thực hiện quy trình đặt lại mật khẩu.
     * Hàm sẽ xây dựng nội dung Thư cơ bản (SimpleMailMessage) và thực thi lệnh qua máy chủ hệ thống SMTP.
     * 
     * @param toEmail Địa chỉ hòm thư đích của người nhận (User).
     * @param otp     Mã xác thực 6 chữ số vừa được sinh tự động.
     * @throws RuntimeException Nếu có lỗi kết nối mạng nội bộ hoặc cấu hình Credentials SMTP không chuẩn.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        log.info("Sending OTP email to: {}", toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã Xác Thực (OTP) Đặt Lại Mật Khẩu - Chatbot Du Lịch Ẩm Thực");
            message.setText("Xin chào,\n\n" +
                    "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP gồm 6 chữ số dưới đây để tiếp tục:\n\n" +
                    "Mã OTP của bạn là: " + otp + "\n\n" +
                    "Lưu ý: Mã OTP này sẽ hết hạn trong vòng 5 phút.\n" +
                    "Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ hỗ trợ Chatbot");
            
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Có lỗi xảy ra khi gửi email: " + e.getMessage());
        }
    }
}
