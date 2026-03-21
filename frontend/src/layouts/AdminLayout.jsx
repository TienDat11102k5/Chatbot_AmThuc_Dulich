/**
 * AdminLayout.jsx — Layout dành riêng cho khu vực quản trị.
 *
 * Thiết kế theo Stitch "SavoryTrip Admin Dashboard":
 * - Sidebar cố định bên trái màu slate-900, width 256px
 *   + Logo + badge "Quản trị"
 *   + Nav items: icon + label; active = bg-primary-600
 *   + User info + Đăng xuất ở cuối
 * - Main area bên phải:
 *   + Header trắng h-16: search bar + bell icon + admin avatar
 *   + Scrollable content area (Outlet)
 * - Responsive: sidebar ẩn trên mobile, toggle bằng nút hamburger
 */

import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BrainCircuit,
  Settings, Menu, X, LogOut, Bell, Search, ChefHat,
  BarChart2, ChevronDown, ChevronRight
} from 'lucide-react';

// ─── Các mục menu sidebar ────────────────────────────────────────────────────
const ADMIN_MENU = [
  { path: '/admin',          label: 'Tổng quan',           icon: LayoutDashboard },
  { path: '/admin/users',    label: 'Quản lý User',         icon: Users           },
  { 
    label: 'AI Center', 
    icon: BrainCircuit,
    isSubmenu: true,
    subItems: [
      { path: '/admin/ai/monitoring', label: 'Giám sát AI Center' },
      { path: '/admin/ai/training-data', label: 'Dữ liệu Huấn luyện' }
    ]
  },
  { 
    label: 'Quản lý trang (CMS)', 
    icon: FileText,
    isSubmenu: true,
    subItems: [
      { path: '/admin/content/blog', label: 'Blog / Tin tức' },
      { path: '/admin/content/about', label: 'Về chúng tôi' },
      { path: '/admin/content/terms', label: 'Điều khoản dịch vụ' },
      { path: '/admin/content/privacy', label: 'Chính sách bảo mật' }
    ]
  },
  { path: '/admin/analytics', label: 'Báo Cáo & Thống Kê', icon: BarChart2 },
  { path: '/admin/settings',  label: 'Cài đặt HT',          icon: Settings },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Read admin info from localStorage
  const getUserInfo = () => {
    try {
      const raw = localStorage.getItem('savorytrip_user');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const userInfo = getUserInfo();
  const adminName = userInfo.fullName || userInfo.username || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    if (location.pathname.startsWith('/admin/content')) {
      setOpenMenus(prev => ({ ...prev, 'Quản lý trang (CMS)': true }));
    }
    if (location.pathname.startsWith('/admin/ai')) {
      setOpenMenus(prev => ({ ...prev, 'AI Center': true }));
    }
  }, [location.pathname]);

  const toggleSubmenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('savorytrip_user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* === OVERLAY (mobile) === */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================================
          SIDEBAR — Màu slate-900, cố định bên trái
          ======================================================== */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-slate-100 flex-shrink-0
        flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">SavoryTrip</h1>
              <p className="text-xs text-slate-400 mt-1">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            
            if (item.isSubmenu) {
              const isActiveParent = item.label === 'AI Center'
                ? location.pathname.startsWith('/admin/ai')
                : location.pathname.startsWith('/admin/content');
              const isOpen = openMenus[item.label];

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActiveParent
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isOpen && (
                    <div className="pl-4 pr-2 space-y-1 mt-1 border-l-2 border-slate-800 ml-6">
                      {item.subItems.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isActive
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {adminInitial}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">{adminName}</p>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <LogOut size={11} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT
          ======================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          {/* Hamburger (mobile) */}
          <button
            className="md:hidden text-slate-600 hover:text-slate-900 mr-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dữ liệu..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-600/30 transition-all outline-none"
              />
            </div>
          </div>

          {/* Right side: bell + avatar */}
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              {/* Badge thông báo đỏ */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{adminName}</p>
                <p className="text-xs text-slate-500 mt-1">{userInfo.role === 'ADMIN' ? 'Super Admin' : 'User'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary-600/20">
                {adminInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content (scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
