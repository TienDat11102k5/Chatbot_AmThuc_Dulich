/**
 * ChatHistoryPage.jsx — Trang Lịch sử hội thoại AI.
 *
 * Thiết kế theo Stitch "User AI Chat History" + "Empty AI History":
 * - Danh sách card hội thoại: icon AI, tiêu đề, preview + timestamp + nút Tiếp tục
 * - Filter: Gần nhất / Theo tháng
 * - Empty state: illustration + CTA "Bắt đầu ngay"
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Clock, MessageSquare, ArrowRight, Sparkles, Trash2, Loader2, AlertCircle } from 'lucide-react';
import chatService from '../../lib/chatService';
import useAuth from '../../hooks/useAuth';

// ─── Hàm phụ trợ để format thời gian ──────────────────────────────────────────
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Gần đây';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// ─── Card hội thoại rỗng lúc loading ─────────────────────────────────────────
const ChatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-5 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-slate-200 flex-shrink-0"></div>
    <div className="flex-1">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
        <div className="h-4 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// ─── Card hội thoại (Dùng API data) ─────────────────────────────────────────
const ChatCard = ({ session, onDelete }) => {
  // Chọn màu/icon ngẫu nhiên vì DB không lưu
  const colors = ['bg-blue-100 text-blue-600', 'bg-yellow-100 text-yellow-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-cyan-100 text-cyan-600'];
  const emojis = ['💬', '🌟', '🍜', '🗺️', '📸'];
  
  const colorIndex = session.title ? session.title.length % colors.length : 0;
  const color = colors[colorIndex];
  const emoji = emojis[colorIndex];

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex items-start gap-5">
      {/* Icon emoji đại diện */}
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
        {emoji}
      </div>
      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
            {session.title || 'Mục hội thoại mới'}
          </h3>
          <div className="flex items-center gap-1 text-slate-400 text-xs whitespace-nowrap flex-shrink-0">
            <Clock size={11} />
            <span>{formatTimeAgo(session.createdAt)}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {session.status === true || session.status === 'ACTIVE' ? 'Đang hoạt động...' : 'Đã kết thúc.'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <MessageSquare size={12} />
            <span>ID: {session.id.substring(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Xoá - TODO: Add API for deleting session */}
            <button
              onClick={() => onDelete(session.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
            </button>
            {/* Tiếp tục chat */}
            <Link
              to={`/planner?sessionId=${session.id}`}
              className="flex items-center gap-1.5 text-primary-600 font-bold text-sm hover:gap-2.5 transition-all"
            >
              Tiếp tục <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-24 h-24 rounded-3xl bg-primary-600/10 flex items-center justify-center mb-6">
      <Bot size={40} className="text-primary-600" />
    </div>
    <h3 className="text-2xl font-bold text-slate-700 mb-3">Chưa có lịch sử hội thoại</h3>
    <p className="text-slate-500 mb-8 max-w-sm">
      Hãy bắt đầu trò chuyện với AI của SavoryTrip để được gợi ý lộ trình du lịch và ẩm thực cá nhân hoá.
    </p>
    <Link
      to="/planner"
      className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-700 transition-all shadow-md hover:gap-3"
    >
      <Sparkles size={18} />
      Bắt đầu ngay với AI
    </Link>
  </div>
);

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
      <AlertCircle size={32} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">Không thể tải lịch sử</h3>
    <p className="text-slate-500 mb-6 max-w-md">{message || "Có lỗi xảy ra khi kết nối đến máy chủ."}</p>
    <button 
      onClick={onRetry}
      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold transition"
    >
      Thử lại
    </button>
  </div>
);

const ChatHistoryPage = () => {
  const { userId } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Wrap trong useCallback để tránh re-create mỗi render
  const fetchSessions = useCallback(async () => {
    if (!userId) {
      console.log('[ChatHistoryPage] No userId, skipping fetch');
      setIsLoading(false);
      return;
    }
    
    console.log('[ChatHistoryPage] Fetching sessions for userId:', userId);
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatService.getUserSessions(userId);
      console.log('[ChatHistoryPage] Received sessions:', data);
      setSessions(data || []);
    } catch (err) {
      console.error("[ChatHistoryPage] Error loading sessions:", err);
      console.error("[ChatHistoryPage] Error details:", err.response?.data || err.message);
      setError(`Không thể tải lịch sử trò chuyện: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter logic cho các tab "Gần nhất" / "Tháng này"
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    if (filter === 'recent') {
      return sessions.filter(s => new Date(s.createdAt) > new Date(now - 7 * 86400000));
    }
    if (filter === 'month') {
      const thisMonth = new Date();
      return sessions.filter(s => {
        const d = new Date(s.createdAt);
        return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
      });
    }
    return sessions;
  }, [sessions, filter]);

  const handleDelete = (id) => {
    // Tạm thời chỉ xoá ở UI, sau này thêm API xoá
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lịch sử AI</h1>
            <p className="text-slate-500 mt-1">{sessions.length} cuộc hội thoại đã lưu</p>
          </div>
          {/* Nút chat mới */}
          <Link
            to="/planner"
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-700 transition-all shadow-md hover:gap-3"
          >
            <Sparkles size={16} />
            Chat mới
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-8">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'recent', label: 'Gần nhất (7 ngày)' },
            { id: 'month', label: 'Tháng này' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                filter === f.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-600 hover:text-primary-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Danh sách chat hoặc Empty State */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <ChatCardSkeleton />
            <ChatCardSkeleton />
            <ChatCardSkeleton />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchSessions} />
        ) : filteredSessions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredSessions.map((session) => (
              <ChatCard key={session.id} session={session} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default ChatHistoryPage;
