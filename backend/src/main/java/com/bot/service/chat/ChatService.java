package com.bot.service.chat;

import com.bot.entity.ChatSession;
import com.bot.entity.Message;
import com.bot.entity.User;
import com.bot.repository.ChatSessionRepository;
import com.bot.repository.MessageRepository;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatSession createSession(UUID userId, String initialMessage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatSession session = ChatSession.builder()
                .user(user)
                .title(initialMessage.length() > 50 ? initialMessage.substring(0, 50) + "..." : initialMessage)
                .isActive(true)
                .startTime(LocalDateTime.now())
                .build();
        
        return chatSessionRepository.save(session);
    }

    public List<ChatSession> getUserSessions(UUID userId) {
        return chatSessionRepository.findAllByUserIdOrderByStartTimeDesc(userId);
    }

    public List<Message> getSessionMessages(UUID sessionId) {
        return messageRepository.findAllBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Transactional
    public Message saveMessage(UUID sessionId, String senderType, String content, String metadata) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        Message message = Message.builder()
                .session(session)
                .senderType(senderType)
                .content(content)
                .metadata(metadata)
                .build();
        
        return messageRepository.save(message);
    }
}
