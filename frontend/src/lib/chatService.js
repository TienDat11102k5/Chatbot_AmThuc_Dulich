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
   * Backend gửi các SSE event types:
   *   - event: message  → text chunk (typing effect)
   *   - event: metadata → recommendations + intent (JSON)
   *   - event: error    → error message from server
   *   - event: done     → stream finished
   *
   * @param {string} sessionId   - ID phiên trò chuyện
   * @param {string} message     - Tin nhắn của người dùng
   * @param {Object} callbacks   - Callback functions
   * @param {Function} callbacks.onChunk    - Nhận text chunk (typing effect)
   * @param {Function} callbacks.onMetadata - Nhận metadata { recommendations, intent }
   * @param {Function} callbacks.onDone     - Stream hoàn tất
   * @param {Function} callbacks.onError    - Có lỗi xảy ra
   * @param {AbortSignal} [signal] - Optional AbortController signal for cleanup
   * @returns {Function} abort - Call to cancel the stream
   */
  streamChat(sessionId, message, { onChunk, onMetadata, onDone, onError }, signal) {
    // AbortController to allow cancellation from outside
    const controller = new AbortController();
    const mergedSignal = signal || controller.signal;

    // If external signal aborts, also abort our controller
    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const execute = async () => {
      try {
        // Get JWT token from localStorage
        let token = '';
        try {
          const userData = localStorage.getItem(STORAGE_KEY);
          if (userData) {
            token = JSON.parse(userData).token || '';
          }
        } catch (e) {
          console.error('[ChatService] Error reading token:', e);
        }

        // Construct the absolute URL using the Axios base URL
        const baseURL = api.defaults.baseURL || '';
        const url = `${baseURL}/v1/chat/stream?sessionId=${sessionId}`;

        // POST request using native fetch (Axios does NOT support ReadableStream)
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ message }),
          signal: mergedSignal,
        });

        if (!response.ok) {
          throw new Error(`Lỗi stream: HTTP ${response.status}`);
        }

        // Read stream via ReadableStream API
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onDone?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          // Parse SSE events — each event has "event:" and "data:" fields
          let currentEventType = 'message'; // default event type
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEventType = line.slice(6).trim();
              continue;
            }

            if (line.startsWith('data:')) {
              // Spring Boot returns `data:payload` (no space after colon).
              // If the chunk is a literal space " ", `line` is `data: `.
              // We must NOT trim or slice the leading space otherwise we delete spaces!
              const data = line.slice(5);

              switch (currentEventType) {
                case 'done':
                  onDone?.();
                  reader.cancel();
                  return;

                case 'error':
                  onError?.(data || 'Lỗi không xác định từ server');
                  reader.cancel();
                  return;

                case 'metadata':
                  // Parse JSON metadata { recommendations, intent }
                  try {
                    const meta = JSON.parse(data);
                    onMetadata?.(meta);
                  } catch (parseErr) {
                    console.warn('[ChatService] Failed to parse metadata:', parseErr);
                  }
                  break;

                case 'message':
                default:
                  if (data && data !== '[DONE]') {
                    try {
                      // Spring Boot is now sending JSON to preserve spaces and newlines
                      // data: {"text": " chunk"}
                      const payload = JSON.parse(data);
                      // VITE FORCE HMR RELOAD LOG
                      console.log('[SSE] Parsed payload:', payload);
                      if (payload && payload.text !== undefined) {
                        onChunk?.(payload.text);
                      }
                    } catch (e) {
                      // Fallback in case of raw text (legacy)
                      onChunk?.(data);
                    }
                  } else if (data === '[DONE]') {
                    onDone?.();
                    reader.cancel();
                    return;
                  }
                  break;
              }

              // Reset event type after processing data line
              currentEventType = 'message';
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('[ChatService] Stream cancelled by user');
          return; // Don't call onError for intentional cancellation
        }
        console.error('[ChatService] Stream error:', error);
        onError?.(error.message || 'Lỗi kết nối với AI');
      }
    };

    execute();

    // Return abort function for cleanup (e.g. component unmount)
    return () => controller.abort();
  },
};

export default chatService;
