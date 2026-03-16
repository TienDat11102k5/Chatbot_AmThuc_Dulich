/**
 * Navbar - Thanh điều hướng cố định phía trên của trang.
 *
 * Chức năng:
 *   - Hiển thị Logo SavoryTrip (link về trang chủ).
 *   - Các menu điều hướng chính: Khám phá, Lên kế hoạch.
 *   - Nếu chưa đăng nhập: Hiển thị nút "Đăng nhập" / "Đăng ký".
 *   - Nếu đã đăng nhập: Hiển thị Avatar + Dropdown với Profile, Settings, Logout.
 *   - Trên Mobile: Menu thu gọn thành hamburger icon.
 *
 * Lưu ý thiết kế:
 *   - Navbar luôn sticky (không cuộn mất khi scroll).
 *   - Nền trắng với đường viền nhẹ bên dưới để phân tách với nội dung.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Settings, Bookmark, MessageSquare, LogOut } from 'lucide-react';

/**
 * Lấy thông tin người dùng hiện tại từ localStorage.
 * TODO: Thay thế bằng Zustand Store sau khi tích hợp API.
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('savorytrip_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Reactive auth state - cập nhật ngay khi login/logout không cần F5
  const [user, setUser] = useState(getCurrentUser);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Lắng nghe thay đổi auth state từ bất kỳ đâu trong app
  useEffect(() => {
    const syncUser = () => setUser(getCurrentUser());
    // Lắng nghe event tùy chỉnh do loginPage/logoutPage dispatch
    window.addEventListener('authChange', syncUser);
    // Lắng nghe thay đổi localStorage từ tab khác
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('authChange', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem('savorytrip_user');
    // Dispatch event để Navbar tự cập nhật ngay
    window.dispatchEvent(new Event('authChange'));
    setUser(null);
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* =================== LOGO =================== */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-primary-600 font-bold text-xl tracking-tight">
              SavoryTrip
            </span>
          </Link>

          {/* =================== MENU DESKTOP (Ẩn trên Mobile) =================== */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/" end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`
              }
            >
              Trang Chủ
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`
              }
            >
              Khám Phá
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`
              }
            >
              Về chúng tôi
            </NavLink>
          </nav>

          {/* =================== PHẦN PHẢI: Auth / User =================== */}
          <div className="hidden md:flex items-center gap-3">

            {user ? (
              /* Đã đăng nhập: Hiển thị Avatar và Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors duration-150"
                  aria-label="Menu tài khoản"
                >
                  {/* Avatar User - Viền tròn */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[100px] truncate">
                    {user.name || 'Tốc của tôi'}
                  </span>
                  <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50">
                    <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      <User size={16} className="text-neutral-500" /> Trang cá nhân
                    </Link>
                    <Link to="/saved" onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Bookmark size={16} className="text-neutral-500" /> Đã lưu
                    </Link>
                    <Link to="/chat-history" onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      <MessageSquare size={16} className="text-neutral-500" /> Lịch sử chat
                    </Link>
                    <Link to="/settings" onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Settings size={16} className="text-neutral-500" /> Cài đặt
                    </Link>
                    {/* Đường kẻ phân tách trước nút Logout */}
                    <div className="border-t border-neutral-200 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Chưa đăng nhập: Hiển thị nút Login dạng outlined pill theo Stitch */
              <Link
                to="/login"
                className="flex items-center justify-center min-w-[100px] px-5 py-2 bg-slate-100 text-slate-900 text-sm font-bold rounded-full hover:bg-slate-200 transition-all border border-slate-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* =================== NÚT HAMBURGER (Chỉ hiện trên Mobile) =================== */}
          <button
            className="md:hidden text-neutral-600 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Mở/đóng menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* =================== MENU MOBILE (Mở ra phía dưới) =================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          <NavLink to="/" end onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-100'}`}>
            Trang Chủ
          </NavLink>
          <NavLink to="/explore" onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-100'}`}>
            Khám Phá
          </NavLink>
          <NavLink to="/blog" onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-100'}`}>
            Blog
          </NavLink>
          <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-100'}`}>
            Về chúng tôi
          </NavLink>
          <div className="border-t border-neutral-200 pt-3 mt-2 flex flex-col gap-2">
            {user ? (
              <button onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg text-center">
                Đăng xuất
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg text-center">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg text-center">
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
