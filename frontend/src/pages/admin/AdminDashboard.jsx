/**
 * AdminDashboard.jsx — Trang tổng quan của Admin Dashboard.
 *
 * Thiết kế theo Stitch "SavoryTrip Admin Dashboard Overview":
 * 1. Stats Cards (3 cột): Tổng User / Lượt chat AI / Điểm đến phổ biến
 *    - Mỗi card: label + số BIG + icon màu + trend badge xanh lá
 * 2. Biểu đồ đường (SVG)cho 7 ngày: AI traffic (primary) + Web visits (slate dashed)
 * 3. Bảng người dùng mới đăng ký: avatar initials + email + role + status badge + actions
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, MapPin, TrendingUp, Edit, Trash2,
  ChevronRight,
} from 'lucide-react';

// ─── Dữ liệu stats cards ────────────────────────────────────────────────────
const STATS = [
  {
    label: 'Tổng User',
    value: '1,200',
    trend: '+5% so với tháng trước',
    trendUp: true,
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Lượt chat AI hôm nay',
    value: '4,500',
    trend: '+12% so với hôm qua',
    trendUp: true,
    icon: MessageSquare,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Điểm đến phổ biến',
    value: 'Đà Nẵng',
    trend: 'Thành phố du lịch hot nhất',
    trendUp: false,
    icon: MapPin,
    iconBg: 'bg-amber-50 text-amber-600',
  },
];

// ─── Dữ liệu bảng users gần đây ─────────────────────────────────────────────
const RECENT_USERS = [
  { initials: 'LH', name: 'Lê Hoàng Nam',  email: 'nam.lh@example.com',   role: 'Premium User',    status: 'active',   bgColor: 'bg-primary-600/10 text-primary-600' },
  { initials: 'TT', name: 'Trần Thị Thảo', email: 'thao.tt@testmail.vn',  role: 'User',            status: 'inactive', bgColor: 'bg-slate-200 text-slate-600' },
  { initials: 'QD', name: 'Quốc Duy',      email: 'duy.travel@outlook.com', role: 'Admin Content', status: 'active',   bgColor: 'bg-amber-100 text-amber-700' },
  { initials: 'MA', name: 'Minh Anh',      email: 'minhanh.ng@gmail.com', role: 'User',            status: 'active',   bgColor: 'bg-primary-600/10 text-primary-600' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    status === 'active'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-red-100 text-red-800'
  }`}>
    {status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
  </span>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState(RECENT_USERS);

  const handleDelete = (email) => {
    setUsers((prev) => prev.filter((u) => u.email !== email));
  };

  return (
    <div className="space-y-8">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Dữ liệu thời gian thực của SavoryTrip</p>
      </div>

      {/* === STATS CARDS (3 cột) === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${
                stat.trendUp ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {stat.trendUp && <TrendingUp size={14} />}
                <span>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* === BIỂU ĐỒ SVG === */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Xu hướng sử dụng AI và Lưu lượng Web</h2>
            <p className="text-sm text-slate-500">Dữ liệu thống kê trong 7 ngày qua</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600 px-3 py-1.5 bg-slate-100 rounded-full">
              <span className="w-2 h-2 bg-primary-600 rounded-full" />
              Lưu lượng AI
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600 px-3 py-1.5 bg-slate-100 rounded-full">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              Lượt truy cập Web
            </span>
          </div>
        </div>

        {/* SVG Line Chart theo Stitch */}
        <div className="relative h-64 w-full">
          <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Vùng tô gradient bên dưới đường AI */}
            <path
              d="M0,200 Q150,50 300,180 T600,80 T1000,150 V250 H0 Z"
              fill="url(#chartGradient)"
            />
            {/* Đường AI (solid primary) */}
            <path
              d="M0,200 Q150,50 300,180 T600,80 T1000,150"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Đường Web visits (dashed slate) */}
            <path
              d="M0,220 Q200,180 400,210 T800,160 T1000,190"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="8,4"
              strokeLinecap="round"
            />
          </svg>

          {/* Labels ngày trong tuần */}
          <div className="flex justify-between mt-3 text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* === BẢNG USERS MỚI === */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Người dùng mới đăng ký</h2>
          <Link to="/admin/users" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Họ và Tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      i === 4 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50/50 transition-colors">
                  {/* Avatar initials + tên */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${user.bgColor} flex items-center justify-center font-bold text-xs`}>
                        {user.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.email)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
