/**
 * authService.js — Dịch vụ API xác thực người dùng.
 *
 * Module này chứa tất cả các hàm gọi API liên quan đến:
 * - Đăng nhập (login)
 * - Đăng ký tài khoản mới (register)
 * - Quên mật khẩu — gửi OTP qua email (forgotPassword)
 * - Đặt lại mật khẩu mới (resetPassword)
 *
 * Tất cả đều sử dụng Axios instance từ api.js (đã có JWT interceptor).
 *
 * Luồng xác thực:
 *   1. Người dùng submit form → gọi authService.login/register
 *   2. Backend xác thực → trả về AuthResponse { token, userId, username, email, role }
 *   3. Frontend lưu AuthResponse vào localStorage qua useAuth hook
 *   4. Mọi request sau đó tự động có Bearer token (nhờ api.js interceptor)
 */
import api from './api';

const authService = {
  /**
   * Đăng nhập bằng tên đăng nhập và mật khẩu.
   *
   * Gọi: POST /api/auth/login
   * Body: { username: string, password: string }
   *
   * @param {string} username - Tên đăng nhập (KHÔNG phải email — backend dùng username)
   * @param {string} password - Mật khẩu người dùng
   * @returns {Promise<{token: string, userId: string, username: string, email: string, role: string}>}
   *          AuthResponse từ backend — chứa JWT token và thông tin user
   * @throws {AxiosError} 401 nếu sai credentials, 422 nếu thiếu field
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    // Backend có thể trả về { data: {...} } hoặc flat {...}
    // Unwrap nếu có nested data
    const result = response.data;
    if (result.data && result.data.token) {
      console.log('[authService] Unwrapping nested data from backend');
      return result.data;
    }
    return result;
  },

  /**
   * Đăng ký tài khoản mới.
   *
   * Gọi: POST /api/auth/register
   * Body: { username: string, email: string, password: string }
   *
   * Lưu ý: Sau khi đăng ký thành công, backend TRẢ LUÔN AuthResponse
   * (giống login) → frontend login thẳng, KHÔNG cần bước OTP.
   *
   * @param {string} username - Tên đăng nhập mới (tối thiểu 3 ký tự, không trùng)
   * @param {string} email    - Email (phải hợp lệ, không trùng trong hệ thống)
   * @param {string} password - Mật khẩu (tối thiểu 8 ký tự)
   * @returns {Promise<{token: string, userId: string, username: string, email: string, role: string}>}
   *          AuthResponse — đăng ký xong dùng luôn để login
   * @throws {AxiosError} 409 nếu username/email đã tồn tại, 422 nếu validation fail
   */
  async register(username, email, password) {
    const response = await api.post('/auth/register', { username, email, password });
    const result = response.data;
    if (result.data && result.data.token) {
      return result.data;
    }
    return result;
  },

  /**
   * Yêu cầu gửi mã OTP về email để đặt lại mật khẩu.
   *
   * Gọi: POST /api/auth/forgot-password
   * Body: { email: string }
   *
   * Luồng: Người dùng nhập email → backend gửi OTP qua RabbitMQ → email service gửi mail
   * → Người dùng nhận OTP → điền vào VerifyOTPPage → chuyển sang ResetPasswordPage
   *
   * @param {string} email - Email đã đăng ký trong hệ thống
   * @returns {Promise<string>} Thông báo thành công từ backend
   * @throws {AxiosError} 404 nếu email không tồn tại
   */
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Đặt lại mật khẩu mới sau khi đã xác thực OTP.
   *
   * Gọi: POST /api/auth/reset-password
   * Body: { email: string, otp: string, newPassword: string }
   *
   * Luồng: VerifyOTPPage lưu OTP vào sessionStorage → ResetPasswordPage lấy OTP
   * → gọi hàm này kèm email + OTP + mật khẩu mới → backend verify OTP rồi đổi password
   *
   * @param {string} email       - Email đã đăng ký
   * @param {string} otp         - Mã OTP 6 chữ số đã nhận qua email
   * @param {string} newPassword - Mật khẩu mới (tối thiểu 8 ký tự)
   * @returns {Promise<string>} Thông báo thành công
   * @throws {AxiosError} 400 nếu OTP sai/hết hạn, 422 nếu mật khẩu quá yếu
   */
  async resetPassword(email, otp, newPassword) {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  /**
   * Xác thực thông qua Google (Xác minh ID Token).
   *
   * Gọi: POST /api/auth/google
   * Body: { idToken: string }
   *
   * @param {string} idToken - Token lấy được từ @react-oauth/google
   * @returns {Promise<{token: string, userId: string, username: string, email: string, role: string}>}
   */
  async googleLogin(accessToken) {
    try {
      console.log("[authService] googleLogin with token, configured baseURL:", api.defaults.baseURL);
      const response = await api.post('/auth/google', { token: accessToken });
      console.log("[authService] googleLogin response RAW:", response);
      console.log("[authService] googleLogin response DATA:", response.data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('[authService] Google Login Error:', error);
      throw error;
    }
  },
};

export default authService;
