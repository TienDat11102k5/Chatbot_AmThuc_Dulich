package com.bot.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
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
 *   <li><b>categories (30 phút):</b> Danh mục ẩm thực/du lịch ít thay đổi, cache lâu nhất.</li>
 *   <li><b>places (10 phút):</b> Danh sách địa điểm có thể cập nhật thường xuyên hơn.</li>
 *   <li><b>users (5 phút):</b> Thông tin người dùng cần đồng bộ nhanh khi có thay đổi.</li>
 * </ul>
 *
 * <p><b>Serialization:</b> Sử dụng JSON để dễ debug qua Redis CLI.
 * Key được serialize bằng String, Value bằng Jackson JSON.</p>
 *
 * @see org.springframework.cache.annotation.Cacheable
 * @see org.springframework.cache.annotation.CacheEvict
 */
@Configuration
@EnableCaching
public class RedisConfig {

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

                .build();
    }
}
