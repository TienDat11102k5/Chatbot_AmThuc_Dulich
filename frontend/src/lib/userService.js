/**
 * userService.js — Dịch vụ API quản lý thông tin người dùng.
 *
 * Module này chứa các hàm gọi API liên quan đến:
 * - Lấy thông tin hồ sơ người dùng (getUserById)
 * - Cập nhật cài đặt và tùy chọn cá nhân (updatePreferences)
 * - Tạo người dùng mới — chỉ dành cho Admin (createUser)
 *
 * Phân biệt với authService:
 * - authService: xử lý đăng nhập/đăng ký (KHÔNG cần JWT)
 * - userService: xử lý thông tin user sau khi đã đăng nhập (CẦN JWT)
 *
 * Sử dụng trong các trang:
 * - ProfilePage: hiển thị thông tin cá nhân
 * - SettingsPage: cập nhật cài đặt
 * - UserManagement (Admin): quản lý danh sách người dùng
 */
import api from './api';

const userService = {
  /**
   * Lấy thông tin một người dùng theo ID.
   *
   * Gọi: GET /api/v1/users/{id}
   *
   * Dùng cho ProfilePage — hiển thị chi tiết hồ sơ: họ tên, email,
   * ngày tham gia, ảnh đại diện, số lượng yêu thích, v.v.
   *
   * @param {string} id - UUID của người dùng
   * @returns {Promise<Object>} User { id, username, email, role, createdAt, preferences, ... }
   */
  async getUserById(id) {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật tùy chọn cá nhân (preferences) của người dùng.
   *
   * Gọi: PUT /api/v1/users/{id}/preferences
   * Body: JSON object chứa các key-value tùy chọn
   *
   * Ví dụ preferences:
   * {
   *   language: 'vi',
   *   theme: 'dark',
   *   notifications: true,
   *   dietaryPreferences: ['vegetarian', 'seafood']
   * }
   *
   * @param {string} id          - UUID của người dùng
   * @param {Object} preferences - Object chứa các tùy chọn cần cập nhật
   * @returns {Promise<Object>} User đã cập nhật
   */
  async updatePreferences(id, preferences) {
    const response = await api.put(`/v1/users/${id}/preferences`, preferences);
    return response.data;
  },

  /**
   * Tạo người dùng mới — CHỈ DÀNH CHO ADMIN.
   *
   * Gọi: POST /api/v1/users
   * Body: { username: string, email: string, password: string, role: string }
   *
   * Admin tạo tài khoản cho người dùng mới qua trang UserManagement.
   * Khác với register ở chỗ:
   * - Register: người dùng tự đăng ký, role mặc định là USER
   * - createUser: admin tạo, có thể chỉ định role (USER, EDITOR, ADMIN)
   *
   * @param {Object} userData - Thông tin người dùng mới
   * @param {string} userData.username - Tên đăng nhập
   * @param {string} userData.email    - Email
   * @param {string} userData.password - Mật khẩu
   * @param {string} userData.role     - Phân quyền: 'USER' | 'EDITOR' | 'ADMIN'
   * @returns {Promise<Object>} User mới tạo { id, username, email, role, createdAt }
   * @throws {AxiosError} 403 nếu không phải Admin, 409 nếu username/email đã tồn tại
   */
  async createUser(userData) {
    const response = await api.post('/v1/users', userData);
    return response.data;
  },
};

export default userService;
