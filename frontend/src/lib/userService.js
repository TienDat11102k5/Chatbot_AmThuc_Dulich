/**
 * userService.js — Dịch vụ API quản lý thông tin người dùng.
 *
 * Module này chứa các hàm gọi API liên quan đến:
 * - GET /me: Lấy thông tin user đang đăng nhập (dùng JWT)
 * - GET /{id}: Lấy thông tin user theo UUID
 * - PUT /{id}/profile: Cập nhật thông tin hồ sơ (fullName, username, email)
 * - PUT /{id}/password: Đổi mật khẩu (cần xác minh mật khẩu cũ)
 * - POST /{id}/avatar: Upload ảnh đại diện từ máy tính lên server
 * - PUT /{id}/preferences: Cập nhật sở thích cá nhân
 */
import api from './api';

const userService = {
  /**
   * Lấy thông tin user đang đăng nhập dựa vào JWT token.
   * Token được tự động gửi kèm qua interceptor trong api.js.
   *
   * GET /api/v1/users/me
   * @returns {Promise<Object>} UserProfileResponse { id, username, email, fullName, avatarUrl, role, createdAt }
   */
  async getCurrentUser() {
    const response = await api.get('/v1/users/me');
    return response.data;
  },

  /**
   * Lấy thông tin user theo UUID.
   *
   * GET /api/v1/users/{id}
   * @param {string} id - UUID của người dùng
   * @returns {Promise<Object>} UserProfileResponse
   */
  async getUserById(id) {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân.
   *
   * PUT /api/v1/users/{id}/profile
   * Body: { fullName, username, email } — các trường không bắt buộc
   *
   * @param {string} id - UUID người dùng
   * @param {Object} data - { fullName?, username?, email? }
   * @returns {Promise<Object>} UserProfileResponse đã cập nhật
   */
  async updateProfile(id, data) {
    const response = await api.put(`/v1/users/${id}/profile`, data);
    return response.data;
  },

  /**
   * Đổi mật khẩu người dùng.
   * Backend sẽ xác minh mật khẩu cũ trước khi đổi.
   *
   * PUT /api/v1/users/{id}/password
   * Body: { currentPassword, newPassword, confirmPassword }
   *
   * @param {string} id - UUID người dùng
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<Object>} { message: "Đổi mật khẩu thành công." }
   * @throws {AxiosError} 400 nếu sai mật khẩu cũ hoặc mật khẩu mới không khớp
   */
  async changePassword(id, data) {
    const response = await api.put(`/v1/users/${id}/password`, data);
    return response.data;
  },

  /**
   * Upload ảnh đại diện (avatar) từ máy tính lên server.
   * Sử dụng FormData để gửi file dạng multipart/form-data.
   * Server lưu file vào src/main/resources/db/uploads/ và trả về URL.
   *
   * POST /api/v1/users/{id}/avatar
   *
   * @param {string} id - UUID người dùng
   * @param {File} file - File ảnh từ input[type="file"]
   * @returns {Promise<Object>} UserProfileResponse với avatarUrl mới
   */
  async uploadAvatar(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Xóa ảnh đại diện (avatar) của người dùng.
   *
   * @param {string} id - UUID người dùng
   * @returns {Promise<Object>} UserProfileResponse với avatarUrl = null
   */
  async removeAvatar(id) {
    const response = await api.delete(`/v1/users/${id}/avatar`);
    return response.data;
  },

  /**
   * Cập nhật sở thích cá nhân hóa (preferences).
   *
   * PUT /api/v1/users/{id}/preferences
   *
   * @param {string} id - UUID người dùng
   * @param {Object} preferences - Object { language, theme, notifications, ... }
   * @returns {Promise<Object>} UserProfileResponse đã cập nhật
   */
  async updatePreferences(id, preferences) {
    const response = await api.put(`/v1/users/${id}/preferences`, preferences);
    return response.data;
  },

  /**
   * Tạo người dùng mới — CHỈ DÀNH CHO ADMIN.
   *
   * POST /api/v1/users
   *
   * @param {Object} userData - { username, email, password, role }
   * @returns {Promise<Object>} UserProfileResponse mới tạo
   */
  async createUser(userData) {
    const response = await api.post('/v1/users', userData);
    return response.data;
  },
};

export default userService;
