package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể lưu trữ các tin nhắn trong một phiên làm việc (ChatSession) giữa người dùng (USER) và hệ thống (BOT).
 */
@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Phiên chat mà tin nhắn này thuộc về
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // Bỏ qua serialize session để tránh serialize lại ChatSession
    private ChatSession session;

    // Loại người gửi ("USER" hoặc "BOT")
    @Column(name = "sender_type", nullable = false)
    private String senderType; // ENUM: "USER", "BOT"

    // Nội dung text của tin nhắn
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Lưu trữ JSONB cho dữ liệu bổ sung như danh sách ID quán ăn (metadata), action, intent
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    // Thời gian gửi tin
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    @com.fasterxml.jackson.databind.annotation.JsonSerialize(using = com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer.class)
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;
}

