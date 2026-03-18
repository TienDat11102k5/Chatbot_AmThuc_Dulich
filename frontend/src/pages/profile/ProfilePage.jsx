/**
 * ProfilePage.jsx — Trang Hồ sơ cá nhân của người dùng.
 *
 * Thay đổi:
 * - Thêm fallback đọc localStorage khi API /users/me lỗi
 * - Nút "Chỉnh sửa hồ sơ" → navigate sang /settings thay vì mở modal
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Edit, Plus, MapPin, Calendar, Plane, Bike,
  Footprints, Bookmark, History, Settings,
} from 'lucide-react';
import userService from '../../lib/userService';
import { STORAGE_KEY } from '../../lib/api';

// ─── Skeleton Loading ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-lg ${className}`} />
);

// ─── Dữ liệu mẫu chuyến đi (Phase F sẽ thay bằng API) ─────────────────────
const SAMPLE_TRIPS = [
  { id: 1, title: 'Lịch trình 3 ngày Đà Nẵng', duration: '3 ngày', transport: 'Máy bay', TransportIcon: Plane, status: 'upcoming', bg: 'from-sky-400 to-blue-600', emoji: '🌉' },
  { id: 2, title: 'Food tour Sài Gòn cuối tuần', duration: '2 ngày', transport: 'Xe máy', TransportIcon: Bike, status: 'completed', bg: 'from-orange-400 to-red-500', emoji: '🍜' },
  { id: 3, title: 'Khám phá Hà Nội tự túc', duration: '4 ngày', transport: 'Đi bộ', TransportIcon: Footprints, status: 'completed', bg: 'from-emerald-400 to-teal-600', emoji: '🏛️' },
];

// ─── Badge trạng thái chuyến đi ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isUpcoming = status === 'upcoming';
  return (
    <span className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase ${isUpcoming ? 'bg-white/90 text-primary-600' : 'bg-slate-200/90 text-slate-600'}`}>
      {isUpcoming ? '✈ Sắp tới' : '✓ Đã xong'}
    </span>
  );
};

// ─── Card chuyến đi ──────────────────────────────────────────────────────────
const TripCard = ({ trip }) => {
  const { TransportIcon } = trip;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${trip.bg} flex items-center justify-center`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{trip.emoji}</span>
        <StatusBadge status={trip.status} />
      </div>
      <div className="p-5">
        <h3 className="text-slate-900 text-lg font-bold mb-3 line-clamp-2">{trip.title}</h3>
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
          <div className="flex items-center gap-1"><Calendar size={14} /><span>{trip.duration}</span></div>
          <div className="flex items-center gap-1"><TransportIcon size={14} /><span>{trip.transport}</span></div>
        </div>
        <button className="w-full py-2.5 border border-primary-600/20 bg-primary-600/5 hover:bg-primary-600 text-primary-600 hover:text-white rounded-xl text-sm font-bold transition-all">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

// ─── Tab Navigation ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'trips', label: 'Chuyến đi của tôi', icon: MapPin },
  { id: 'saved', label: 'Địa điểm đã lưu', icon: Bookmark },
  { id: 'history', label: 'Lịch sử AI', icon: History, link: '/chat' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, link: '/settings' },
];

// ─── Helper: Format ngày tham gia ────────────────────────────────────────────
const formatJoinDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
};

// ─── Tên hiển thị ưu tiên ────────────────────────────────────────────────────
const getDisplayName = (user) => user?.fullName || user?.username || 'Người dùng';

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');
  const navigate = useNavigate();

  // Load thông tin user: API trước, fallback localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.warn('API /users/me lỗi, đọc từ localStorage:', error?.response?.status);
        // Fallback: đọc từ localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            setUser({
              id: parsed.userId || parsed.id,
              username: parsed.username || '',
              email: parsed.email || '',
              fullName: parsed.fullName || '',
              avatarUrl: parsed.avatarUrl || null,
              createdAt: parsed.createdAt || null,
            });
          }
        } catch {
          // Bỏ qua lỗi parse localStorage
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Xác định URL avatar
  const avatarSrc = user?.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto pb-12">

        {/* === COVER PHOTO === */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-b-2xl shadow-lg bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
          <div className="absolute inset-0 opacity-10">
            {['top-10 left-20', 'top-32 right-40', 'bottom-10 left-1/2', 'top-16 right-16'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-32 h-32 rounded-full bg-white`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-9xl">
            🗺️
          </div>
        </div>

        {/* === PROFILE INFO BAR === */}
        <div className="px-6 md:px-10 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-5xl flex-shrink-0 overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-slate-200 animate-pulse" />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>

              {/* Thông tin cơ bản */}
              <div className="text-center md:text-left mb-2">
                {loading ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-36 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-slate-900">{getDisplayName(user)}</h1>
                    {user?.createdAt && (
                      <p className="text-slate-400 text-xs mt-1">
                        🗓️ Tham gia từ {formatJoinDate(user.createdAt)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Nút chỉnh sửa hồ sơ → navigate sang /settings */}
            <button
              onClick={() => navigate('/settings')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 whitespace-nowrap disabled:opacity-50"
            >
              <Edit size={16} />
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>

        {/* === TAB NAVIGATION === */}
        <div className="mt-8 px-6 md:px-10">
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const button = (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-4 whitespace-nowrap font-bold text-sm transition-all border-b-2 ${
                    isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
              if (tab.link) {
                return <Link key={tab.id} to={tab.link} onClick={() => setActiveTab(tab.id)}>{button}</Link>;
              }
              return <div key={tab.id}>{button}</div>;
            })}
          </div>
        </div>

        {/* === NỘI DUNG: CHUYẾN ĐI === */}
        {activeTab === 'trips' && (
          <div className="mt-8 px-6 md:px-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Chuyến đi của tôi</h2>
              <Link to="/planner" className="flex items-center gap-2 text-primary-600 font-semibold text-sm hover:underline">
                <Plus size={18} />
                Tạo chuyến đi mới
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_TRIPS.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </div>
        )}

        {/* === NỘI DUNG: ĐỊA ĐIỂM ĐÃ LƯU (Phase F) === */}
        {activeTab === 'saved' && (
          <div className="mt-8 px-6 md:px-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Địa điểm đã lưu</h2>
            <div className="text-center py-16 text-slate-400">
              <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">Chưa có địa điểm nào được lưu.</p>
              <p className="text-sm mt-2">Khám phá các địa điểm và lưu lại những nơi bạn yêu thích!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
