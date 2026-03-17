package com.bot.service.email;

import com.bot.config.RabbitMQConfig;
import com.bot.dto.EmailMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Email Consumer — Lắng nghe hàng đợi RabbitMQ và xử lý yêu cầu gửi email.
 *
 * <p><b>Vai trò:</b> Chạy nền liên tục, lắng nghe "email.queue". Khi có message mới,
 * Consumer tự động nhận và gọi EmailService để gửi email thực tế qua SMTP Gmail.</p>
 *
 * <p><b>Cơ chế Retry (Thử lại khi lỗi):</b></p>
 * <ul>
 *   <li>Lần 1 (retryCount=0): Thử gửi email bình thường.</li>
 *   <li>Lần 2 (retryCount=1): SMTP lỗi → tăng retryCount, đẩy lại vào queue sau 5 giây.</li>
 *   <li>Lần 3 (retryCount=2): Thử lại lần nữa.</li>
 *   <li>Lần 4 (retryCount=3): Vẫn lỗi → đẩy vào Dead Letter Queue (email.dlq).</li>
 * </ul>
 *
 * <p><b>Dead Letter Queue (email.dlq):</b></p>
 * <p>Admin có thể truy cập RabbitMQ Management UI (localhost:15672) để xem các
 * email thất bại trong DLQ, phân tích nguyên nhân hoặc retry thủ công.</p>
 *
 * <p><b>Tự động Acknowledgement:</b></p>
 * <p>Mặc định Spring AMQP dùng AUTO ack — message chỉ xóa khỏi queue sau khi
 * method xử lý xong không ném exception. Nếu ném exception → message về lại queue.
 * Em dùng logic retryCount để kiểm soát thủ công thay vì để queue tự retry vô hạn.</p>
 *
 * @see EmailProducer
 * @see EmailService
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    /** Service gửi email thực tế qua SMTP Gmail. */
    private final EmailService emailService;

    /** Producer để đẩy lại message khi retry hoặc vào DLQ. */
    private final EmailProducer emailProducer;

    /** Số lần retry tối đa trước khi đẩy vào Dead Letter Queue. */
    private static final int MAX_RETRY_COUNT = 3;

    /** Thời gian chờ giữa các lần retry (mili-giây). */
    private static final long RETRY_DELAY_MS = 5_000; // 5 giây

    /**
     * Xử lý yêu cầu gửi email OTP nhận từ "email.queue".
     *
     * <p>Method này tự động được RabbitMQ kích hoạt mỗi khi có message mới
     * trong "email.queue". Jackson2JsonMessageConverter tự động deserialize
     * JSON thành {@link EmailMessage} object trước khi gọi method này.</p>
     *
     * <p><b>Luồng xử lý:</b></p>
     * <ol>
     *   <li>Nhận EmailMessage từ queue.</li>
     *   <li>Kiểm tra retryCount — nếu đã đủ rồi, đẩy vào DLQ và bỏ qua.</li>
     *   <li>Gọi EmailService.sendOtpEmail() để gửi qua SMTP.</li>
     *   <li>Thành công: Log thành công. Queue tự xóa message.</li>
     *   <li>Thất bại: Đợi RETRY_DELAY_MS rồi đẩy lại vào queue với retryCount+1.</li>
     * </ol>
     *
     * @param message EmailMessage nhận được từ queue (đã được tự động deserialize).
     */
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void processEmail(EmailMessage message) {
        log.info("[EmailConsumer] Nhận yêu cầu gửi email cho: {} (lần thử: {})",
                message.getToEmail(), message.getRetryCount() + 1);

        // Kiểm tra: Đã vượt giới hạn retry → đẩy vào DLQ và dừng
        if (message.getRetryCount() >= MAX_RETRY_COUNT) {
            log.error("[EmailConsumer] Email cho {} đã thất bại {} lần — Đẩy vào DLQ để admin xem xét.",
                    message.getToEmail(), MAX_RETRY_COUNT);
            sendToDeadLetterQueue(message);
            return;
        }

        try {
            // Gọi EmailService gửi email thực tế qua SMTP Gmail (dạng HTML)
            emailService.sendHtmlEmail(message.getToEmail(), message.getSubject(), message.getBody());

            log.info("[EmailConsumer] ✅ Gửi email OTP thành công cho: {}", message.getToEmail());

        } catch (Exception e) {
            // Gửi thất bại (SMTP lỗi, mạng gián đoạn...) → Lên kế hoạch retry
            log.warn("[EmailConsumer] ❌ Gửi email thất bại cho: {} — Nguyên nhân: {} — Sẽ thử lại sau {}ms",
                    message.getToEmail(), e.getMessage(), RETRY_DELAY_MS);

            // Chờ một khoảng trước khi retry (tránh retry quá nhanh khi SMTP bận)
            waitBeforeRetry();

            // Tạo EmailMessage mới với retryCount tăng lên 1
            EmailMessage retryMessage = EmailMessage.builder()
                    .toEmail(message.getToEmail())
                    .subject(message.getSubject())
                    .body(message.getBody())
                    .retryCount(message.getRetryCount() + 1)  // Tăng bộ đếm retry
                    .build();

            // Đẩy lại vào queue để Consumer xử lý lần sau
            emailProducer.retryEmailRequest(retryMessage);
        }
    }

    /**
     * Đẩy EmailMessage vào Dead Letter Queue khi đã hết giới hạn retry.
     *
     * <p>Admin có thể kiểm tra DLQ qua RabbitMQ Management UI:
     * http://localhost:15672 → Queues → email.dlq</p>
     *
     * @param failedMessage EmailMessage không thể gửi sau nhiều lần thử.
     */
    private void sendToDeadLetterQueue(EmailMessage failedMessage) {
        // Dùng RabbitTemplate gửi thẳng vào DLQ (không qua exchange)
        emailProducer.retryEmailRequest(EmailMessage.builder()
                .toEmail(failedMessage.getToEmail())
                .subject("[DLQ] " + failedMessage.getSubject())  // Đánh dấu là DLQ
                .body(failedMessage.getBody())
                .retryCount(failedMessage.getRetryCount())
                .build());

        log.error("[EmailConsumer] Đã chuyển email cho {} vào Dead Letter Queue.", failedMessage.getToEmail());
    }

    /**
     * Dừng thread hiện tại trước khi retry để tránh retry quá nhanh.
     *
     * <p>Tại sao cần đợi? Nếu SMTP đang gặp sự cố tạm thời (quá tải, mất kết nối),
     * retry ngay lập tức sẽ tiếp tục thất bại. Đợi vài giây cho SMTP phục hồi.</p>
     */
    private void waitBeforeRetry() {
        try {
            Thread.sleep(RETRY_DELAY_MS);
        } catch (InterruptedException ie) {
            // Restore trạng thái interrupt nếu thread bị dừng từ bên ngoài
            Thread.currentThread().interrupt();
            log.warn("[EmailConsumer] Thread bị ngắt trong khi chờ retry.");
        }
    }
}
