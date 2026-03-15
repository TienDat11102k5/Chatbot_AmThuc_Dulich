/**
 * HOC (Higher-Order Component) bảo vệ các Route nhạy cảm.
 *
 * Chức năng:
 *   - Kiểm tra xem người dùng đã đăng nhập chưa.
 *   - Nếu prop `requireAdmin` = true, kiểm tra thêm xem có phải Admin không.
 *   - Nếu chưa thỏa điều kiện -> tự động chuyển hướng về trang phù hợp.
 *   - Nếu thỏa điều kiện -> cho phép render các Route con qua <Outlet />.
 *
 * Cách dùng:
 *   <Route element={<ProtectedRoute />}>         // Chỉ yêu cầu đăng nhập
 *   <Route element={<ProtectedRoute requireAdmin />}>  // Yêu cầu quyền Admin
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Hàm giả lập lấy thông tin người dùng từ Local Storage.
 * TODO: Thay thế bằng logic lấy từ Zustand Store hoặc AuthContext thực tế.
 *
 * @returns {{ isAuthenticated: boolean, role: string } | null}
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('savorytrip_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    // Nếu dữ liệu trong localStorage bị lỗi, coi như chưa đăng nhập
    return null;
  }
}

/**
 * Component ProtectedRoute.
 *
 * @param {object}  props
 * @param {boolean} [props.requireAdmin=false] - Có yêu cầu quyền Admin không?
 */
function ProtectedRoute({ requireAdmin = false }) {
  const user = getCurrentUser();

  // Trường hợp 1: Chưa đăng nhập -> chuyển về trang Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Trường hợp 2: Yêu cầu Admin nhưng không phải Admin -> chuyển về trang chủ
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Trường hợp 3: Đủ điều kiện -> render các Route con
  return <Outlet />;
}

export default ProtectedRoute;
