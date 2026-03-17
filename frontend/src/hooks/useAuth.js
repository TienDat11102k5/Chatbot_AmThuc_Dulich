/**
 * useAuth.js — Custom React Hook quản lý trạng thái đăng nhập.
 *
 * Hook này là "nguồn sự thật duy nhất" (single source of truth) cho trạng thái
 * xác thực trong toàn bộ ứng dụng. Mọi component cần biết user đã đăng nhập
 * hay chưa đều sử dụng hook này.
 *
 * Chức năng chính:
 * 1. Đọc thông tin user từ localStorage khi khởi tạo
 * 2. Lắng nghe sự kiện 'authChange' để cập nhật UI realtime khi:
 *    - User đăng nhập/đăng xuất ở tab khác (qua event 'storage')
 *    - Token hết hạn bị interceptor xóa (qua event 'authChange')
 *    - User đăng nhập/đăng xuất ở cùng tab (qua event 'authChange')
 * 3. Cung cấp hàm login() để lưu user data vào localStorage
 * 4. Cung cấp hàm logout() để xóa user data
 *
 * Sử dụng:
 *   const { user, token, userId, role, isAuthenticated, login, logout } = useAuth();
 *
 *   // Kiểm tra đăng nhập
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 *
 *   // Lấy userId cho API call
 *   const sessions = await chatService.getUserSessions(userId);
 *
 *   // Đăng nhập (sau khi gọi authService.login thành công)
 *   const data = await authService.login(username, password);
 *   login(data); // Lưu vào localStorage + cập nhật state
 *
 *   // Đăng xuất
 *   logout(); // Xóa localStorage + reset state + dispatch event
 *
 * Dữ liệu trong localStorage (key: 'savorytrip_user'):
 * {
 *   token: "eyJhbGciOiJSUz...",   // JWT token để gọi API
 *   userId: "550e8400-e29b...",    // UUID dùng cho chat sessions, favorites
 *   username: "nguyenvana",        // Tên đăng nhập
 *   email: "a@example.com",       // Email
 *   role: "USER"                   // Phân quyền: USER | EDITOR | ADMIN
 * }
 */
import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY } from '../lib/api';

export default function useAuth() {
  /**
   * State chứa thông tin user hiện tại.
   * Khởi tạo bằng cách đọc từ localStorage (nếu có).
   * Nếu chưa đăng nhập hoặc localStorage rỗng → null.
   */
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  /**
   * Lắng nghe sự kiện thay đổi trạng thái đăng nhập.
   *
   * 2 loại event:
   * - 'authChange': dispatch bởi chính ứng dụng (login, logout, 401 interceptor)
   * - 'storage': tự động phát khi localStorage thay đổi từ tab/window khác
   *
   * Khi nhận event → đọc lại localStorage → cập nhật state → UI tự re-render.
   */
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        setUser(data ? JSON.parse(data) : null);
      } catch {
        setUser(null);
      }
    };

    // Lắng nghe từ cùng tab (custom event)
    window.addEventListener('authChange', handleAuthChange);
    // Lắng nghe từ tab khác (native browser event)
    window.addEventListener('storage', handleAuthChange);

    // Cleanup: hủy lắng nghe khi component unmount (tránh memory leak)
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  /**
   * Lưu thông tin user vào localStorage và cập nhật state.
   *
   * Được gọi sau khi authService.login() hoặc authService.register() thành công.
   * Dispatch event 'authChange' để các component khác (như Navbar) cập nhật ngay.
   *
   * @param {Object} userData - Dữ liệu trả về từ backend AuthResponse
   *                            { token, userId, username, email, role }
   */
  const login = useCallback((userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('authChange'));
  }, []);

  /**
   * Xóa thông tin user khỏi localStorage và reset state về null.
   *
   * Được gọi khi:
   * - User bấm nút "Đăng xuất"
   * - Token hết hạn (401 interceptor trong api.js cũng gọi hàm tương tự)
   *
   * Dispatch event 'authChange' để Navbar chuyển về trạng thái chưa đăng nhập.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
  }, []);

  /**
   * Trả về object chứa toàn bộ thông tin xác thực:
   * - user: object đầy đủ hoặc null
   * - token: JWT string hoặc null (dùng nội bộ, ít khi cần trực tiếp)
   * - userId: UUID string hoặc null (dùng nhiều nhất cho API calls)
   * - role: 'USER' | 'EDITOR' | 'ADMIN' hoặc null
   * - isAuthenticated: boolean — true nếu có token hợp lệ
   * - login: hàm lưu user data
   * - logout: hàm xóa user data
   */
  return {
    user,
    token: user?.token || null,
    userId: user?.userId || null,
    role: user?.role || null,
    isAuthenticated: !!user?.token,
    login,
    logout,
  };
}
