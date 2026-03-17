package com.bot.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service xử lý các nghiệp vụ liên quan đến gửi Email thông qua JavaMailSender.
 * Hỗ trợ gửi template HTML qua JavaMailSender và MimeMessage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi email với nội dung định dạng HTML.
     */
    public void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        log.info("Sending HTML email to: {}", toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml
            
            mailSender.send(message);
            log.info("HTML email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to build HTML email for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Có lỗi xảy ra khi tạo nội dung HTML email: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Có lỗi xảy ra khi gửi email: " + e.getMessage());
        }
    }

    /**
     * Gửi Email chứa mã OTP chuẩn định dạng HTML (dùng làm fallback khi queue lỗi).
     * 
     * @param toEmail Địa chỉ hòm thư đích của người nhận.
     * @param otp     Mã xác thực 6 chữ số vừa được sinh tự động.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "[Chatbot Ẩm Thực & Du Lịch] Mã OTP xác thực của bạn";
        String htmlBody = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                    <div style="text-align: center;">
                        <h2 style="color: #2c3e50;">🔐 Mã xác thực OTP</h2>
                        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Chatbot Ẩm Thực & Du Lịch.</p>
                        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <h1 style="color: #1a75d2; letter-spacing: 8px; font-size: 40px;">%s</h1>
                        </div>
                    </div>
                    <div style="text-align: left; color: #333; line-height: 1.6;">
                        <p>⏱️ Mã có hiệu lực trong <strong>5 phút</strong>.</p>
                        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                        <p style="margin-top: 25px;">
                            Trân trọng,<br/>
                            <strong>Website - Ẩm Thực - Du Lịch - Chatbot.</strong>
                        </p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">Chatbot Ẩm Thực & Du Lịch Việt Nam</p>
                </div>
                """, otp);
        sendHtmlEmail(toEmail, subject, htmlBody);
    }
}
