package com.bot.service.email;

import com.bot.config.RabbitMQConfig;
import com.bot.dto.EmailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Email Producer — Đẩy yêu cầu gửi email vào RabbitMQ hàng đợi.
 *
 * <p><b>Vai trò:</b> Là cầu nối giữa tầng nghiệp vụ (AuthService) và hệ thống
 * hàng đợi (RabbitMQ). Thay vì gửi email ngay lập tức (đồng bộ, blocking),
 * Producer chỉ đẩy yêu cầu vào queue rồi trả về ngay — Consumer sẽ xử lý sau.</p>
 *
 * <p><b>Lợi ích so với gọi trực tiếp EmailService:</b></p>
 * <ul>
 *   <li>User không phải chờ email gửi xong (SMTP mất 2-5 giây).</li>
 *   <li>Nếu SMTP lỗi tạm thời, hệ thống tự retry thay vì trả lỗi cho user.</li>
 *   <li>Hệ thống có thể xử lý hàng nghìn yêu cầu email mà không quá tải.</li>
 * </ul>
 *
 * <p><b>Graceful Degradation:</b> Nếu RabbitMQ không khả dụng ({@code AmqpException}),
 * method ném ra exception để tầng gọi (AuthService) xử lý fallback —
 * thường là gọi trực tiếp EmailService đồng bộ.</p>
 *
 * @see EmailConsumer
 * @see RabbitMQConfig
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailProducer {

    /**
     * RabbitTemplate — Công cụ chính để gửi message vào RabbitMQ.
     * Được Spring Boot inject vào qua constructor (nhờ @RequiredArgsConstructor).
     */
    private final RabbitTemplate rabbitTemplate;

    /**
     * Đẩy yêu cầu gửi email OTP vào hàng đợi "email.queue".
     *
     * <p>Method này:
     * <ol>
     *   <li>Tạo {@link EmailMessage} DTO chứa thông tin email.</li>
     *   <li>Dùng RabbitTemplate gửi tới "chatbot.exchange" với routing key "email.send".</li>
     *   <li>RabbitMQ tự động route message tới "email.queue".</li>
     *   <li>Trả về ngay lập tức — không chờ Consumer xử lý xong.</li>
     * </ol>
     *
     * @param toEmail Địa chỉ email người nhận OTP.
     * @param otp     Mã OTP 6 số cần gửi.
     * @throws AmqpException Nếu không kết nối được RabbitMQ (để tầng gọi xử lý fallback).
     */
    public void sendEmailRequest(String toEmail, String otp) {
        // Tạo nội dung email OTP
        String subject = "[Chatbot Ẩm Thực & Du Lịch] Mã OTP xác thực của bạn";
        String body = buildOtpEmailBody(otp);

        // Đóng gói thành EmailMessage DTO
        EmailMessage message = EmailMessage.builder()
                .toEmail(toEmail)
                .subject(subject)
                .body(body)
                .retryCount(0)  // Lần đầu gửi, chưa retry lần nào
                .build();

        // Đẩy vào exchange với routing key → RabbitMQ route tới email.queue
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.CHATBOT_EXCHANGE,  // Exchange nhận message
                RabbitMQConfig.EMAIL_ROUTING_KEY, // Routing key để route đúng queue
                message                           // DTO sẽ tự động serialize thành JSON
        );

        log.info("[EmailProducer] Đã đẩy yêu cầu gửi OTP vào queue cho: {}", toEmail);
    }

    /**
     * Đẩy lại EmailMessage đã có vào queue (dùng khi retry thất bại).
     *
     * <p>Khác với {@link #sendEmailRequest}, method này giữ nguyên toàn bộ
     * EmailMessage object (bao gồm retryCount đã tăng) thay vì tạo mới.</p>
     *
     * @param message EmailMessage cũ cần gửi lại (retryCount đã +1 bởi Consumer).
     */
    public void retryEmailRequest(EmailMessage message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.CHATBOT_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                message
        );

        log.info("[EmailProducer] Đẩy lại email lần thứ {} cho: {}",
                message.getRetryCount(), message.getToEmail());
    }

    /**
     * Tạo nội dung HTML cho email OTP.
     *
     * <p>Nội dung đơn giản, dễ đọc với mã OTP được hiển thị nổi bật.
     * Thời hạn hiệu lực 15 phút (phải khớp với thời hạn OTP trong DB).</p>
     *
     * @param otp Mã OTP 6 số cần nhúng vào email.
     * @return Chuỗi HTML đầy đủ để gửi qua SMTP.
     */
    private String buildOtpEmailBody(String otp) {
        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                    <h2 style="color: #e74c3c;">🔐 Mã xác thực OTP</h2>
                    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Chatbot Ẩm Thực & Du Lịch.</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #2c3e50; letter-spacing: 8px; font-size: 40px;">%s</h1>
                    </div>
                    <p>⏱️ Mã có hiệu lực trong <strong>15 phút</strong>.</p>
                    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="color: #999; font-size: 12px;">Chatbot Ẩm Thực & Du Lịch Việt Nam</p>
                </div>
                """, otp);
    }
}
