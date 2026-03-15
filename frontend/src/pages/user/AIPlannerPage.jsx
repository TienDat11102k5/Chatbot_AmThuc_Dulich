/**
 * AIPlannerPage.jsx
 *
 * Trang AI Travel Planner - Giao diện chia đôi:
 * - BÊN TRÁI: Panel chat AI (chiều rộng cố định ~450px)
 *     + Header: tiêu đề + mô tả trang
 *     + Danh sách tin nhắn (user bubble Vàng, AI bubble xám)
 *     + Input gõ tin nhắn phía dưới
 * - BÊN PHẢI: Panel bản đồ tương tác (flex-1)
 *     + Hình ảnh bản đồ làm nền
 *     + Các pin địa điểm màu Vàng
 *     + Floating info card khi hover
 *     + Filter chips (Ăn sáng / Ăn trưa / Ăn tối / Cafe)
 *     + Nút "Lưu lịch trình" màu Vàng
 *
 * Thiết kế theo Stitch "AI Travel Planner Split View".
 * Màu nhấn Vàng (#f2cc0d) cho user bubble, AI avatar, pins.
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Plus, MapPin, Bookmark, X } from 'lucide-react';

// ─── Dữ liệu demo: lịch sử chat ban đầu ──────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'user',
    text: 'Gợi ý cho mình lịch trình ăn uống 3 ngày tại Đà Nẵng với, mình thích các món địa phương!',
  },
  {
    id: 2,
    type: 'ai',
    text: 'Chào bạn! Đà Nẵng là thiên đường ẩm thực miền Trung. Đây là gợi ý lịch trình 3 ngày cho bạn:',
    schedule: [
      { day: 'Ngày 1: Hương vị truyền thống', icon: '📅', items: ['• Sáng: Mì Quảng Bà Mua (Trần Bình Trọng)', '• Trưa: Bánh tráng cuốn thịt heo Trần', '• Tối: Bánh xèo, Nem lụi Bà Dưỡng'] },
      { day: 'Ngày 2: Hải sản & Ăn vặt', icon: '🍽️', items: ['• Sáng: Bún chả cá Ông Tạ', '• Trưa: Cơm gà A Hải', '• Tối: Hải sản Năm Rảnh hoặc Bé Mặn'] },
      { day: 'Ngày 3: Cafe & Đặc sản', icon: '☕', items: ['• Sáng: Bún mắm nêm cô Liên', '• Trưa: Bê thui Cầu Mống', '• Chiều: Chè Liên & Cafe Cộng'] },
    ],
  },
];

// ─── Dữ liệu demo: các pin trên bản đồ ────────────────────────────────────────
const MAP_PINS = [
  { id: 1, top: '25%', left: '33%', active: true, label: 'Bánh tráng cuốn thịt heo Trần', address: '4 Lê Duẩn, Hải Châu, Đà Nẵng', rating: 4.5 },
  { id: 2, top: '50%', left: '52%', active: false, label: 'Mì Quảng Bà Mua', address: 'Trần Bình Trọng, Đà Nẵng', rating: 4.8 },
  { id: 3, top: '67%', left: '24%', active: false, label: 'Cơm gà A Hải', address: 'Lê Đình Dương, Đà Nẵng', rating: 4.3 },
  { id: 4, top: '35%', left: '72%', active: false, label: 'Hải sản Năm Rảnh', address: 'Phạm Văn Đồng, Đà Nẵng', rating: 4.6 },
];

// ─── Nhãn filter cho bản đồ ───────────────────────────────────────────────────
const FILTERS = [
  { id: 'breakfast', label: 'Ăn sáng', color: 'bg-red-500' },
  { id: 'lunch', label: 'Ăn trưa', color: 'bg-orange-500' },
  { id: 'dinner', label: 'Ăn tối', color: 'bg-blue-500' },
  { id: 'cafe', label: 'Cafe & Chill', color: 'bg-green-500' },
];

const AIPlannerPage = () => {
  // State tin nhắn trong hội thoại
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  // State nội dung ô input
  const [inputText, setInputText] = useState('');
  // State pin đang được hover trên bản đồ (hiển thị info card)
  const [activePin, setActivePin] = useState(MAP_PINS[0]);
  // State filter đang được chọn
  const [activeFilters, setActiveFilters] = useState(['breakfast']);
  // Trạng thái AI đang trả lời (typing indicator)
  const [isTyping, setIsTyping] = useState(false);

  // Ref để auto-scroll xuống cuối danh sách chat
  const chatEndRef = useRef(null);

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Toggle chọn/bỏ một filter trên bản đồ.
   * @param {string} filterId - ID của filter
   */
  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  /**
   * Gửi tin nhắn người dùng và nhận phản hồi AI giả lập.
   * TODO: Thay thế bằng API call thực tế đến backend AI service.
   * @param {React.FormEvent} e - Sự kiện onSubmit
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Thêm tin nhắn của người dùng vào danh sách
    const userMsg = { id: Date.now(), type: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Hiển thị "AI đang gõ..."
    setIsTyping(true);

    // Giả lập delay phản hồi AI (1.5 giây)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Thêm phản hồi AI mẫu
    const aiMsg = {
      id: Date.now() + 1,
      type: 'ai',
      text: `Cảm ơn câu hỏi của bạn về "${trimmed}". Tôi đang phân tích các địa điểm phù hợp nhất... Bạn có muốn tôi lọc theo loại hình ẩm thực cụ thể không?`,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    // Layout chiếm toàn bộ chiều cao viewport, không cuộn ngoài
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <main className="flex flex-1 overflow-hidden">

        {/* ═══════════════════════════════════════════════════
         * CỘT TRÁI: CHAT AI (chiều rộng 450px cố định)
         * ═══════════════════════════════════════════════════ */}
        <aside className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-slate-200 bg-white shrink-0">
          {/* Header panel chat */}
          <div className="p-6 border-b border-slate-100 shrink-0">
            <h1 className="text-2xl font-bold text-slate-900">AI Travel Planner</h1>
            <p className="text-sm text-slate-500 mt-1">Thiết kế hành trình ẩm thực của riêng bạn</p>
          </div>

          {/* Khu vực hiển thị tin nhắn (cuộn được) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'user' ? (
                  /* Tin nhắn người dùng: bubble Vàng, căn phải */
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bạn</span>
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</div>
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-accent-500 p-4 text-slate-900 shadow-sm">
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  /* Tin nhắn AI: bubble xám, căn trái */
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-xs">🤖</div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SavoryTrip AI</span>
                    </div>
                    <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-50 p-5 text-slate-800 shadow-sm border border-slate-100">
                      <p className="text-sm mb-3 leading-relaxed">{msg.text}</p>
                      {/* Hiển thị lịch trình theo ngày nếu có */}
                      {msg.schedule && (
                        <div className="space-y-4">
                          {msg.schedule.map((day, i) => (
                            <div key={i}>
                              <h3 className="text-accent-600 font-bold text-sm uppercase flex items-center gap-2 mb-2">
                                <span>{day.icon}</span> {day.day}
                              </h3>
                              <ul className="space-y-1.5">
                                {day.items.map((item, j) => (
                                  <li key={j} className="text-sm text-slate-700">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator khi AI đang trả lời */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-xs">🤖</div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {/* Anchor để tự động scroll xuống */}
            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập tin nhắn cố định dưới cùng */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200">
              <Plus size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Hỏi thêm về các địa điểm..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-1 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-slate-900 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Gửi tin nhắn"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════
         * CỘT PHẢI: BẢN ĐỒ TƯƠNG TÁC
         * ═══════════════════════════════════════════════════ */}
        <section className="flex-1 relative bg-slate-200 overflow-hidden">
          {/* Hình nền bản đồ (Đà Nẵng) */}
          <div className="absolute inset-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdCYJPy3ZVi1r3Sc-VWTxbDivD5JPFgHWAJGTnekp8SiIlKYO2FU9t_SQTHP-YyDyvwuW2ouLXATJY_lzS0e1o5YhvD8n8ViJX0Al3keyyh8YJrUQaVJaseab1v9lAsL3mxwGqzb0--7aknJvMnAuS4NjOBI-K50MAQyhZzvaboX9rBBBc6ytfgHHpryhcs880U1U9TVouhfQMcgJIc4u2tvKD_9Ly6nc7-41Col9TbNU4fXGNkddpsbv0l8bNvDQ-wuNG_M8iiIo"
              alt="Bản đồ Đà Nẵng"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* Các pin địa điểm trên bản đồ */}
          {MAP_PINS.map((pin) => (
            <button
              key={pin.id}
              onClick={() => setActivePin(pin)}
              className="absolute group cursor-pointer z-10"
              style={{ top: pin.top, left: pin.left }}
              aria-label={pin.label}
            >
              <MapPin
                size={36}
                className={`drop-shadow-md transition-transform group-hover:scale-125 ${
                  pin.id === activePin?.id
                    ? 'text-accent-500 animate-bounce'
                    : 'text-accent-400 hover:text-accent-500'
                }`}
                fill="currentColor"
              />
            </button>
          ))}

          {/* Floating info card của pin đang được chọn */}
          {activePin && (
            <div
              className="absolute z-20 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
              style={{ top: `calc(${activePin.top} - 170px)`, left: activePin.left, transform: 'translateX(-50%)' }}
            >
              {/* Ảnh placeholder địa điểm */}
              <div className="h-24 w-full bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center text-3xl">
                🍜
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-slate-900 flex-1 mr-2 leading-tight">{activePin.label}</h4>
                  <span className="text-accent-500 text-xs font-bold shrink-0">⭐ {activePin.rating}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">{activePin.address}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="px-2 py-1.5 bg-accent-500/20 text-accent-600 rounded-lg hover:bg-accent-500/30 transition-colors">
                    <Bookmark size={12} />
                  </button>
                </div>
              </div>
              {/* Arrow tooltip */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100" />
            </div>
          )}

          {/* Nút đóng info card */}
          {activePin && (
            <button
              onClick={() => setActivePin(null)}
              className="absolute z-30 top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-slate-50"
              aria-label="Đóng"
            >
              <X size={14} />
            </button>
          )}

          {/* Filter chips góc dưới trái */}
          <div className="absolute bottom-8 left-8 z-20 flex flex-wrap gap-2 max-w-[calc(100%-180px)]">
            {FILTERS.map((filter) => {
              const selected = activeFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition-all ${
                    selected
                      ? 'bg-white border-2 border-primary-600 text-primary-600'
                      : 'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filter.color}`} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Nút "Lưu lịch trình" góc dưới phải, màu Vàng */}
          <div className="absolute bottom-8 right-8 z-20">
            <button className="flex items-center gap-3 px-8 py-4 bg-accent-500 rounded-full shadow-2xl hover:scale-105 transition-transform text-slate-900 font-bold">
              <Bookmark size={20} />
              Lưu lịch trình
            </button>
          </div>

          {/* Nhãn góc trên phải: tên thành phố */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-900">📍 Đà Nẵng, Việt Nam</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIPlannerPage;
