package com.bot.entity;

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
    private User user;

    // Tiêu đề của phiên chat (ví dụ: sinh tự động từ tin nhắn đầu tiên)
    @Column(nullable = false)
    private String title;

    // Trạng thái của phiên (có còn đang hoạt động không)
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    // Thời điểm phiên được khởi tạo
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
}

