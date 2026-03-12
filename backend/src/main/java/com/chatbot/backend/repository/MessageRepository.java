package com.chatbot.backend.repository;

import com.chatbot.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findAllBySessionIdOrderByTimestampAsc(UUID sessionId);
}
