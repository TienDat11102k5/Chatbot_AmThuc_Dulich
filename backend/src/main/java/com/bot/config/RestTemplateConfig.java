package com.bot.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Cấu hình RestTemplate dùng cho việc gọi API AI Service từ Backend.
 *
 * Timeout chuẩn Enterprise:
 * - connectTimeout: 3 giây (thời gian tối đa chờ kết nối)
 * - readTimeout: 5 giây (thời gian tối đa chờ phản hồi)
 *
 * Nếu AI Service sập hoặc phản hồi chậm, RestTemplate sẽ throw exception
 * thay vì block thread Tomcat vô hạn.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }
}
