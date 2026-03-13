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

/**
 * Service xử lý các nghiệp vụ liên quan đến Chat:
 * Quản lý phiên chat (Session) và tin nhắn (Message).
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    /**
     * Khởi tạo một phiên Chat (Session) hoàn toàn mới khi người dùng bắt đầu cuộc hội thoại.
     * Tiêu đề của khung phiên Chat được tự động suy diễn cắt ngắn dựa trên nội dung tin đầu (tối đa 50 ký tự).
     * 
     * @param userId Mã UUID của User khởi xướng phiên.
     * @param initialMessage Chuỗi câu hỏi văn bản đầu tiên gửi lên.
     * @return Đối tượng ChatSession chứa logic phiên cập nhật vào database.
     * @throws IllegalArgumentException Nếu thông tin User truy vấn bị vô hiệu hóa/ không xuất hiện.
     */
    @Transactional
    public ChatSession createSession(UUID userId, String initialMessage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User"));

        ChatSession session = ChatSession.builder()
                .user(user)
                .title(initialMessage.length() > 50 ? initialMessage.substring(0, 50) + "..." : initialMessage)
                .isActive(true)
                .startTime(LocalDateTime.now())
                .build();
        
        return chatSessionRepository.save(session);
    }

    /**
     * Trích xuất danh sách tất cả các luồng hội thoại (phiên Chat) do một User sở hữu cụ thể.
     * Hữu ích cho việc render thanh menu lịch sử sidebar. Vị trí ưu tiên theo thứ tự thời gian phi tuyến tính mới nhất.
     * 
     * @param userId Mã UUID đại diện cho User.
     * @return Tập hợp danh sách ChatSession theo mảng tuyến tính giảm dần thời gian.
     */
    public List<ChatSession> getUserSessions(UUID userId) {
        return chatSessionRepository.findAllByUserIdOrderByStartTimeDesc(userId);
    }

    /**
     * Phân tải chi tiết lịch sử tin nhắn trong nội hàm một phiên hội thoại xác lập.
     * Sắp xếp theo thứ tự thời gian tăng dần, giúp view UI chat hiện tiến trình chat chính xác.
     * 
     * @param sessionId Định danh phân biệt của phiên Chat trên DB (UUID).
     * @return Danh sách tin nhắn logic thu nhỏ trong mảng Message.
     */
    public List<Message> getSessionMessages(UUID sessionId) {
        return messageRepository.findAllBySessionIdOrderByTimestampAsc(sessionId);
    }

    /**
     * Đẩy và lưu trữ một thông điệp (Message) vào dòng timeline của một Session hội thoại.
     * Áp dụng lưu vết được đồng thời thông điệp của cả hai mảng chủ thể: User / Bot AI.
     * 
     * @param sessionId UUID của luồng phiên Chat thụ hưởng đích.
     * @param senderType Độc quyền 2 giá trị: "USER" (Khách) hoặc "BOT" (Hệ thống điều vận GPT AI).
     * @param content Nội dung thông tin Text rõ nghĩa.
     * @param metadata Chuỗi JSON chứa Card, danh sách Places ID, hoặc logic tham chiếu mở rộng nếu chatbot trả về.
     * @return Thực thể model thao tác sau khi Push trạng thái an toàn.
     * @throws IllegalArgumentException Cảnh báo rỗng khi session UUID không tồn tại hay đã rớt logic.
     */
    @Transactional
    public Message saveMessage(UUID sessionId, String senderType, String content, String metadata) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiên Chat (Session)"));

        Message message = Message.builder()
                .session(session)
                .senderType(senderType)
                .content(content)
                .metadata(metadata)
                .build();
        
        return messageRepository.save(message);
    }
}
