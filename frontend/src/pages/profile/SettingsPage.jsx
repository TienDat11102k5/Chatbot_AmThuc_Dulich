/**
 * SettingsPage.jsx — Trang Cài đặt tài khoản SavoryTrip.
 *
 * Thiết kế theo Stitch "User Settings - SavoryTrip Profile":
 * - Cover photo + avatar tròn (có icon camera)
 * - Layout 2 cột: Sidebar trái (4 mục nav) + Form chính phải
 * - Active nav item: background blue nhạt, text primary
 * - Form: Họ tên, Email, SĐT (+84), Quốc gia (select)
 * - Nút Lưu thay đổi màu primary-600 (xanh)
 * - Footer tip bảo mật màu blue-50
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, UtensilsCrossed, Bell, Trash2, Camera, ChevronRight, Info, AlertTriangle } from 'lucide-react';

// ─── Mục sidebar ─────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
  { id: 'food', label: 'Sở thích ẩm thực', icon: UtensilsCrossed },
  { id: 'notification', label: 'Thông báo', icon: Bell },
];

// ─── Form thông tin cá nhân ───────────────────────────────────────────────────
const PersonalInfoForm = () => {
  const [form, setForm] = useState({
    name: 'Nguyễn Văn A',
    email: 'nva@gmail.com',
    phone: '',
    country: 'vn',
    bio: 'Người yêu du lịch và ẩm thực Việt Nam.',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header form */}
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
        <p className="text-slate-500 text-sm mt-1">
          Cập nhật thông tin hồ sơ của bạn để cá nhân hoá trải nghiệm SavoryTrip.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Avatar change section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 border-2 border-slate-200 shadow-sm flex items-center justify-center text-4xl overflow-hidden">
              👤
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-600 hover:bg-primary-50 transition-colors"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Ảnh đại diện</h4>
            <p className="text-xs text-slate-500 mt-0.5">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
            <div className="flex gap-3 mt-3">
              <button type="button" className="text-xs font-bold text-primary-600 px-3 py-1.5 rounded-lg bg-primary-600/10 hover:bg-primary-600/20 transition-colors">
                Thay đổi
              </button>
              <button type="button" className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                Gỡ bỏ
              </button>
            </div>
          </div>
        </div>

        {/* Form fields dạng grid 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Họ và Tên</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all bg-transparent"
              placeholder="Nhập họ tên của bạn"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Địa chỉ Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all bg-transparent"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+84</span>
              <input
                type="tel"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all bg-transparent"
                placeholder="9xx xxx xxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Quốc gia</label>
            <div className="relative">
              <select
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all bg-transparent cursor-pointer"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                <option value="vn">🇻🇳 Việt Nam</option>
                <option value="th">🇹🇭 Thái Lan</option>
                <option value="jp">🇯🇵 Nhật Bản</option>
                <option value="kr">🇰🇷 Hàn Quốc</option>
                <option value="sg">🇸🇬 Singapore</option>
              </select>
              <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {/* Bio — chiếm cả hàng */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Giới thiệu bản thân</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all bg-transparent resize-none"
              placeholder="Viết vài dòng về bản thân..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Footer form: Vô hiệu hoá + Huỷ + Lưu */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 hover:text-red-500 cursor-pointer group transition-colors">
            <AlertTriangle size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Bạn muốn tạm thời vô hiệu hoá tài khoản?</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
              Huỷ
            </button>
            <button
              type="submit"
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
              }`}
            >
              {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </form>

      {/* Tip bảo mật */}
      <div className="mx-6 md:mx-8 mb-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-4">
        <Info size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Bảo mật tài khoản</p>
          <p className="mt-0.5">Chúng tôi khuyên bạn nên cập nhật mật khẩu ít nhất 6 tháng một lần để đảm bảo an toàn cho dữ liệu.</p>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto pb-12">

        {/* === COVER PHOTO + AVATAR === */}
        <div className="relative mb-24">
          <div className="w-full h-48 md:h-64 overflow-hidden rounded-b-2xl bg-gradient-to-br from-primary-600 to-indigo-700">
            <div className="w-full h-full flex items-center justify-center text-white/10 text-8xl">⚙️</div>
          </div>
          {/* Avatar nhô ra khỏi cover */}
          <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-primary-100 overflow-hidden shadow-lg flex items-center justify-center text-5xl">
                👤
              </div>
              <button className="absolute bottom-1 right-1 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nguyễn Văn A</h1>
              <p className="text-slate-500 font-medium">Thành viên từ 2023</p>
            </div>
          </div>
        </div>

        {/* === MAIN LAYOUT: SIDEBAR + FORM === */}
        <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar trái */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 sticky top-20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-3">Cài đặt</h3>
              <nav className="flex flex-col gap-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-primary-600/10 text-primary-600'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
                <hr className="my-3 border-slate-100" />
                {/* Xoá tài khoản — màu đỏ */}
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-left">
                  <Trash2 size={18} />
                  <span className="text-sm font-medium">Xoá tài khoản</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Form chính bên phải */}
          <section className="lg:col-span-9">
            {activeSection === 'profile' && <PersonalInfoForm />}
            {activeSection !== 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Đang phát triển</h3>
                <p className="text-slate-500 text-sm">Tính năng này sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
