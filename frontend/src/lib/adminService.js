/**
 * adminService.js — Service layer gọi Admin API endpoints.
 * Prefix: /api/v1/admin
 * Tất cả requests đều gửi kèm JWT token qua header Authorization.
 */
import api from './api';

const ADMIN_BASE = '/v1/admin';

const adminService = {
  /**
   * Lấy danh sách users có phân trang + search.
   * @param {number} page - Trang hiện tại (mặc định 0)
   * @param {number} size - Số lượng mỗi trang (mặc định 10)
   * @param {string} search - Từ khóa tìm kiếm (optional)
   * @returns {{ content, totalElements, totalPages, page }}
   */
  async getUsers(page = 0, size = 10, search = '') {
    const params = { page, size };
    if (search) params.search = search;
    const response = await api.get(`${ADMIN_BASE}/users`, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết 1 user.
   * @param {string} id - UUID user
   */
  async getUserById(id) {
    const response = await api.get(`${ADMIN_BASE}/users/${id}`);
    return response.data;
  },

  /**
   * Admin tạo user mới.
   * @param {Object} userData - { username, email, password, fullName, role, status }
   */
  async createUser(userData) {
    const response = await api.post(`${ADMIN_BASE}/users`, userData);
    return response.data;
  },

  /**
   * Admin cập nhật user.
   * @param {string} id - UUID user
   * @param {Object} userData - Fields cần cập nhật
   */
  async updateUser(id, userData) {
    const response = await api.put(`${ADMIN_BASE}/users/${id}`, userData);
    return response.data;
  },

  /**
   * Admin xóa user.
   * @param {string} id - UUID user
   */
  async deleteUser(id) {
    const response = await api.delete(`${ADMIN_BASE}/users/${id}`);
    return response.data;
  },

  /**
   * Toggle trạng thái user (ACTIVE ↔ INACTIVE).
   * @param {string} id - UUID user
   */
  async toggleUserStatus(id) {
    const response = await api.patch(`${ADMIN_BASE}/users/${id}/status`);
    return response.data;
  },

  /**
   * Lấy thống kê tổng quan hệ thống.
   * @returns {{ totalUsers, activeUsers, inactiveUsers, adminUsers }}
   */
  async getStats() {
    const response = await api.get(`${ADMIN_BASE}/stats`);
    return response.data;
  }
};

export default adminService;
