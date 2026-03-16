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
          {/* Logo - Giống Main Navbar */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-primary-600 font-bold text-xl tracking-tight">
              SavoryTrip
            </span>
          </Link>

          {/* Nav links giữa */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <Link to="/"         className="hover:text-primary-600 transition-colors">Trang Chủ</Link>
            <Link to="/explore"  className="hover:text-primary-600 transition-colors">Khám Phá</Link>
            <Link to="/blog"     className="hover:text-primary-600 transition-colors">Blog</Link>
            <Link to="/about"    className="hover:text-primary-600 transition-colors">Về chúng tôi</Link>
          </nav>

          {/* CTA button phải */}
          <div className="flex items-center gap-3">


            {isLoginPage ? (
              <Link
                to="/register"
                className="flex items-center justify-center min-w-[100px] px-5 py-2 bg-slate-100 text-slate-900 text-sm font-bold rounded-full hover:bg-slate-200 transition-all border border-slate-200"
              >
                Đăng ký
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center min-w-[100px] px-5 py-2 bg-slate-100 text-slate-900 text-sm font-bold rounded-full hover:bg-slate-200 transition-all border border-slate-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>
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
