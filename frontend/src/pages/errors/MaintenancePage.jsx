/**
 * MaintenancePage.jsx — Trang bảo trì hệ thống.
 *
 * Design: Thân thiện, creative với countdown đến khi bảo trì kết thúc
 * - Animated tools/wrench emoji
 * - Dự kiến thời gian hoàn tất
 * - Form đăng ký nhận thông báo khi online lại
 * - Progress bar công việc bảo trì
 */

import { useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';

// Các hạng mục đang bảo trì
const MAINTENANCE_ITEMS = [
  { label: 'Nâng cấp hệ thống AI SavoryAI', done: true },
  { label: 'Cải thiện hiệu năng cơ sở dữ liệu', done: true },
  { label: 'Cập nhật bảo mật server', done: false },
  { label: 'Kiểm thử toàn hệ thống', done: false },
];

const MaintenancePage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const completedCount = MAINTENANCE_ITEMS.filter((i) => i.done).length;
  const progress = Math.round((completedCount / MAINTENANCE_ITEMS.length) * 100);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 text-white">
      <div className="text-center max-w-2xl mx-auto">

        {/* Animated wrench + logo */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-6xl shadow-2xl">
            🔧
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-primary-400/50 animate-ping" />
        </div>

        {/* Badge */}
        <div className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
          🛠️ Đang bảo trì hệ thống
        </div>

        <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
          Chúng tôi đang<br />
          <span className="text-primary-400">nâng cấp</span> SavoryTrip!
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Đội kỹ thuật đang thực hiện nâng cấp quan trọng để mang lại trải nghiệm tốt hơn cho bạn.<br />
          <strong className="text-white">Dự kiến hoàn thành: 2 giờ nữa.</strong>
        </p>

        {/* Progress checklist */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8 text-left">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Tiến độ bảo trì</h3>

          {/* Progress bar tổng */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Tổng tiến độ</span>
              <span className="font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Từng hạng mục */}
          <div className="space-y-3">
            {MAINTENANCE_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                  </div>
                )}
                <span className={`text-sm ${item.done ? 'text-slate-300 line-through' : 'text-white'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe notify */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
          <Bell size={22} className="mx-auto text-primary-400 mb-3" />
          <h3 className="font-bold text-lg mb-1">Nhận thông báo khi hoàn tất</h3>
          <p className="text-slate-400 text-sm mb-4">Chúng tôi sẽ email bạn ngay khi website hoạt động trở lại.</p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle size={18} />
              Đã đăng ký! Chúng tôi sẽ thông báo bạn sớm.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm outline-none focus:border-primary-400 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Đăng ký
              </button>
            </form>
          )}
        </div>

        {/* Social links */}
        <p className="mt-8 text-slate-500 text-sm">
          Cập nhật mới nhất tại{' '}
          <a href="#" className="text-primary-400 hover:underline font-semibold">Facebook SavoryTrip</a>
          {' '}hoặc{' '}
          <a href="#" className="text-primary-400 hover:underline font-semibold">@savorytrip</a>
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
