package com.bot.repository;

import com.bot.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    /**
     * Lấy lịch sử chat theo session_id, sắp xếp theo thời gian tạo
     */
    List<ChatHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    /**
     * Lấy N tin nhắn gần nhất của session
     */
    @Query("SELECT ch FROM ChatHistory ch WHERE ch.sessionId = :sessionId ORDER BY ch.createdAt DESC")
    List<ChatHistory> findRecentBySessionId(@Param("sessionId") String sessionId);
    
    /**
     * Lấy lịch sử chat theo user_id
     */
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Xóa lịch sử chat cũ hơn N ngày
     */
    @Query("DELETE FROM ChatHistory ch WHERE ch.createdAt < :cutoffDate")
    void deleteOlderThan(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
