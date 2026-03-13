package com.bot.repository;

import com.bot.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository tương tác với CSDL cho bảng `chat_sessions`.
 */
@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    
    // Tìm tất cả phiên chat của một người dùng, sắp xếp mới nhất lên đầu
    List<ChatSession> findAllByUserIdOrderByStartTimeDesc(UUID userId);
}

