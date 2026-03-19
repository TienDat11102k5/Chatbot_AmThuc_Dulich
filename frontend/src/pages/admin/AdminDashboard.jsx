/**
 * AdminDashboard.jsx — Trang tổng quan Admin Dashboard.
 *
 * Stats từ API thật: GET /api/v1/admin/stats
 * Users gần đây từ API: GET /api/v1/admin/users?page=0&size=5
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Shield,
  TrendingUp, Edit, Trash2, ChevronRight, Loader2,
} from 'lucide-react';
import adminService from '../../lib/adminService';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700', 'bg-orange-100 text-orange-700',
];

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// ─── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
  }`}>
    {status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
  </span>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(0, 5),
        ]);
        setStats(statsData);
        setRecentUsers(usersData.content || []);
      } catch (err) {
        console.error('[AdminDashboard] Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  // Stats cards config
  const STATS_CARDS = [
    {
      label: 'Tổng User',
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      trend: `${stats?.activeUsers || 0} đang hoạt động`,
    },
    {
      label: 'User Active',
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'Tài khoản đang hoạt động',
    },
    {
      label: 'User Inactive',
      value: stats?.inactiveUsers || 0,
      icon: UserX,
      iconBg: 'bg-red-50 text-red-600',
      trend: 'Tài khoản bị vô hiệu',
    },
    {
      label: 'Admin',
      value: stats?.adminUsers || 0,
      icon: Shield,
      iconBg: 'bg-violet-50 text-violet-600',
      trend: 'Tài khoản quản trị viên',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Dữ liệu thời gian thực của SavoryTrip</p>
      </div>

      {/* === STATS CARDS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium text-slate-500">
                <span>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* === BẢNG USERS MỚI ĐĂNG KÝ === */}
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
                {['Họ và Tên', 'Email', 'Vai trò', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.fullName || user.username)} flex items-center justify-center font-bold text-xs`}>
                        {getInitials(user.fullName || user.username)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 block">{user.fullName || user.username}</span>
                        <span className="text-xs text-slate-400">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Chưa có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
