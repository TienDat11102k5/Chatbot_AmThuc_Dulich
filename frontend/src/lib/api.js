/**
 * api.js — Cấu hình Axios Instance chung cho toàn bộ ứng dụng.
 *
 * Chức năng chính:
 * 1. Tạo Axios instance với baseURL trỏ đến '/api' (Vite proxy sẽ chuyển tiếp đến backend :8080)
 * 2. Request Interceptor: Tự động đính kèm JWT token (Bearer) từ localStorage vào mỗi request
 * 3. Response Interceptor: Nếu backend trả 401 (hết hạn token), tự động xóa phiên đăng nhập
 *    và chuyển hướng người dùng về trang login
 *
 * Sử dụng:
 *   import api from './api';
 *   const res = await api.get('/v1/places');  // Tự động có Bearer token
 *
 * Lưu ý:
 * - Key lưu trữ trong localStorage: 'savorytrip_user'
 * - Timeout mặc định: 15 giây
 * - Khi token hết hạn (401), dispatch event 'authChange' để Navbar cập nhật UI
 */
import axios from 'axios';

/**
 * Key lưu trữ thông tin người dùng trong localStorage.
 * Dữ liệu dạng JSON: { token, userId, username, email, role }
 */
const STORAGE_KEY = 'savorytrip_user';

/**
 * Axios instance chính — mọi API call trong ứng dụng đều dùng instance này.
 * baseURL: '/api' → Vite dev server proxy sang http://localhost:8080/api
 * timeout: 15 giây → tránh treo request quá lâu
 */
const isProd = import.meta.env.MODE === 'production';
const PROD_BACKEND_URL = 'https://backend-0hvq.onrender.com/api';

const api = axios.create({
  // Nếu là production -> Gọi thẳng backend. Nếu là local -> Dùng proxy '/api'
  baseURL: import.meta.env.VITE_API_URL || (isProd ? PROD_BACKEND_URL : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * REQUEST INTERCEPTOR — Chạy trước mỗi request gửi đi.
 *
 * Tác dụng:
 * - Đọc JWT token từ localStorage
 * - Gắn vào header Authorization: Bearer <token>
 * - Nếu không có token (chưa đăng nhập), request vẫn gửi bình thường
 *   (backend sẽ trả 401 cho các route cần xác thực)
 */
api.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem(STORAGE_KEY);
      if (userData) {
        const { token } = JSON.parse(userData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error('[API] Lỗi đọc token từ localStorage:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR — Chạy sau mỗi response nhận về.
 *
 * Tác dụng:
 * - Nếu response thành công (2xx): trả về bình thường
 * - Nếu response là 401 (Unauthorized / Token hết hạn):
 *   1. Xóa thông tin đăng nhập khỏi localStorage
 *   2. Dispatch event 'authChange' để Navbar chuyển về trạng thái chưa đăng nhập
 *   3. Redirect về /login (trừ khi đang ở trang auth rồi)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa phiên đăng nhập cũ
      localStorage.removeItem(STORAGE_KEY);
      // Thông báo cho các component (Navbar) cập nhật UI
      window.dispatchEvent(new Event('authChange'));

      // Chỉ redirect nếu KHÔNG đang ở trang auth (tránh vòng lặp redirect)
      const authPaths = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];
      if (!authPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { STORAGE_KEY };
