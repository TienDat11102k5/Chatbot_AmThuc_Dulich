package com.bot.repository;

import com.bot.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * Lấy danh sách users đã chat AI (có phân trang).
     * JOIN 3 bảng: users + chat_sessions + messages
     * GROUP BY user → trả về DTO projection (tránh N+1).
     *
     * Kết quả Object[] gồm:
     * [0] userId, [1] fullName, [2] email, [3] avatarUrl, [4] status,
     * [5] totalSessions, [6] totalMessages, [7] lastSessionAt
     */
    @Query("""
        SELECT u.id, u.fullName, u.email, u.avatarUrl, u.status,
               COUNT(DISTINCT cs.id), 
               COUNT(m.id),
               MAX(cs.startTime)
        FROM ChatSession cs
        JOIN cs.user u
        LEFT JOIN Message m ON m.session.id = cs.id AND m.senderType = 'USER'
        GROUP BY u.id, u.fullName, u.email, u.avatarUrl, u.status
        ORDER BY MAX(cs.startTime) DESC
    """)
    Page<Object[]> findAiUserSummaries(Pageable pageable);
}

