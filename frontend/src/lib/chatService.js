/**
 * chatService.js — Dịch vụ API quản lý cuộc trò chuyện với AI.
 *
 * Module này chứa các hàm gọi API liên quan đến:
 * - Tạo phiên chat mới (createSession)
 * - Lấy danh sách phiên chat của user (getUserSessions)
 * - Lấy tin nhắn trong một phiên (getSessionMessages)
 * - Stream phản hồi AI realtime qua SSE (streamChat)
 *
 * Kiến trúc SSE (Server-Sent Events):
 *   Frontend ---POST---> Backend (Spring Boot) ---POST---> AI Service (FastAPI)
 *              SSE stream <---                  JSON <---
 *   • Frontend dùng native fetch (không phải Axios) vì Axios không hỗ trợ ReadableStream
 *   • Backend nhận kết quả từ AI Service, "bọc" lại thành SSE stream gửi về Frontend
 *   • Mỗi chunk SSE có dạng: "data: {nội dung}\n\n"
 *   • Kết thúc stream: "data: [DONE]\n\n"
 */
import api, { STORAGE_KEY } from './api';

const chatService = {
  /**
   * Tạo phiên trò chuyện mới cho người dùng.
   *
   * Gọi: POST /api/v1/sessions/user/{userId}
   * Body: Chuỗi tin nhắn đầu tiên (text/plain)
   *
   * Khi người dùng gõ tin nhắn đầu tiên, cần tạo session trước
   * rồi mới stream AI response qua sessionId đó.
   *
   * @param {string} userId         - UUID của người dùng (lấy từ useAuth hook)
   * @param {string} initialMessage - Nội dung tin nhắn đầu tiên
   * @returns {Promise<Object>} ChatSession mới { id, userId, createdAt, ... }
   */
  async createSession(userId, initialMessage) {
    const response = await api.post(`/v1/sessions/user/${userId}`, initialMessage, {
      headers: { 'Content-Type': 'text/plain' },
    });
    return response.data;
  },

  /**
   * Lấy tất cả phiên trò chuyện của một người dùng.
   *
   * Gọi: GET /api/v1/sessions/user/{userId}
   *
   * Dùng cho ChatHistoryPage — hiển thị danh sách lịch sử trò chuyện.
   *
   * @param {string} userId - UUID của người dùng
   * @returns {Promise<Array>} Danh sách ChatSession, sắp xếp theo thời gian mới nhất
   */
  async getUserSessions(userId) {
    const response = await api.get(`/v1/sessions/user/${userId}`);
    return response.data;
  },

  /**
   * Lấy tất cả tin nhắn trong một phiên trò chuyện cụ thể.
   *
   * Gọi: GET /api/v1/sessions/{sessionId}/messages
   *
   * Dùng khi người dùng mở lại một cuộc trò chuyện cũ từ lịch sử.
   *
   * @param {string} sessionId - ID của phiên trò chuyện
   * @returns {Promise<Array>} Danh sách Message { id, content, role, createdAt, ... }
   *                           role = 'USER' hoặc 'ASSISTANT'
   */
  async getSessionMessages(sessionId) {
    const response = await api.get(`/v1/sessions/${sessionId}/messages`);
    return response.data;
  },

  /**
   * Stream phản hồi AI realtime qua Server-Sent Events (SSE).
   *
   * Gọi: POST /api/v1/chat/stream?sessionId=...
   * Body: { message: string }
   *
   * ĐẶC BIỆT: Dùng native fetch thay vì Axios vì:
   * - Axios KHÔNG hỗ trợ ReadableStream (response.body.getReader())
   * - SSE cần đọc dữ liệu từng chunk khi nó đến, không đợi toàn bộ response
   *
   * Luồng hoạt động:
   *   1. Gửi POST request kèm JWT token trong header
   *   2. Backend trả response dạng stream (Transfer-Encoding: chunked)
   *   3. Frontend đọc từng chunk qua ReadableStream reader
   *   4. Parse mỗi chunk theo format SSE: "data: {nội dung}"
   *   5. Gọi onChunk(nội dung) cho mỗi token nhận được → hiển thị ngay trên giao diện
   *   6. Khi nhận "data: [DONE]" → gọi onDone() → AI đã trả lời xong
   *
   * @param {string} sessionId   - ID phiên trò chuyện (tạo bởi createSession)
   * @param {string} message     - Tin nhắn của người dùng
   * @param {Object} callbacks   - 3 callback functions:
   * @param {Function} callbacks.onChunk - Gọi khi nhận được mỗi "mảnh" text từ AI
   *                                       Ví dụ: onChunk("Xin") → onChunk(" chào") → hiển thị "Xin chào"
   * @param {Function} callbacks.onDone  - Gọi khi AI trả lời xong hoàn toàn
   * @param {Function} callbacks.onError - Gọi khi có lỗi (mất kết nối, timeout, ...)
   */
  async streamChat(sessionId, message, { onChunk, onDone, onError }) {
    try {
      // Lấy JWT token từ localStorage để gắn vào header Authorization
      let token = '';
      try {
        const userData = localStorage.getItem(STORAGE_KEY);
        if (userData) {
          token = JSON.parse(userData).token || '';
        }
      } catch (e) {
        console.error('[ChatService] Lỗi đọc token:', e);
      }

      // Gửi POST request — dùng native fetch (KHÔNG phải Axios)
      const response = await fetch(`/api/v1/chat/stream?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message }),
      });

      // Kiểm tra HTTP status — nếu không phải 2xx thì ném lỗi
      if (!response.ok) {
        throw new Error(`Lỗi stream: HTTP ${response.status}`);
      }

      // Đọc stream bằng ReadableStream API
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // Buffer để ghép các chunk chưa hoàn chỉnh

      // Vòng lặp đọc stream — chạy cho đến khi stream kết thúc
      while (true) {
        const { done, value } = await reader.read();

        // Stream kết thúc (server đóng connection)
        if (done) {
          onDone?.();
          break;
        }

        // Decode bytes thành text và ghép vào buffer
        buffer += decoder.decode(value, { stream: true });

        // Tách buffer thành các dòng theo ký tự xuống dòng
        const lines = buffer.split('\n');

        // Dòng cuối cùng có thể chưa hoàn chỉnh → giữ lại trong buffer
        buffer = lines.pop() || '';

        // Xử lý từng dòng SSE
        for (const line of lines) {
          // Chỉ xử lý dòng bắt đầu bằng "data: " (chuẩn SSE format)
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim(); // Cắt bỏ "data: " lấy nội dung

            // "[DONE]" = tín hiệu kết thúc stream từ backend
            if (data === '[DONE]') {
              onDone?.();
              return;
            }

            // Gọi callback với nội dung text nhận được
            if (data) {
              onChunk?.(data);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ChatService] Lỗi stream:', error);
      onError?.(error.message || 'Lỗi kết nối với AI');
    }
  },
};

export default chatService;
