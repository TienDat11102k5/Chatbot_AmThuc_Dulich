package com.bot.controller.chat;

import com.bot.entity.ChatSession;
import com.bot.entity.Message;
import com.bot.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller chịu trách nhiệm các tác vụ về khung Chat: 
 * Lấy lịch sử phiên, tạo mới cửa sổ Chat và lưu tin nhắn ra vào hệ thống.
 */
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * API Khởi tạo một phiên Chat (Session) mới khi người dùng bắt đầu cuộc trò chuyện.
     * Tự động đặt tên tiêu đề hòm chat dựa vào đoạn tin nhắn ban đầu.
     *
     * @param userId Định danh người dùng dưới dạng UUID cần tạo hộp thoại.
     * @param initialMessage Chuỗi String chứa nội dung chat mớm lời tiên phong.
     * @return Model đối tượng ChatSession bao gồm Metadata chi tiết, trả về dạng JSON 200 OK.
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<ChatSession> createSession(@PathVariable UUID userId, @RequestBody String initialMessage) {
        return ResponseEntity.ok(chatService.createSession(userId, initialMessage));
    }

    /**
     * Tải về danh sách tất cả những phiên lịch sử Chat mà một người dùng đã từng tham gia / tạo lập.
     * Trả về danh sách được sắp xếp từ mới nhất tới cũ nhất.
     *
     * @param userId Định danh UUID của tài khoản người dùng đang truy vấn.
     * @return List Object đại diện cho ChatSession, nếu chưa từng chat thì danh sách sẽ rỗng `[]`.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatSession>> getUserSessions(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getUserSessions(userId));
    }

    /**
     * Trích xuất và tải toàn bộ dòng thời gian lịch sử trò chuyện (tin nhắn) ra hiển thị tại vùng Client Chatbox cụ thể.
     * Thứ tự các tin nhắn được sắp xếp tăng dần theo thời điểm gửi.
     *
     * @param sessionId Định danh UUID thuộc phiên Session đó (phân biệt các box trò chuyện).
     * @return Một tập JSON Array chứa nhiều Object Message mang dữ kiện nội dung, người gửi, metadata.
     */
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(chatService.getSessionMessages(sessionId));
    }

    /**
     * API gửi và nạp lưu tin nhắn từng dòng trong luồng Event Chat đang diễn ra (cho cả User và phản hồi từ AI Bot).
     *
     * @param sessionId Định danh phiên làm việc UUID làm đích đến của message.
     * @param request Chuỗi JSON (DTO) cung cấp Người gửi (USER/BOT), Text Nội dung và trường Metadata đính kèm (Ví dụ gợi ý địa điểm).
     * @return Entity Message được ghi nhận thành công từ CSDL cùng mốc timestamp xác nhận.
     */
    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<Message> postMessage(@PathVariable UUID sessionId, @RequestBody MessageRequest request) {
        Message savedMessage = chatService.saveMessage(sessionId, request.getSenderType(), request.getContent(), request.getMetadata());
        return ResponseEntity.ok(savedMessage);
    }
    
    /**
     * DTO (Data Transfer Object) đóng gói dữ liệu của một tin nhắn từ thiết bị Client truyền tới Backend.
     */
    public static class MessageRequest {
        /**
         * Enum hoặc text định nghĩa nguồn gốc đoạn tin: "USER" nếu là người dùng gõ, hoặc "BOT" nếu là tin tự trả lời.
         */
        private String senderType;

        /**
         * Phần text nội dung gốc của thông điệp trò chuyện.
         */
        private String content;

        /**
         * Trường tùy chọn (Json string/text) chuyên nhúng dữ liệu metadata đính kèm. Ví dụ: List ID gợi ý địa điểm.
         */
        private String metadata;
        
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { this.metadata = metadata; }
    }
}
