package com.bot.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể biểu diễn một phiên chat cụ thể của người dùng. Một người có thể tạo nhiều phiên.
 */
@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Chủ sở hữu phiên chat này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // Không serialize User object để tránh lazy loading error
    private User user;

    // Tiêu đề của phiên chat (ví dụ: sinh tự động từ tin nhắn đầu tiên)
    @Column(nullable = false)
    private String title;

    // Trạng thái của phiên (có còn đang hoạt động không)
    @Column(name = "is_active", nullable = false)
    @JsonProperty("status")
    private Boolean isActive;

    // Thời điểm phiên được khởi tạo
    @Column(name = "start_time", nullable = false)
    @JsonProperty("createdAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @com.fasterxml.jackson.databind.annotation.JsonSerialize(using = com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer.class)
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer.class)
    private LocalDateTime startTime;
}

