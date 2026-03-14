package com.bot.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình RabbitMQ — Hệ thống hàng đợi tin nhắn bất đồng bộ.
 *
 * <p><b>Mục đích:</b> Cho phép các tác vụ tốn thời gian (gửi email, xử lý nặng)
 * chạy nền mà không block user phải ngồi chờ.
 * Ví dụ: User bấm "Quên mật khẩu" → Server phản hồi ngay lập tức →
 * Email OTP được gửi trong nền bởi Consumer.</p>
 *
 * <p><b>Kiến trúc hàng đợi:</b></p>
 * <pre>
 *   Producer (EmailProducer)
 *       |
 *       |-- routing key: "email.send" --&gt; [chatbot.exchange]
 *                                              |
 *                                              |--&gt; [email.queue]  --&gt; Consumer (EmailConsumer)
 *                                                       |
 *                                              (Thất bại 3 lần)
 *                                                       |
 *                                                       |--&gt; [email.dlq]  (Lưu để kiểm tra)
 * </pre>
 *
 * <p><b>Thành phần:</b></p>
 * <ul>
 *   <li><b>Exchange (chatbot.exchange):</b> Nhận message từ Producer, điều hướng theo routing key.</li>
 *   <li><b>email.queue:</b> Hàng đợi chính chứa yêu cầu gửi email OTP.</li>
 *   <li><b>email.dlq:</b> Dead Letter Queue — chứa email thất bại sau 3 lần retry.</li>
 *   <li><b>Jackson2JsonMessageConverter:</b> Chuyển đổi DTO Java ↔ JSON cho message.</li>
 * </ul>
 *
 * <p><b>Graceful Degradation:</b> Nếu RabbitMQ sập, AuthService sẽ tự
 * fallback sang gửi email đồng bộ trực tiếp (xem AuthService.java).</p>
 */
@Configuration
public class RabbitMQConfig {

    // =========================================================================
    // CÁC HẰNG SỐ TÊN QUEUE / EXCHANGE / ROUTING KEY
    // Khai báo tập trung để tránh lỗi typo khi dùng ở nhiều nơi
    // =========================================================================

    /** Tên hàng đợi chính xử lý yêu cầu gửi email OTP. */
    public static final String EMAIL_QUEUE       = "email.queue";

    /** Tên Dead Letter Queue — chứa email gửi thất bại nhiều lần. */
    public static final String EMAIL_DLQ         = "email.dlq";

    /** Tên Exchange nhận và điều hướng message. */
    public static final String CHATBOT_EXCHANGE  = "chatbot.exchange";

    /** Routing key để route message tới email.queue. */
    public static final String EMAIL_ROUTING_KEY = "email.send";

    // =========================================================================
    // KHAI BÁO EXCHANGE
    // =========================================================================

    /**
     * Khai báo Direct Exchange để điều hướng message theo routing key.
     *
     * <p>Direct Exchange hoạt động như bưu điện: nhận message, xem routing key,
     * rồi giao đúng hàng đợi gắn với routing key đó.</p>
     *
     * @return DirectExchange đã được đăng ký với tên "chatbot.exchange".
     */
    @Bean
    public DirectExchange chatbotExchange() {
        // durable=true: Exchange tồn tại sau khi RabbitMQ restart
        return new DirectExchange(CHATBOT_EXCHANGE, true, false);
    }

    // =========================================================================
    // KHAI BÁO QUEUE
    // =========================================================================

    /**
     * Khai báo hàng đợi email chính để xử lý yêu cầu gửi OTP.
     *
     * <p>Queue được cấu hình kèm Dead Letter Exchange — khi message bị từ chối
     * (NACK) hoặc hết số lần retry, RabbitMQ tự động chuyển sang email.dlq
     * thay vì xóa mất.</p>
     *
     * @return Queue "email.queue" với Dead Letter Exchange đã cấu hình.
     */
    @Bean
    public Queue emailQueue() {
        return QueueBuilder
                .durable(EMAIL_QUEUE)  // durable=true: Queue tồn tại sau restart
                // Cấu hình Dead Letter Exchange: khi message thất bại → chuyển tới đây
                .withArgument("x-dead-letter-exchange", "")  // Dùng default exchange
                .withArgument("x-dead-letter-routing-key", EMAIL_DLQ)  // Route sang DLQ
                .build();
    }

    /**
     * Khai báo Dead Letter Queue — kho lưu trữ email thất bại.
     *
     * <p>Khi EmailConsumer không thể gửi email sau 3 lần retry,
     * message sẽ tự động bị đẩy vào DLQ này để admin kiểm tra,
     * phân tích nguyên nhân, hoặc retry thủ công.</p>
     *
     * @return Queue "email.dlq" đơn giản (không cần Dead Letter tiếp).
     */
    @Bean
    public Queue emailDeadLetterQueue() {
        // Queue đơn giản, không cần cấu hình DLQ cho DLQ
        return QueueBuilder.durable(EMAIL_DLQ).build();
    }

    // =========================================================================
    // KHAI BÁO BINDING (Kết nối Queue ↔ Exchange theo Routing Key)
    // =========================================================================

    /**
     * Gắn hàng đợi email.queue vào chatbot.exchange với routing key "email.send".
     *
     * <p>Khi Producer gửi message với routing key "email.send" tới "chatbot.exchange",
     * RabbitMQ tự động chuyển message vào "email.queue".</p>
     *
     * @param emailQueue     Hàng đợi nhận message.
     * @param chatbotExchange Exchange nhận message từ Producer.
     * @return Binding đã kết nối Queue ↔ Exchange.
     */
    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange chatbotExchange) {
        return BindingBuilder
                .bind(emailQueue)
                .to(chatbotExchange)
                .with(EMAIL_ROUTING_KEY);
    }

    // =========================================================================
    // MESSAGE CONVERTER — Chuyển đổi DTO Java sang JSON trong message
    // =========================================================================

    /**
     * Cấu hình Message Converter dùng Jackson để serialize/deserialize.
     *
     * <p>Khi Producer gửi {@code EmailMessage} (Java Object) vào queue,
     * converter tự động chuyển thành JSON text.
     * Khi Consumer nhận, converter tự động parses JSON ngược lại thành Object.</p>
     *
     * @return Jackson2JsonMessageConverter đã sẵn sàng.
     */
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Cấu hình RabbitTemplate với JSON MessageConverter.
     *
     * <p>RabbitTemplate là công cụ chính để Producer gửi message vào Exchange.
     * Cần gắn thủ công MessageConverter vào đây — Spring Boot không tự gắn.</p>
     *
     * @param connectionFactory Factory kết nối RabbitMQ (Spring Boot tự inject).
     * @return RabbitTemplate đã cấu hình JSON serialization.
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        // Gắn JSON converter để tự động chuyển đổi Object ↔ JSON
        template.setMessageConverter(messageConverter());
        return template;
    }
}
