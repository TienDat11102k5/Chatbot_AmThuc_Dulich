/**
 * AiMonitoring.jsx — Trang Giám sát AI (Admin).
 *
 * Hiển thị:
 * - Thống kê tổng quan AI (số intents, mẫu câu, cache hit rate)
 * - Danh sách users đã tương tác với AI chatbot (phân trang)
 * - Search debounce 400ms
 * - Skeleton loading + Error state + Retry
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Brain, Database, Zap, Users, Search,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Bot
} from 'lucide-react';
import aiAdminService from '../../../lib/aiAdminService';

// ─── Skeleton Loading ────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
        <div className="h-7 bg-slate-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-6" /></td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200" />
        <div>
          <div className="h-4 bg-slate-200 rounded w-28 mb-1" />
          <div className="h-3 bg-slate-200 rounded w-36" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
  </tr>
);

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
      <AlertCircle size={32} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">Không thể tải dữ liệu</h3>
    <p className="text-slate-500 mb-6 max-w-md">{message || 'Có lỗi xảy ra khi kết nối đến AI Service.'}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
    >
      <RefreshCw size={16} /> Thử lại
    </button>
  </div>
);

// ─── Format thời gian ────────────────────────────────────────────────────────
const formatTimeAgo = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// ─── Component chính ─────────────────────────────────────────────────────────
const AiMonitoring = () => {
  const [stats, setStats] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        aiAdminService.getStats(),
        aiAdminService.getUsers(page, 8),
      ]);
      setStats(statsRes);
      setUsersData(usersRes);
    } catch (err) {
      console.error('[AiMonitoring] Lỗi fetch:', err);
      setError(err.response?.data?.message || err.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter users theo search term
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    if (!debouncedSearch) return usersData.users;
    const lower = debouncedSearch.toLowerCase();
    return usersData.users.filter(
      (u) =>
        (u.fullName || '').toLowerCase().includes(lower) ||
        (u.email || '').toLowerCase().includes(lower)
    );
  }, [usersData, debouncedSearch]);

  // ─── Render Error ──────────────────────────────────────────────────────────
  if (error && !stats) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Giám sát AI</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  // ─── Stat Cards Config ─────────────────────────────────────────────────────
  const statCards = stats
    ? [
        {
          label: 'Tổng Intents',
          value: stats.total_intents,
          icon: Brain,
          color: 'bg-violet-100 text-violet-600',
        },
        {
          label: 'Mẫu câu huấn luyện',
          value: stats.total_samples,
          icon: Database,
          color: 'bg-blue-100 text-blue-600',
        },
        {
          label: 'Cache Hit Rate',
          value: `${stats.cache_hit_rate}%`,
          icon: Zap,
          color: 'bg-emerald-100 text-emerald-600',
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Giám sát AI</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi hoạt động và hiệu suất AI chatbot</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading && !stats
          ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Intent Breakdown */}
      {stats?.intent_breakdown && Object.keys(stats.intent_breakdown).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Phân bổ Intent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(stats.intent_breakdown).map(([tag, count]) => {
              const pct = stats.total_samples > 0 ? Math.round((count / stats.total_samples) * 100) : 0;
              const colors = {
                tim_mon_an: 'bg-orange-500',
                tim_dia_diem: 'bg-blue-500',
                hoi_thoi_tiet: 'bg-cyan-500',
              };
              return (
                <div key={tag} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{tag}</span>
                    <span className="text-xs text-slate-500">{count} mẫu</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors[tag] || 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">Người dùng AI</h2>
            {usersData && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {usersData.totalElements} người
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">STT</th>
                <th className="px-6 py-3 font-semibold">Người dùng</th>
                <th className="px-6 py-3 font-semibold">Phiên chat</th>
                <th className="px-6 py-3 font-semibold">Tin nhắn</th>
                <th className="px-6 py-3 font-semibold">Hoạt động</th>
                <th className="px-6 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !usersData
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                : filteredUsers.length > 0
                ? filteredUsers.map((user, idx) => (
                    <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {page * 8 + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                              <Bot size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.fullName || 'Chưa đặt tên'}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{user.totalSessions}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{user.totalMessages}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatTimeAgo(user.lastSessionAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        {debouncedSearch
                          ? `Không tìm thấy kết quả cho "${debouncedSearch}"`
                          : 'Chưa có người dùng nào tương tác với AI'}
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Trang {usersData.currentPage + 1} / {usersData.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(usersData.totalPages - 1, p + 1))}
                disabled={page >= usersData.totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner (if error but data exists) */}
      {error && stats && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
          <button onClick={fetchData} className="text-sm font-semibold text-amber-700 hover:text-amber-900 ml-auto">
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default AiMonitoring;
