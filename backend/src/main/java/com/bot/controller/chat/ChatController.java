package com.bot.controller.chat;

import com.bot.entity.ChatSession;
import com.bot.entity.Message;
import com.bot.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller đảm nhận toàn bộ các API liên quan đến hệ thống Chat.
 *
 * <p><b>Base URL:</b> /api/v1</p>
 *
 * <p>Controller này cung cấp 2 nhóm endpoint chính:</p>
 * <ol>
 *   <li><b>Quản lý phiên chat (Session):</b> Tạo mới, lấy danh sách phiên, lấy lịch sử tin nhắn.</li>
 *   <li><b>Streaming AI (SSE):</b> Endpoint cho phản hồi AI theo thời gian thực (Server-Sent Events).</li>
 * </ol>
 *
 * <p><b>Luồng hoạt động tổng quan:</b></p>
 * <pre>
 *   Người dùng nhập tin nhắn
 *       → Frontend gọi POST /api/v1/chat/stream
 *           → Controller tạo SseEmitter
 *               → ChatService stream từ AI Service (FastAPI)
 *                   → Từng token được đẩy về Frontend real-time
 * </pre>
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    /** Inject ChatService — nơi xử lý toàn bộ logic nghiệp vụ chat. */
    private final ChatService chatService;

    // =========================================================================
    // 1. QUẢN LÝ PHIÊN CHAT (SESSION APIs)
    // =========================================================================

    /**
     * Khởi tạo một phiên Chat (Session) mới khi người dùng bắt đầu cuộc trò chuyện.
     *
     * <p>Tiêu đề phiên được tự động sinh từ nội dung tin nhắn đầu tiên
     * (cắt ngắn tối đa 50 ký tự để hiển thị trên sidebar).</p>
     *
     * <p><b>Ví dụ request:</b></p>
     * <pre>POST /api/v1/sessions/user/550e8400-e29b-41d4-a716-446655440000</pre>
     * <pre>Body: "Tìm quán phở ngon ở Cầu Giấy"</pre>
     *
     * @param userId         Định danh UUID của người dùng cần khởi tạo phiên chat.
     * @param initialMessage Nội dung câu hỏi đầu tiên, dùng để tự động đặt tiêu đề phiên.
     * @return Đối tượng ChatSession mới tạo, bao gồm ID phiên, tiêu đề, trạng thái. HTTP 200 OK.
     */
    @PostMapping("/sessions/user/{userId}")
    public ResponseEntity<ChatSession> createSession(
            @PathVariable UUID userId,
            @RequestBody String initialMessage) {
        return ResponseEntity.ok(chatService.createSession(userId, initialMessage));
    }

    /**
     * Lấy danh sách tất cả các phiên chat mà người dùng đã từng tạo.
     *
     * <p>Kết quả được sắp xếp từ mới nhất đến cũ nhất, phục vụ hiển thị
     * thanh sidebar lịch sử trò chuyện trên Frontend.</p>
     *
     * <p><b>Ví dụ request:</b></p>
     * <pre>GET /api/v1/sessions/user/550e8400-e29b-41d4-a716-446655440000</pre>
     *
     * @param userId Định danh UUID của tài khoản người dùng đang truy vấn.
     * @return Danh sách ChatSession. Nếu chưa từng chat, trả về mảng rỗng []. HTTP 200 OK.
     */
    @GetMapping("/sessions/user/{userId}")
    public ResponseEntity<List<ChatSession>> getUserSessions(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getUserSessions(userId));
    }

    /**
     * Lấy toàn bộ lịch sử tin nhắn trong một phiên hội thoại cụ thể.
     *
     * <p>Thứ tự tin nhắn được sắp xếp tăng dần theo thời gian gửi,
     * giúp Frontend render đúng trình tự cuộc trò chuyện giữa User và Bot.</p>
     *
     * <p><b>Ví dụ request:</b></p>
     * <pre>GET /api/v1/sessions/abc123-uuid/messages</pre>
     *
     * @param sessionId Định danh UUID của phiên Chat cần lấy lịch sử.
     * @return Danh sách Message với đầy đủ nội dung, người gửi, metadata, timestamp. HTTP 200 OK.
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(chatService.getSessionMessages(sessionId));
    }

    /**
     * Gửi và lưu một tin nhắn vào phiên Chat đang diễn ra.
     *
     * <p><b>Lưu ý:</b> API này dùng cho việc lưu tin nhắn ĐỒNG BỘ (synchronous).
     * Nếu muốn trải nghiệm streaming real-time, hãy dùng endpoint /chat/stream phía dưới.</p>
     *
     * <p><b>Ví dụ request:</b></p>
     * <pre>POST /api/v1/sessions/abc123-uuid/messages</pre>
     * <pre>Body: {"senderType": "USER", "content": "Gợi ý quán cà phê", "metadata": null}</pre>
     *
     * @param sessionId UUID của phiên Chat đích.
     * @param request   DTO chứa senderType (USER/BOT), content (nội dung), metadata (JSON bổ sung).
     * @return Đối tượng Message đã lưu thành công, kèm ID và timestamp tự sinh. HTTP 200 OK.
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Message> postMessage(
            @PathVariable UUID sessionId,
            @RequestBody MessageRequest request) {
        Message savedMessage = chatService.saveMessage(
                sessionId,
                request.getSenderType(),
                request.getContent(),
                request.getMetadata());
        return ResponseEntity.ok(savedMessage);
    }

    // =========================================================================
    // 2. STREAMING AI RESPONSE (SSE ENDPOINT)
    // =========================================================================

    /**
     * Endpoint Streaming phản hồi AI theo giao thức Server-Sent Events (SSE).
     *
     * <p><b>Đây là endpoint cốt lõi để Chatbot phản hồi theo kiểu "gõ phím" real-time</b>
     * — tương tự cách ChatGPT hiển thị văn bản chạy dần trên màn hình.</p>
     *
     * <p><b>Luồng hoạt động chi tiết:</b></p>
     * <ol>
     *   <li>Frontend gửi POST request kèm nội dung câu hỏi của người dùng.</li>
     *   <li>Backend lưu tin nhắn User vào DB (đồng bộ — rất nhanh, ~5ms).</li>
     *   <li>Backend tạo SseEmitter (kết nối mở 2 phút) và bắt đầu stream.</li>
     *   <li>ChatService kết nối tới AI Service (FastAPI), nhận từng token phản hồi.</li>
     *   <li>Mỗi token nhận được sẽ lập tức được đẩy qua SseEmitter về Frontend.</li>
     *   <li>Khi stream xong: gửi sự kiện "[DONE]", lưu lịch sử Bot message bất đồng bộ.</li>
     * </ol>
     *
     * <p><b>Ví dụ request:</b></p>
     * <pre>POST /api/v1/chat/stream?sessionId=abc123-uuid</pre>
     * <pre>Body: {"message": "Top 5 quán phở ngon ở Hà Nội"}</pre>
     *
     * <p><b>Ví dụ response (SSE stream):</b></p>
     * <pre>
     *   event: message
     *   data: Dưới đây
     *
     *   event: message
     *   data:  là top 5
     *
     *   event: message
     *   data:  quán phở...
     *
     *   event: done
     *   data: [DONE]
     * </pre>
     *
     * @param sessionId UUID phiên chat đang hoạt động (truyền qua query param).
     * @param request   DTO chứa nội dung câu hỏi của người dùng.
     * @return SseEmitter — kênh dữ liệu streaming liên tục theo giao thức text/event-stream.
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            @RequestParam UUID sessionId,
            @RequestBody ChatStreamRequest request) {

        // Tạo SseEmitter với timeout 2 phút (120.000ms)
        // Nếu AI Service không phản hồi trong thời gian này, kết nối sẽ tự đóng
        SseEmitter emitter = new SseEmitter(120_000L);

        // Lưu tin nhắn của User vào DB đồng bộ (thao tác rất nhanh ~5ms)
        chatService.saveMessage(sessionId, "USER", request.getMessage(), null);

        // Khởi chạy streaming AI trên thread riêng biệt (chatTaskExecutor)
        // Không block thread Tomcat chính, server vẫn phục vụ request khác bình thường
        chatService.streamAiResponse(emitter, sessionId, request.getMessage());

        return emitter;
    }

    // =========================================================================
    // DTO — CÁC LỚP CHUYỂN ĐỔI DỮ LIỆU (DATA TRANSFER OBJECTS)
    // =========================================================================

    /**
     * DTO dùng cho endpoint SSE Streaming (/chat/stream).
     *
     * <p>Chứa duy nhất trường "message" — nội dung câu hỏi/yêu cầu
     * của người dùng gửi cho AI Chatbot xử lý.</p>
     */
    public static class ChatStreamRequest {
        /** Nội dung tin nhắn người dùng gửi (tiếng Việt tự nhiên). */
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    /**
     * DTO dùng cho endpoint lưu tin nhắn đồng bộ (/sessions/{id}/messages).
     *
     * <p>Đóng gói 3 trường dữ liệu:</p>
     * <ul>
     *   <li><b>senderType:</b> Ai gửi tin — "USER" (khách hàng) hoặc "BOT" (hệ thống AI).</li>
     *   <li><b>content:</b> Nội dung văn bản chính của tin nhắn.</li>
     *   <li><b>metadata:</b> Trường JSONB tùy chọn — VD: danh sách ID quán ăn AI gợi ý.</li>
     * </ul>
     */
    public static class MessageRequest {
        /** Nguồn gốc tin nhắn: "USER" hoặc "BOT". */
        private String senderType;

        /** Nội dung text của tin nhắn. */
        private String content;

        /** Dữ liệu mở rộng dạng JSON (nullable). VD: danh sách ID địa điểm AI gợi ý. */
        private String metadata;

        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { this.metadata = metadata; }
    }
}
