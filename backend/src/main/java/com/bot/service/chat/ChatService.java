package com.bot.service.chat;

import com.bot.entity.ChatSession;
import com.bot.entity.Message;
import com.bot.entity.User;
import com.bot.repository.ChatSessionRepository;
import com.bot.repository.MessageRepository;
import com.bot.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý toàn bộ các nghiệp vụ liên quan đến hệ thống Chat:
 *
 * <p>Bao gồm 3 nhóm chức năng chính:</p>
 * <ul>
 *   <li><b>Quản lý Phiên chat (Session):</b> Tạo mới, truy vấn lịch sử các phiên hội thoại của người dùng.</li>
 *   <li><b>Quản lý Tin nhắn (Message):</b> Lưu trữ đồng bộ/bất đồng bộ tin nhắn của cả USER và BOT vào PostgreSQL.</li>
 *   <li><b>Streaming phản hồi AI (SSE):</b> Kết nối với Python AI Service (FastAPI) để nhận dữ liệu từng token
 *       và đẩy ngay về Frontend qua giao thức Server-Sent Events, mang lại trải nghiệm "gõ phím" thời gian thực.</li>
 * </ul>
 *
 * <p><b>Kiến trúc luồng dữ liệu:</b></p>
 * <pre>
 *   Frontend (ReactJS) → ChatController → ChatService → AI Service (FastAPI/Python)
 *                                              ↓
 *                                     PostgreSQL (messages)
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    /** Repository thao tác với bảng chat_sessions trong PostgreSQL. */
    private final ChatSessionRepository chatSessionRepository;

    /** Repository thao tác với bảng messages trong PostgreSQL. */
    private final MessageRepository messageRepository;

    /** Repository thao tác với bảng users trong PostgreSQL. */
    private final UserRepository userRepository;

    /**
     * URL kết nối tới AI Service (FastAPI).
     * Mặc định là http://localhost:8000 khi chạy local.
     * Khi chạy Docker sẽ được ghi đè bởi biến môi trường AI_SERVICE_URL.
     */
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    // =========================================================================
    // 1. QUẢN LÝ PHIÊN CHAT (SESSION MANAGEMENT)
    // =========================================================================

    /**
     * Khởi tạo một phiên Chat (Session) hoàn toàn mới khi người dùng bắt đầu cuộc hội thoại.
     *
     * <p><b>Quy trình xử lý:</b></p>
     * <ol>
     *   <li>Kiểm tra sự tồn tại của User bằng UUID — nếu không tìm thấy sẽ ném ngoại lệ.</li>
     *   <li>Tự động sinh tiêu đề phiên chat từ câu hỏi đầu tiên (cắt ngắn tối đa 50 ký tự).</li>
     *   <li>Đánh dấu phiên là "đang hoạt động" (is_active = true) và ghi nhận thời gian khởi tạo.</li>
     *   <li>Lưu vào PostgreSQL thông qua JPA Repository.</li>
     * </ol>
     *
     * @param userId         Mã UUID của User đang khởi xướng phiên hội thoại.
     * @param initialMessage Chuỗi văn bản câu hỏi đầu tiên gửi lên (dùng để sinh tiêu đề).
     * @return Đối tượng ChatSession đã được lưu thành công vào database.
     * @throws IllegalArgumentException Nếu không tìm thấy User với UUID đã cung cấp.
     */
    // Xóa cache danh sách session của user ngay khi tạo session mới
    // → Lần đọc tiếp theo sẽ lấy dữ liệu mới nhất từ DB thay vì cache cũ
    @Caching(evict = {
            @CacheEvict(value = "chat_sessions", key = "#userId")
    })
    @Transactional
    public ChatSession createSession(UUID userId, String initialMessage) {
        // Bước 1: Xác minh User tồn tại trong hệ thống
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User với ID: " + userId));

        // Bước 2: Xây dựng đối tượng phiên Chat mới
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(initialMessage.length() > 50
                        ? initialMessage.substring(0, 50) + "..."  // Cắt ngắn nếu quá dài
                        : initialMessage)
                .isActive(true)
                .startTime(LocalDateTime.now())
                .build();

        // Bước 3: Lưu phiên vào PostgreSQL và trả về kết quả
        return chatSessionRepository.save(session);
    }

    /**
     * Trích xuất danh sách tất cả các phiên hội thoại (Chat Session) do một User sở hữu.
     *
     * <p>Kết quả được sắp xếp theo thời gian khởi tạo giảm dần (phiên mới nhất hiển thị trước),
     * phục vụ cho việc render thanh sidebar lịch sử chat bên Frontend.</p>
     *
     * @param userId Mã UUID đại diện cho User cần truy vấn.
     * @return Danh sách ChatSession sắp xếp giảm dần theo thời gian. Nếu chưa có phiên nào, trả về danh sách rỗng.
     */
    // Cache danh sách phiên chat của user vào Redis (TTL 15 phút)
    // Key = userId → Mỗi user có vùng cache riêng biệt
    // Khi tạo session mới → @CacheEvict ở createSession() tự xóa cache này
    @Cacheable(value = "chat_sessions", key = "#userId")
    public List<ChatSession> getUserSessions(UUID userId) {
        return chatSessionRepository.findAllByUserIdOrderByStartTimeDesc(userId);
    }

    // =========================================================================
    // 2. QUẢN LÝ TIN NHẮN (MESSAGE MANAGEMENT)
    // =========================================================================

    /**
     * Truy xuất toàn bộ lịch sử tin nhắn trong một phiên hội thoại cụ thể.
     *
     * <p>Sắp xếp theo thứ tự thời gian tăng dần (tin cũ nhất hiển thị trước),
     * giúp Frontend render đúng trình tự cuộc hội thoại giữa User và Bot.</p>
     *
     * @param sessionId Định danh UUID của phiên Chat cần lấy lịch sử.
     * @return Danh sách Message theo thứ tự thời gian tăng dần.
     */
    // Cache lịch sử tin nhắn của một phiên vào Redis (TTL 10 phút)
    // Key = sessionId → Mỗi phiên chat có vùng cache riêng biệt
    // Khi có tin nhắn mới → @CacheEvict ở saveMessage() tự xóa cache này
    @Cacheable(value = "chat_history", key = "#sessionId")
    public List<Message> getSessionMessages(UUID sessionId) {
        return messageRepository.findAllBySessionIdOrderByTimestampAsc(sessionId);
    }

    /**
     * Lưu trữ một tin nhắn (Message) vào dòng thời gian của phiên hội thoại.
     *
     * <p><b>Phạm vi sử dụng:</b> Được gọi cho cả tin nhắn của User (khi gửi câu hỏi)
     * lẫn tin nhắn của Bot (sau khi AI sinh xong toàn bộ phản hồi).</p>
     *
     * <p><b>Quy trình xử lý:</b></p>
     * <ol>
     *   <li>Xác minh phiên Chat tồn tại trong database.</li>
     *   <li>Xây dựng đối tượng Message với đầy đủ thông tin (ai gửi, nội dung, metadata).</li>
     *   <li>Ghi nhận vào PostgreSQL. Cột timestamp sẽ tự động sinh bởi @CreationTimestamp.</li>
     * </ol>
     *
     * @param sessionId  UUID của phiên Chat đích.
     * @param senderType Xác định người gửi: "USER" (khách hàng) hoặc "BOT" (hệ thống AI).
     * @param content    Nội dung text của tin nhắn.
     * @param metadata   Chuỗi JSON bổ sung (VD: danh sách ID quán ăn gợi ý). Có thể null.
     * @return Đối tượng Message đã được lưu thành công, bao gồm ID và timestamp tự sinh.
     * @throws IllegalArgumentException Nếu không tìm thấy phiên Chat với sessionId đã cung cấp.
     */
    // Xóa cache lịch sử tin nhắn của session ngay khi lưu tin nhắn mới
    // → Lần đọc tiếp theo sẽ trả về đầy đủ dữ liệu bao gồm tin nhắn vừa lưu
    @CacheEvict(value = "chat_history", key = "#sessionId")
    @Transactional
    public Message saveMessage(UUID sessionId, String senderType, String content, String metadata) {
        // Bước 1: Xác minh phiên Chat tồn tại
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiên Chat với ID: " + sessionId));

        // Bước 2: Tạo đối tượng Message
        Message message = Message.builder()
                .session(session)
                .senderType(senderType)
                .content(content)
                .metadata(metadata)
                .build();

        // Bước 3: Lưu vào PostgreSQL
        return messageRepository.save(message);
    }

    /**
     * Lưu tin nhắn BẤT ĐỒNG BỘ (Async) vào Database.
     *
     * <p><b>Mục đích:</b> Được gọi từ SSE streaming endpoint để tách việc ghi DB
     * ra khỏi luồng phản hồi chính. Nhờ vậy, người dùng không phải chờ
     * thao tác INSERT SQL hoàn tất mới được xem tin nhắn tiếp theo.</p>
     *
     * <p><b>Thread pool:</b> Chạy trên "chatTaskExecutor" (core=5 threads, max=20 threads)
     * được cấu hình tại {@link com.bot.config.AsyncConfig}.</p>
     *
     * <p><b>Xử lý lỗi:</b> Nếu lưu thất bại (VD: mất kết nối DB), lỗi sẽ được ghi log
     * thay vì ném exception lên tầng Controller, tránh ảnh hưởng tới trải nghiệm streaming.</p>
     *
     * @param sessionId  UUID phiên chat.
     * @param senderType "USER" hoặc "BOT".
     * @param content    Nội dung text đầy đủ.
     * @param metadata   JSON metadata bổ sung (nullable).
     */
    @Async("chatTaskExecutor")
    @Transactional
    public void saveMessageAsync(UUID sessionId, String senderType, String content, String metadata) {
        try {
            saveMessage(sessionId, senderType, content, metadata);
            log.info("[Async] Đã lưu tin nhắn {} cho phiên {}", senderType, sessionId);
        } catch (Exception e) {
            log.error("[Async] Lỗi khi lưu tin nhắn cho phiên {}: {}", sessionId, e.getMessage());
        }
    }

    // =========================================================================
    // 3. STREAMING PHẢN HỒI AI (SSE STREAMING)
    // =========================================================================

    /**
     * Kết nối với AI Service (FastAPI/Python) và stream phản hồi về Frontend qua SSE.
     *
     * <p><b>Luồng hoạt động chi tiết:</b></p>
     * <ol>
     *   <li>Mở kết nối HTTP POST tới endpoint "/api/chat/stream" của AI Service.</li>
     *   <li>Gửi nội dung tin nhắn User dưới dạng JSON payload.</li>
     *   <li>Đọc response từng dòng (line-by-line) — mỗi dòng là một token/đoạn text ngắn từ AI.</li>
     *   <li>Mỗi token nhận được sẽ lập tức được đẩy qua SseEmitter về cho Frontend hiển thị.</li>
     *   <li>Đồng thời, các token được gom lại vào StringBuilder để tạo nội dung hoàn chỉnh.</li>
     *   <li>Khi stream kết thúc: gửi sự kiện "[DONE]" cho Frontend, và lưu toàn bộ phản hồi Bot
     *       vào Database bất đồng bộ (Async) qua method {@link #saveMessageAsync}.</li>
     * </ol>
     *
     * <p><b>Xử lý lỗi:</b> Nếu AI Service không phản hồi hoặc gặp lỗi kết nối,
     * hệ thống sẽ gửi thông báo lỗi qua SSE và đóng kết nối một cách an toàn (Graceful Degradation).</p>
     *
     * <p><b>Hiệu năng:</b> Phương thức này chạy trên thread riêng biệt (chatTaskExecutor),
     * không block thread chính của Tomcat, đảm bảo server vẫn phục vụ được các request khác.</p>
     *
     * @param emitter   Đối tượng SseEmitter dùng để đẩy dữ liệu về Frontend theo giao thức SSE.
     * @param sessionId UUID phiên chat hiện tại — dùng để lưu lịch sử Bot message sau khi stream xong.
     * @param userMessage Nội dung câu hỏi/yêu cầu của người dùng cần gửi cho AI xử lý.
     */
    @Async("chatTaskExecutor")
    public void streamAiResponse(SseEmitter emitter, UUID sessionId, String userMessage) {
        // StringBuilder to accumulate the full AI response text
        StringBuilder fullResponse = new StringBuilder();
        ObjectMapper mapper = new ObjectMapper();

        try {
            // -----------------------------------------------------------------
            // Step 1: Open HTTP POST connection to AI Service (FastAPI JSON API)
            // -----------------------------------------------------------------
            URI uri = URI.create(aiServiceUrl + "/api/v1/ai/chat");
            HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);
            connection.setConnectTimeout(10_000);   // Connection timeout: 10s
            connection.setReadTimeout(120_000);      // Read timeout: 2 min

            // -----------------------------------------------------------------
            // Step 2: Send user message as JSON using ObjectMapper (safe encoding)
            // -----------------------------------------------------------------
            Map<String, Object> body = new HashMap<>();
            body.put("message", userMessage);
            body.put("session_id", sessionId.toString());
            byte[] jsonBytes = mapper.writeValueAsBytes(body);
            try (OutputStream os = connection.getOutputStream()) {
                os.write(jsonBytes);
                os.flush();
            }

            // -----------------------------------------------------------------
            // Step 3: Read full JSON response from AI Service
            // -----------------------------------------------------------------
            StringBuilder jsonResponse = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    jsonResponse.append(line);
                }
            }

            // Parse JSON — field "message" (NOT "response")
            JsonNode root = mapper.readTree(jsonResponse.toString());
            String aiMessage = root.has("message") ? root.get("message").asText() : "";
            JsonNode recommendations = root.get("recommendations");
            String intent = root.has("intent") ? root.get("intent").asText() : "";

            // -----------------------------------------------------------------
            // Step 4: Simulate streaming — split into ~4-word chunks, 50ms delay
            // OK to use Thread.sleep() because this method runs on chatTaskExecutor
            // -----------------------------------------------------------------
            String[] words = aiMessage.split("(?<=\\s)");
            StringBuilder chunk = new StringBuilder();
            for (int i = 0; i < words.length; i++) {
                chunk.append(words[i]);
                if ((i + 1) % 4 == 0 || i == words.length - 1) {
                    emitter.send(SseEmitter.event().name("message").data(chunk.toString()));
                    chunk.setLength(0);
                    Thread.sleep(50);
                }
            }
            fullResponse.append(aiMessage);

            // -----------------------------------------------------------------
            // Step 5: Send metadata event (recommendations + intent) for map pins
            // -----------------------------------------------------------------
            if (recommendations != null && !recommendations.isEmpty()) {
                emitter.send(SseEmitter.event()
                        .name("metadata")
                        .data(mapper.writeValueAsString(Map.of(
                                "recommendations", recommendations,
                                "intent", intent
                        ))));
            }

            // -----------------------------------------------------------------
            // Step 6: Stream complete — send done event and save to DB
            // -----------------------------------------------------------------
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();

            // Save bot response to database SYNCHRONOUSLY (already on async thread)
            // NOTE: Do NOT call saveMessageAsync() here — Spring proxy does not
            // intercept self-invocation, so @Async within same class is a no-op
            if (!fullResponse.isEmpty()) {
                saveMessage(sessionId, "BOT", fullResponse.toString(), null);
            }

            log.info("[Stream] Hoàn tất streaming cho phiên {} — {} ký tự", sessionId, fullResponse.length());

        } catch (Exception e) {
            // -----------------------------------------------------------------
            // Error handling: notify Frontend and close connection gracefully
            // -----------------------------------------------------------------
            log.error("[Stream] Lỗi khi streaming AI cho phiên {}: {}", sessionId, e.getMessage());
            try {
                emitter.send(SseEmitter.event()
                        .name("error")
                        .data("Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau."));
                emitter.completeWithError(e);
            } catch (Exception sendError) {
                log.error("[Stream] Không thể gửi thông báo lỗi về Frontend: {}", sendError.getMessage());
            }
        }
    }

    // =========================================================================
    // TIỆN ÍCH NỘI BỘ (PRIVATE UTILITIES)
    // =========================================================================

    // escapeJson() method REMOVED — replaced by ObjectMapper for safe JSON encoding
}
