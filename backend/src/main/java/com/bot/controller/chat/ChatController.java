package com.bot.controller.chat;

import com.bot.entity.ChatSession;
import com.bot.entity.Message;
import com.bot.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<ChatSession> createSession(@PathVariable UUID userId, @RequestBody String initialMessage) {
        return ResponseEntity.ok(chatService.createSession(userId, initialMessage));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatSession>> getUserSessions(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getUserSessions(userId));
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(chatService.getSessionMessages(sessionId));
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<Message> postMessage(@PathVariable UUID sessionId, @RequestBody MessageRequest request) {
        Message savedMessage = chatService.saveMessage(sessionId, request.getSenderType(), request.getContent(), request.getMetadata());
        return ResponseEntity.ok(savedMessage);
    }
    
    // DTO for request body binding
    public static class MessageRequest {
        private String senderType;
        private String content;
        private String metadata;
        
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { this.metadata = metadata; }
    }
}
