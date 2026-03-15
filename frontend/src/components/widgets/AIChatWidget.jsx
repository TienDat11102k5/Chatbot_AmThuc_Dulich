/**
 * AIChatWidget.jsx — Widget chat AI nổi, cải tiến theo thiết kế Stitch.
 *
 * Nâng cấp so với phiên bản cũ:
 * - Nút floating có pulse animation + badge "Ask AI"
 * - Quick suggestion chips để user click ngay
 * - Avatar icon cho từng tin nhắn
 * - Transition mở/đóng cửa sổ mượt (scale + opacity)
 * - Link "Mở đầy đủ AI Planner" ở footer
 * - Typing indicator 3 chấm bounce
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Bot, User, ExternalLink } from 'lucide-react';

// ─── Gợi ý nhanh cho user ─────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  '🍜 Phở ngon nhất Hà Nội?',
  '✈️ Lịch trình Đà Nẵng 3 ngày',
  '☕ Café view đẹp Sài Gòn',
  '🏖️ Bãi biển đẹp miền Trung',
];

// ─── Tin nhắn AI ban đầu ──────────────────────────────────────────────────────
const INITIAL_MESSAGE = {
  id: 0,
  role: 'assistant',
  content: 'Xin chào! Tôi là **SavoryAI** 🍜\nTôi có thể giúp bạn tìm nhà hàng ngon, gợi ý món ăn hoặc lên kế hoạch chuyến đi. Bạn muốn khám phá gì hôm nay?',
};

// ─── Map câu hỏi → câu trả lời demo ──────────────────────────────────────────
const DEMO_RESPONSES = {
  'phở':    'Phở Thìn Bờ Hồ (61 Đinh Tiên Hoàng) và Phở Bat Dan (49 Bát Đàn) là 2 địa chỉ legendary nhất Hà Nội! Cả hai đều mở từ 6h sáng và bán hết trước 9h nên đến sớm nhé 🍲',
  'đà nẵng': 'Lịch trình Đà Nẵng 3 ngày đề xuất:\n✅ Ngày 1: Bãi Mỹ Khê → Cầu Rồng về đêm\n✅ Ngày 2: Bà Nà Hills → Cầu Vàng\n✅ Ngày 3: Hội An phố cổ + Bánh Mì Phượng',
  'café':   'Top 5 café rooftop Sài Gòn:\n☕ The Workshop - Q1\n☕ Saigon Social Club - Q3\n☕ Nhà Hát Lớn Café - Q1\n☕ Gác Xép - Q1\n☕ 10 Ly Tự Trọng - Q1',
  'bãi biển': 'Bãi biển đẹp miền Trung:\n🏖️ An Bàng (Hội An) - nước xanh, ít người\n🏖️ Mỹ Khê (Đà Nẵng) - sóng lớn, cát trắng\n🏖️ Lăng Cô (Huế) - hoang sơ, vắng\n🏖️ Quy Nhơn - đẹp nhất miền Trung hiện tại!',
};

// ─── Helper: tạo câu trả lời AI demo ──────────────────────────────────────────
function getAIReply(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  return `Câu hỏi hay! Tôi đang xử lý: "${text}"\n\nĐể có câu trả lời chi tiết nhất, hãy thử **Mở AI Planner đầy đủ** nhé! 🚀`;
}

function AIChatWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll đến tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Gửi tin nhắn
  function handleSend(text = inputText) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuick(false); // Ẩn quick suggestions sau lần gửi đầu
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: trimmed }]);
    setInputText('');
    setIsLoading(true);

    // Giả lập AI phản hồi sau 1s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: getAIReply(trimmed) },
      ]);
      setIsLoading(false);
    }, 1000 + Math.random() * 500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* ================================================================
          CỬA SỔ CHAT
          ================================================================ */}
      <div className={`
        fixed z-50 bottom-24 right-4 sm:right-6
        w-[calc(100vw-32px)] sm:w-96
        max-h-[70vh] sm:max-h-[520px]
        bg-white rounded-2xl shadow-2xl border border-slate-200
        flex flex-col overflow-hidden
        transition-all duration-300 ease-out origin-bottom-right
        ${isOpen
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-90 pointer-events-none'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">SavoryAI</p>
              <p className="text-primary-200 text-xs mt-0.5">Trợ lý ẩm thực & du lịch</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-[10px] font-medium">Online</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-0.5"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-primary-600'
              }`}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              {/* Bubble */}
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary-600">
                <Bot size={13} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Quick suggestions (chỉ hiện khi chưa có tin nhắn nào từ user) */}
          {showQuick && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/10 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về ẩm thực, địa điểm..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none min-w-0"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white disabled:opacity-40 disabled:bg-slate-300 transition-all hover:bg-primary-700 flex-shrink-0"
              aria-label="Gửi"
            >
              <Send size={13} />
            </button>
          </div>
          {/* Link sang AI Planner đầy đủ */}
          <Link
            to="/planner"
            onClick={() => setIsOpen(false)}
            className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors"
          >
            <ExternalLink size={11} />
            Mở AI Planner đầy đủ
          </Link>
        </div>
      </div>

      {/* ================================================================
          NÚT FLOATING (luôn hiển thị, pulse animation khi đóng)
          ================================================================ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-5 right-4 sm:right-6 z-50
          w-14 h-14 rounded-full
          bg-primary-600 hover:bg-primary-700
          text-white shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-200 active:scale-95
          ${!isOpen ? 'animate-none' : ''}
        `}
        aria-label={isOpen ? 'Đóng chat AI' : 'Mở chat AI'}
      >
        <div className={`transition-all duration-200 ${isOpen ? 'rotate-0' : 'rotate-0'}`}>
          {isOpen ? <X size={24} /> : <Sparkles size={22} />}
        </div>
        {/* Ping animation ring khi đóng */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
          </span>
        )}
      </button>
    </>
  );
}

export default AIChatWidget;
