package com.bot.repository;

import com.bot.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository xử lý truy vấn cho bảng `messages`.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    // Lấy toàn bộ tin nhắn trong một phiên chat, sắp xếp theo thứ tự thời gian cũ -> mới (để hiển thị UI)
    List<Message> findAllBySessionIdOrderByTimestampAsc(UUID sessionId);
}

