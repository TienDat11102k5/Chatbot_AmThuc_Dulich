package com.bot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO (Data Transfer Object) đại diện cho một yêu cầu gửi email trong hàng đợi RabbitMQ.
 *
 * <p>Object này được EmailProducer đẩy vào queue và EmailConsumer nhận ra để xử lý.
 * Jackson2JsonMessageConverter tự động chuyển đổi object này ↔ JSON khi truyền qua queue.</p>
 *
 * <p><b>Vòng đời của EmailMessage:</b></p>
 * <ol>
 *   <li>AuthService tạo EmailMessage → gọi EmailProducer.</li>
 *   <li>EmailProducer serialize thành JSON → đẩy vào "email.queue".</li>
 *   <li>EmailConsumer nhận JSON → deserialize thành EmailMessage.</li>
 *   <li>EmailConsumer gọi EmailService.sendOtpEmail() để gửi email thực tế.</li>
 *   <li>Nếu gửi thất bại → retryCount tăng lên, thử lại tối đa 3 lần.</li>
 *   <li>Sau 3 lần thất bại → message vào email.dlq để admin xem xét.</li>
 * </ol>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessage implements Serializable {

    /**
     * Địa chỉ email người nhận.
     * Ví dụ: "user@gmail.com"
     */
    private String toEmail;

    /**
     * Tiêu đề email.
     * Ví dụ: "[Chatbot Ẩm Thực] Mã OTP xác thực của bạn"
     */
    private String subject;

    /**
     * Nội dung email (có thể là HTML hoặc plain text).
     * Chứa mã OTP và hướng dẫn sử dụng.
     */
    private String body;

    /**
     * Số lần đã thử gửi lại.
     * Bắt đầu từ 0, tăng lên mỗi lần gửi thất bại.
     * EmailConsumer sẽ từ chối xử lý nếu retryCount >= 3 (đẩy vào DLQ).
     */
    @Builder.Default
    private int retryCount = 0;
}
