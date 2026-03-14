package com.bot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Cấu hình lớp Bộ nhớ đệm Redis (L2 Cache) cho hệ thống.
 *
 * <p><b>Mục đích:</b> Giảm tải truy vấn xuống PostgreSQL bằng cách lưu trữ
 * dữ liệu hay đọc (ít thay đổi) vào RAM thông qua Redis.
 * Nhờ vậy, thời gian phản hồi API giảm từ hàng trăm mili-giây
 * (truy vấn DB vật lý) xuống còn dưới 5ms (đọc từ Redis).</p>
 *
 * <p><b>Chiến lược TTL (Time-To-Live) theo loại dữ liệu:</b></p>
 * <ul>
 *   <li><b>categories (30 phút):</b> Danh mục ẩm thực/du lịch ít thay đổi.</li>
 *   <li><b>places (10 phút):</b> Danh sách địa điểm cập nhật thường xuyên hơn.</li>
 *   <li><b>users (5 phút):</b> Thông tin người dùng cần đồng bộ nhanh khi thay đổi.</li>
 *   <li><b>chat_sessions (15 phút):</b> Danh sách phiên chat của từng user.</li>
 *   <li><b>chat_history (10 phút):</b> Lịch sử tin nhắn trong một phiên cụ thể.</li>
 * </ul>
 *
 * <p><b>Thêm mới (Phase 5):</b> RedisTemplate bean dùng cho Rate Limiter
 * và các thao tác Redis tùy chỉnh (INCR, EXPIRE, GET, SET...).</p>
 *
 * <p><b>Serialization:</b> Key = String, Value = JSON (dễ debug qua redis-cli).</p>
 *
 * @see org.springframework.cache.annotation.Cacheable
 * @see org.springframework.cache.annotation.CacheEvict
 */
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Bean RedisTemplate dùng cho thao tác Redis tùy chỉnh (ngoài @Cacheable).
     *
     * <p><b>Ai dùng bean này?</b>
     * <ul>
     *   <li>{@code RateLimitFilter}: Dùng INCR + EXPIRE để đếm và giới hạn request theo IP.</li>
     *   <li>Bất kỳ service nào cần thao tác Redis trực tiếp (SET, GET, DEL...).</li>
     * </ul>
     *
     * <p><b>Tại sao tách riêng RedisTemplate thay vì dùng CacheManager?</b>
     * CacheManager chỉ hỗ trợ các thao tác cache đơn giản (get/put/evict).
     * RedisTemplate cung cấp toàn bộ lệnh Redis nguyên thủy như INCR, EXPIRE,
     * SETEX, KEYS... — cần thiết cho Rate Limiter theo thuật toán Sliding Window.</p>
     *
     * @param connectionFactory Factory kết nối Redis (Spring Boot tự inject).
     * @return RedisTemplate với key và value kiểu String (dễ debug).
     */
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Dùng StringRedisSerializer cho cả Key và Value
        // → Dữ liệu lưu ở dạng text thuần, dễ đọc bằng redis-cli
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Khởi tạo CacheManager kết nối với Redis và cấu hình TTL cho từng loại cache.
     *
     * <p><b>Quy trình:</b></p>
     * <ol>
     *   <li>Tạo cấu hình mặc định (TTL 5 phút, bỏ qua giá trị null).</li>
     *   <li>Gán Serializer cho Key (String) và Value (JSON).</li>
     *   <li>Đăng ký các cache cụ thể với TTL riêng biệt.</li>
     * </ol>
     *
     * <p><b>Graceful Degradation:</b> Nếu Redis bị sập, Spring Boot tự động
     * bỏ qua cache và đọc thẳng từ DB — hệ thống chậm hơn nhưng không chết.</p>
     *
     * @param connectionFactory Factory kết nối Redis (Spring Boot tự inject từ application.properties).
     * @return CacheManager đã sẵn sàng phục vụ annotation @Cacheable trong Service layer.
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        // Cấu hình mặc định: TTL 5 phút, bỏ qua cache giá trị null để tránh lãng phí bộ nhớ
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new StringRedisSerializer()))       // Key = chuỗi thuần (dễ đọc)
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()))  // Value = JSON (dễ debug)
                .disableCachingNullValues();                         // Không cache giá trị null

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)

                // Danh mục (categories): ít thay đổi → cache 30 phút
                .withCacheConfiguration("categories",
                        defaultConfig.entryTtl(Duration.ofMinutes(30)))

                // Địa điểm (places): thay đổi vừa phải → cache 10 phút
                .withCacheConfiguration("places",
                        defaultConfig.entryTtl(Duration.ofMinutes(10)))

                // Người dùng (users): cần đồng bộ nhanh → cache 5 phút (mặc định)
                .withCacheConfiguration("users",
                        defaultConfig.entryTtl(Duration.ofMinutes(5)))

                // [THÊM MỚI Phase 5] Danh sách phiên chat theo userId → cache 15 phút
                // Tại sao 15 phút? User ít khi tạo session liên tục, dữ liệu khá ổn định.
                // @CacheEvict sẽ xóa ngay khi user tạo session mới (xem ChatService).
                .withCacheConfiguration("chat_sessions",
                        defaultConfig.entryTtl(Duration.ofMinutes(15)))

                // [THÊM MỚI Phase 5] Lịch sử tin nhắn theo sessionId → cache 10 phút
                // Tại sao 10 phút? Messages thêm liên tục khi chat → TTL ngắn hơn session.
                // @CacheEvict sẽ xóa ngay khi có tin nhắn mới (xem ChatService).
                .withCacheConfiguration("chat_history",
                        defaultConfig.entryTtl(Duration.ofMinutes(10)))

                .build();
    }
}
