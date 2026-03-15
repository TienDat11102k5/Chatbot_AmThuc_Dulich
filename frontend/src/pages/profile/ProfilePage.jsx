/**
 * ProfilePage.jsx — Trang Hồ sơ cá nhân của SavoryTrip.
 *
 * Thiết kế theo Stitch "User Profile & My Trips":
 * 1. Cover photo (gradient xanh) + avatar tròn nhô lên
 * 2. Info bar: tên, email, bio + nút "Chỉnh sửa hồ sơ"
 * 3. Tab Navigation: Chuyến đi / Đã lưu / Lịch sử AI / Cài đặt (link sang page)
 * 4. Grid 3 cột Trip Cards: ảnh cover + badge trạng thái + nút "Xem chi tiết"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit, Plus, MapPin, Calendar, Plane, Bike,
  Footprints, Bookmark, History, Settings, ChevronRight
} from 'lucide-react';

// ─── Dữ liệu mẫu chuyến đi ───────────────────────────────────────────────────
const TRIPS = [
  {
    id: 1,
    title: 'Lịch trình 3 ngày Đà Nẵng',
    duration: '3 ngày',
    transport: 'Máy bay',
    TransportIcon: Plane,
    status: 'upcoming',   // sắp tới
    bg: 'from-sky-400 to-blue-600',
    emoji: '🌉',
  },
  {
    id: 2,
    title: 'Food tour Sài Gòn cuối tuần',
    duration: '2 ngày',
    transport: 'Xe máy',
    TransportIcon: Bike,
    status: 'completed',  // đã xong
    bg: 'from-orange-400 to-red-500',
    emoji: '🍜',
  },
  {
    id: 3,
    title: 'Khám phá Hà Nội tự túc',
    duration: '4 ngày',
    transport: 'Đi bộ',
    TransportIcon: Footprints,
    status: 'completed',
    bg: 'from-emerald-400 to-teal-600',
    emoji: '🏛️',
  },
];

// ─── Badge trạng thái chuyến đi ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isUpcoming = status === 'upcoming';
  return (
    <span className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase ${
      isUpcoming
        ? 'bg-white/90 text-primary-600'
        : 'bg-slate-200/90 text-slate-600'
    }`}>
      {isUpcoming ? '✈ Sắp tới' : '✓ Đã xong'}
    </span>
  );
};

// ─── Card chuyến đi ──────────────────────────────────────────────────────────
const TripCard = ({ trip }) => {
  const { TransportIcon } = trip;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
      {/* Ảnh cover gradient */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${trip.bg} flex items-center justify-center`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
          {trip.emoji}
        </span>
        <StatusBadge status={trip.status} />
      </div>
      {/* Nội dung card */}
      <div className="p-5">
        <h3 className="text-slate-900 text-lg font-bold mb-3 line-clamp-2">{trip.title}</h3>
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{trip.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <TransportIcon size={14} />
            <span>{trip.transport}</span>
          </div>
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
  { id: 'saved', label: 'Địa điểm đã lưu', icon: Bookmark, link: '/saved' },
  { id: 'history', label: 'Lịch sử AI', icon: History, link: '/chat-history' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, link: '/settings' },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('trips');

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto pb-12">

        {/* === COVER PHOTO === */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-b-2xl shadow-lg bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
          {/* Họa tiết decoration */}
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
              {/* Avatar tròn */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-5xl flex-shrink-0">
                👤
              </div>
              <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-slate-900">Nguyễn Văn A</h1>
                <p className="text-slate-500 text-base mb-1">nguyenvana@email.com</p>
                <p className="text-slate-600 text-sm max-w-md">
                  Người yêu du lịch và ẩm thực Việt Nam. Luôn tìm kiếm những trải nghiệm bản địa độc đáo.
                </p>
              </div>
            </div>
            {/* Nút chỉnh sửa */}
            <Link
              to="/settings"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 whitespace-nowrap"
            >
              <Edit size={16} />
              Chỉnh sửa hồ sơ
            </Link>
          </div>
        </div>

        {/* === TAB NAVIGATION === */}
        <div className="mt-8 px-6 md:px-10">
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const content = (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-4 whitespace-nowrap font-bold text-sm transition-all border-b-2 ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
              // Các tab ngoài "trips" navigate sang page khác
              if (tab.link && !isActive) {
                return (
                  <Link key={tab.id} to={tab.link} onClick={() => setActiveTab(tab.id)}>
                    {content}
                  </Link>
                );
              }
              return <div key={tab.id}>{content}</div>;
            })}
          </div>
        </div>

        {/* === NỘI DUNG: CHUYẾN ĐI CỦA TÔI === */}
        {activeTab === 'trips' && (
          <div className="mt-8 px-6 md:px-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Chuyến đi của tôi</h2>
              <Link
                to="/planner"
                className="flex items-center gap-2 text-primary-600 font-semibold text-sm hover:underline"
              >
                <Plus size={18} />
                Tạo chuyến đi mới
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRIPS.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
