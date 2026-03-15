/**
 * ChatHistoryPage.jsx — Trang Lịch sử hội thoại AI.
 *
 * Thiết kế theo Stitch "User AI Chat History" + "Empty AI History":
 * - Danh sách card hội thoại: icon AI, tiêu đề, preview + timestamp + nút Tiếp tục
 * - Filter: Gần nhất / Theo tháng
 * - Empty state: illustration + CTA "Bắt đầu ngay"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Clock, MessageSquare, ArrowRight, Sparkles, Trash2 } from 'lucide-react';

// ─── Dữ liệu mẫu lịch sử chat ───────────────────────────────────────────────
const CHAT_SESSIONS = [
  {
    id: 1,
    title: 'Lịch trình 3 ngày Đà Nẵng',
    preview: 'AI: Anh nên dậy sớm để thăm Bà Nà Hills trước 9h sáng, lúc đó ít khách và ánh sáng đẹp nhất...',
    timestamp: '2 giờ trước',
    messages: 14,
    emoji: '🌉',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    title: 'Tìm quán ăn ngon Hội An',
    preview: 'AI: Bánh Mì Phượng tại số 2B Phan Châu Trinh là địa chỉ không thể bỏ lỡ, mở cửa từ 6h sáng...',
    timestamp: 'Hôm qua',
    messages: 8,
    emoji: '🥖',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 3,
    title: 'Kế hoạch Food Tour Sài Gòn',
    preview: 'AI: Tôi gợi ý bắt đầu từ cơm tấm Bà Bảy lúc 7h, sau đó di chuyển sang bánh mì...',
    timestamp: '3 ngày trước',
    messages: 22,
    emoji: '🍜',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 4,
    title: 'Gợi ý quán café view đẹp Hà Nội',
    preview: 'AI: Với yêu cầu "rooftop view" tại Hà Nội, tôi đề xuất danh sách 5 quán nổi bật như Skyline Coffee...',
    timestamp: '1 tuần trước',
    messages: 6,
    emoji: '☕',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: 5,
    title: 'Chuyến đi Phú Quốc 5 ngày 4 đêm',
    preview: 'AI: Ngày 1 nên đến bãi Sao, đây là bãi biển đẹp nhất Phú Quốc với cát trắng mịn và nước xanh trong...',
    timestamp: '2 tuần trước',
    messages: 31,
    emoji: '🏖️',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

// ─── Card hội thoại ───────────────────────────────────────────────────────────
const ChatCard = ({ session, onDelete }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex items-start gap-5">
    {/* Icon emoji đại diện */}
    <div className={`w-14 h-14 rounded-2xl ${session.color} flex items-center justify-center text-2xl flex-shrink-0`}>
      {session.emoji}
    </div>
    {/* Nội dung */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
          {session.title}
        </h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs whitespace-nowrap flex-shrink-0">
          <Clock size={11} />
          <span>{session.timestamp}</span>
        </div>
      </div>
      <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
        {session.preview}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <MessageSquare size={12} />
          <span>{session.messages} tin nhắn</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Xoá */}
          <button
            onClick={() => onDelete(session.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
          {/* Tiếp tục chat */}
          <Link
            to="/planner"
            className="flex items-center gap-1.5 text-primary-600 font-bold text-sm hover:gap-2.5 transition-all"
          >
            Tiếp tục <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

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

const ChatHistoryPage = () => {
  const [sessions, setSessions] = useState(CHAT_SESSIONS);
  const [filter, setFilter] = useState('all');

  const handleDelete = (id) => {
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
        {sessions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
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
