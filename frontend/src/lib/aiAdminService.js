/**
 * aiAdminService.js — Service layer gọi API admin AI từ Frontend.
 *
 * Dùng Axios instance đã có (api.js) → tự động đính JWT token.
 * Prefix: /v1/admin/ai (Backend sẽ kiểm tra quyền ADMIN)
 *
 * 3 hàm:
 * - getStats()   → Thống kê tổng quan AI
 * - getUsers()   → Danh sách users đã chat AI (phân trang)
 * - getIntents() → Danh sách intents + mẫu câu huấn luyện
 */
import api from './api';

const BASE = '/v1/admin/ai';

const aiAdminService = {
  /**
   * Lấy thống kê AI: số intents, mẫu câu, cache hit rate
   */
  getStats: async () => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },

  /**
   * Lấy danh sách users đã tương tác AI chatbot (phân trang)
   * @param {number} page - Trang hiện tại (bắt đầu từ 0)
   * @param {number} size - Số users mỗi trang
   */
  getUsers: async (page = 0, size = 8) => {
    const res = await api.get(`${BASE}/users`, { params: { page, size } });
    return res.data;
  },

  /**
   * Lấy danh sách intents + mẫu câu huấn luyện
   */
  getIntents: async () => {
    const res = await api.get(`${BASE}/intents`);
    return res.data;
  },
};

export default aiAdminService;
