package com.bot.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson Configuration để xử lý Java 8 Date/Time types (LocalDateTime, LocalDate...)
 */
@Configuration
public class JacksonConfig {

    /**
     * Tạo ObjectMapper bean chính với JavaTimeModule đã đăng ký.
     * Dùng @Primary để đảm bảo Spring Boot dùng bean này thay vì auto-configured bean.
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Register JavaTimeModule để hỗ trợ LocalDateTime, LocalDate, ZonedDateTime, etc.
        mapper.registerModule(new JavaTimeModule());
        // Serialize LocalDateTime thành ISO-8601 string (không phải timestamp số)
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
