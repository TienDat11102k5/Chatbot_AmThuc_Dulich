/**
 * AILogsPage.jsx — Trang AI Center: Quản lý Prompt & Logs.
 *
 * Thiết kế theo Stitch "Admin - AI Center":
 * - Stats cards: Tổng cuộc hội thoại / Avg response time / Success rate
 * - Bảng logs hội thoại AI: ID / User / Prompt preview / Model / Thời gian / Trạng thái
 * - Filter theo khoảng thời gian + trạng thái
 */

import { useState } from 'react';
import { Bot, Clock, CheckCircle, XCircle, Search, TrendingUp } from 'lucide-react';

// ─── Stats AI ────────────────────────────────────────────────────────────────
const AI_STATS = [
  { label: 'Tổng cuộc hội thoại hôm nay', value: '4,532', icon: Bot,          bg: 'bg-blue-50 text-blue-600',    trend: '+12%' },
  { label: 'Thời gian phản hồi trung bình', value: '1.4s',  icon: Clock,        bg: 'bg-amber-50 text-amber-600', trend: '-0.2s' },
  { label: 'Tỷ lệ thành công',             value: '98.7%', icon: CheckCircle,  bg: 'bg-emerald-50 text-emerald-600', trend: '+0.3%' },
];

// ─── Dữ liệu logs AI ─────────────────────────────────────────────────────────
const AI_LOGS = [
  { id: '#AI-1021', user: 'nam.lh@example.com', prompt: 'Lập lịch trình 3 ngày Đà Nẵng cho gia đình 4 người...', model: 'Gemini 1.5 Pro', time: '0.8s', status: 'success', timestamp: '02:14 16/03' },
  { id: '#AI-1020', user: 'thao.tt@testmail.vn', prompt: 'Gợi ý nhà hàng hải sản ngon ở Nha Trang giá tầm trung...', model: 'Gemini 1.5 Flash', time: '1.1s', status: 'success', timestamp: '01:58 16/03' },
  { id: '#AI-1019', user: 'duy.travel@outlook.com', prompt: 'So sánh Pacific Ocean Hotel với Mường Thanh Đà Nẵng...', model: 'Gemini 1.5 Pro', time: '2.3s', status: 'failed', timestamp: '01:42 16/03' },
  { id: '#AI-1018', user: 'minhanh.ng@gmail.com', prompt: 'Hành trình phượt Hà Giang 5 ngày 4 đêm cho nhóm 3 bạn...', model: 'Gemini 1.5 Flash', time: '1.5s', status: 'success', timestamp: '01:20 16/03' },
  { id: '#AI-1017', user: 'linh.pham@gmail.com', prompt: 'Top 10 quán cà phê view đẹp Hội An cho chụp ảnh...', model: 'Gemini 1.5 Flash', time: '0.9s', status: 'success', timestamp: '00:55 16/03' },
  { id: '#AI-1016', user: 'hieu.ho@company.com', prompt: 'Tư vấn tour Đông Bắc Việt Nam dịp Tết Nguyên Đán...', model: 'Gemini 1.5 Pro', time: '1.7s', status: 'success', timestamp: '00:30 16/03' },
];

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
  }`}>
    {status === 'success' ? <CheckCircle size={11} /> : <XCircle size={11} />}
    {status === 'success' ? 'Thành công' : 'Thất bại'}
  </span>
);

const AILogsPage = () => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');

  const filtered = AI_LOGS.filter((l) => {
    const matchSearch = l.user.includes(search) || l.prompt.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Center — Prompt & Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Giám sát toàn bộ hoạt động AI trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AI_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-emerald-600 text-sm font-semibold mt-2 flex items-center gap-1">
                <TrendingUp size={13} /> {stat.trend} so với hôm qua
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm user hoặc prompt..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all appearance-none cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>

      {/* Bảng logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Log ID', 'Người dùng', 'Prompt', 'Model', 'Thời gian', 'Trạng thái', 'Lúc'].map((h, i) => (
                  <th key={h} className={`px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 2 ? 'w-64' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono text-primary-600 font-semibold">{log.id}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 max-w-[140px] truncate">{log.user}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">{log.prompt}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      {log.model}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-mono">{log.time}</td>
                  <td className="px-5 py-4"><StatusBadge status={log.status} /></td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Không có log phù hợp
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

export default AILogsPage;
