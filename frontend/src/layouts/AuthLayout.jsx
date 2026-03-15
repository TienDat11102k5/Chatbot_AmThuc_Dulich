/**
 * AuthLayout.jsx — Layout dành cho các trang xác thực.
 *
 * Thiết kế theo Stitch:
 * - Nền màu xám nhạt với dot pattern (#f1f5f9)
 * - Navbar đơn giản: Logo + Nav links + CTA button
 * - Outlet render LoginPage / RegisterPage / ForgotPassword...
 * - Footer copyright ở dưới cùng
 *
 * KHÔNG dùng split-screen vì Stitch design là centered card.
 */
import { Link, Outlet, useLocation } from 'react-router-dom';

// ─── Dot pattern CSS dùng inline style ─────────────────────────────────────────
const DOT_BG_STYLE = {
  backgroundColor: '#f1f5f9',
  backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
  backgroundSize: '24px 24px',
};

function AuthLayout() {
  const location = useLocation();
  // Xác định trang hiện tại để hiển thị đúng nút navbar
  const isLoginPage    = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col" style={DOT_BG_STYLE}>

      {/* =============================================
          NAVBAR AUTH — Logo +Nav + CTA
          ============================================= */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">SavoryTrip</span>
          </Link>

          {/* Nav links giữa */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <Link to="/explore"  className="hover:text-primary-600 transition-colors">Khám phá</Link>
            <Link to="/planner"  className="hover:text-primary-600 transition-colors">Lên kế hoạch</Link>
            <Link to="/about"    className="hover:text-primary-600 transition-colors">Hướng dẫn</Link>
          </nav>

          {/* CTA button phải: Đăng ký nếu đang ở Login, Đăng nhập nếu đang ở Register */}
          {isLoginPage && (
            <Link
              to="/register"
              className="px-5 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              Đăng ký
            </Link>
          )}
          {isRegisterPage && (
            <Link
              to="/login"
              className="px-5 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              Đăng nhập
            </Link>
          )}
          {!isLoginPage && !isRegisterPage && (
            <Link
              to="/login"
              className="px-5 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* =============================================
          CONTENT — Các trang auth tự render card riêng
          ============================================= */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <Outlet />
      </main>

      {/* =============================================
          FOOTER — Copyright đơn giản
          ============================================= */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © 2024 SavoryTrip. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  );
}

export default AuthLayout;
