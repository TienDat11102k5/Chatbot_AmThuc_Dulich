package com.bot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Cấu hình xử lý bất đồng bộ (Async) cho hệ thống.
 *
 * <p><b>Mục đích:</b> Tách các tác vụ nặng hoặc không cần thiết đối với trải nghiệm người dùng
 * (ví dụ: lưu lịch sử chat vào Database) ra khỏi luồng phản hồi chính.
 * Nhờ vậy, người dùng nhận được phản hồi từ Bot ngay lập tức
 * mà không phải chờ thao tác INSERT SQL hoàn tất.</p>
 *
 * <p><b>Thread Pool "chatTaskExecutor":</b></p>
 * <ul>
 *   <li><b>corePoolSize = 5:</b> Luôn duy trì tối thiểu 5 thread sẵn sàng xử lý.</li>
 *   <li><b>maxPoolSize = 20:</b> Khi tải cao, có thể mở rộng tối đa 20 thread đồng thời.</li>
 *   <li><b>queueCapacity = 100:</b> Hàng đợi chứa tối đa 100 tác vụ chờ khi tất cả thread đều bận.</li>
 *   <li><b>threadNamePrefix = "chat-async-":</b> Đặt tên prefix cho thread, dễ nhận diện khi debug log.</li>
 * </ul>
 *
 * <p><b>Các method sử dụng thread pool này:</b></p>
 * <ul>
 *   <li>{@code ChatService.saveMessageAsync()} — Lưu tin nhắn Bot vào DB sau khi stream xong.</li>
 *   <li>{@code ChatService.streamAiResponse()} — Stream phản hồi AI qua SSE trên thread riêng.</li>
 * </ul>
 *
 * @see com.bot.service.chat.ChatService#saveMessageAsync
 * @see com.bot.service.chat.ChatService#streamAiResponse
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Tạo và cấu hình Thread Pool chuyên dụng cho các tác vụ Chat bất đồng bộ.
     *
     * <p><b>Lưu ý quan trọng:</b> Thread pool này TÁCH BIỆT hoàn toàn với thread pool
     * của Tomcat (phục vụ HTTP request). Nghĩa là dù có 100 cuộc chat đồng thời
     * đang lưu lịch sử, server vẫn phục vụ API bình thường không bị block.</p>
     *
     * @return Executor đã cấu hình, sẵn sàng cho annotation @Async("chatTaskExecutor").
     */
    @Bean(name = "chatTaskExecutor")
    public Executor chatTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Số thread tối thiểu luôn duy trì (kể cả khi không có tác vụ)
        executor.setCorePoolSize(5);

        // Số thread tối đa được phép mở rộng khi tải cao
        executor.setMaxPoolSize(20);

        // Hàng đợi tác vụ: khi tất cả 20 thread đều bận, tối đa 100 task được xếp hàng chờ
        executor.setQueueCapacity(100);

        // Đặt tên prefix cho thread — giúp nhận diện nhanh trong log khi debug
        // VD: "chat-async-1", "chat-async-2", ...
        executor.setThreadNamePrefix("chat-async-");

        // Khởi tạo thread pool
        executor.initialize();
        return executor;
    }
}
