/**
 * Tệp khai báo toàn bộ cấu hình định tuyến (Routing) của ứng dụng SavoryTrip.
 * Phân chia rõ ràng thành 4 nhóm route:
 *   1. Public Routes   - Ai cũng vào được, bọc trong MainLayout
 *   2. Auth Routes     - Chỉ dành cho người chưa đăng nhập (Layout riêng)
 *   3. Protected Routes - Yêu cầu đăng nhập, bọc trong MainLayout
 *   4. Admin Routes    - Yêu cầu quyền Admin, bọc trong AdminLayout
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Import Layouts ---
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';

// --- Import HOC bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute';

// --- Import Pages: Public & Marketing ---
import LandingPage from '@/pages/public/LandingPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';

// --- Import Pages: Core Features ---
import ExplorePage from '@/pages/core/ExplorePage';
import PlaceDetailPage from '@/pages/core/PlaceDetailPage';
import DestinationPage from '@/pages/core/DestinationPage';
import BlogPage from '@/pages/core/BlogPage';
import TravelPlannerPage from '@/pages/core/TravelPlannerPage';

// --- Import Pages: Auth ---
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyOTPPage from '@/pages/auth/VerifyOTPPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// --- Import Pages: User Profile ---
import ProfilePage from '@/pages/profile/ProfilePage';
import SettingsPage from '@/pages/profile/SettingsPage';
import SavedPlacesPage from '@/pages/profile/SavedPlacesPage';
import ChatHistoryPage from '@/pages/profile/ChatHistoryPage';

// --- Import Pages: Admin ---
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import ContentManagement from '@/pages/admin/ContentManagement';
import AILogsPage from '@/pages/admin/AILogsPage';

// --- Import Pages: Legal ---
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

// --- Import Pages: Errors ---
import NotFoundPage from '@/pages/errors/NotFoundPage';
import ServerErrorPage from '@/pages/errors/ServerErrorPage';
import MaintenancePage from '@/pages/errors/MaintenancePage';

/**
 * Component khai báo tất cả các Route của ứng dụng.
 * Sử dụng Nested Routes (<Route element={<Layout />}>) để Layout
 * tự động bọc ngoài các trang con mà không cần lặp lại code.
 */
function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
          NHÓM 1: PUBLIC ROUTES - Ai cũng truy cập được
          Được bọc trong MainLayout (Navbar + Footer + AIChatWidget)
          ====================================================== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/destination/:id" element={<DestinationPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Các trang pháp lý - được truy cập qua Footer */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* ======================================================
          NHÓM 2: AUTH ROUTES - Chỉ dành cho người CHƯA đăng nhập
          Được bọc trong AuthLayout (Split Screen: Image + Form)
          ====================================================== */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Luồng khôi phục mật khẩu 3 bước */}
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ======================================================
          NHÓM 3: PROTECTED ROUTES - Yêu cầu đăng nhập
          ProtectedRoute sẽ tự chuyển đến /login nếu chưa đăng nhập
          ====================================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/planner" element={<TravelPlannerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/saved" element={<SavedPlacesPage />} />
          <Route path="/chat-history" element={<ChatHistoryPage />} />
        </Route>
      </Route>

      {/* ======================================================
          NHÓM 4: ADMIN ROUTES - Yêu cầu quyền Admin
          ProtectedRoute(requireAdmin) kiểm tra role người dùng
          ====================================================== */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/content" element={<ContentManagement />} />
          <Route path="/admin/ai-logs" element={<AILogsPage />} />
        </Route>
      </Route>

      {/* ======================================================
          NHÓM 5: ERROR ROUTES - Trang lỗi (Không cần Layout riêng)
          ====================================================== */}
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      {/* Bắt tất cả URL không khớp với các route trên -> Trang 404 */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default AppRoutes;
