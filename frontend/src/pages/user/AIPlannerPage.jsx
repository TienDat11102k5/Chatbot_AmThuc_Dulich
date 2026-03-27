/**
 * AIPlannerPage.jsx — Trang AI Travel Planner, chia đôi Chat + Map.
 *
 * Migration từ mock data sang API thật:
 * - Nhận sessionId từ URL param (?sessionId=xxx) để load lịch sử chat
 * - Gọi chatService.createSession() + chatService.streamChat()
 * - Streaming responses qua SSE (typing effect)
 * - DOMPurify chống XSS khi render markdown
 * - Metadata (recommendations) → map pins
 * - AbortController cleanup khi unmount
 * - Race condition guard (isProcessingRef)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Plus, MapPin, Bookmark, X, RotateCcw } from 'lucide-react';
import DOMPurify from 'dompurify';
import chatService from '../../lib/chatService';
import useAuth from '../../hooks/useAuth';

// ─── Filter chips cho bản đồ ─────────────────────────────────────────────────
const FILTERS = [
  { id: 'breakfast', label: 'Ăn sáng', color: 'bg-red-500' },
  { id: 'lunch', label: 'Ăn trưa', color: 'bg-orange-500' },
  { id: 'dinner', label: 'Ăn tối', color: 'bg-blue-500' },
  { id: 'cafe', label: 'Cafe & Chill', color: 'bg-green-500' },
];

// ─── Sanitize HTML content from AI ───────────────────────────────────────────
function sanitizeContent(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'a', 'h3', 'h4', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

const AIPlannerPage = () => {
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  // Map state — pins populated from AI metadata
  const [mapPins, setMapPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['breakfast']);

  // Refs
  const sessionIdRef = useRef(urlSessionId || null);
  const abortRef = useRef(null);
  const isProcessingRef = useRef(false);
  const chatEndRef = useRef(null);
  const lastUserMsgRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load existing session messages if sessionId in URL
  useEffect(() => {
    if (!urlSessionId) return;
    sessionIdRef.current = urlSessionId;

    const loadHistory = async () => {
      try {
        const data = await chatService.getSessionMessages(urlSessionId);
        if (data && data.length > 0) {
          setMessages(data.map((m, i) => ({
            id: m.id || i,
            type: m.role === 'USER' ? 'user' : 'ai',
            text: m.content || '',
            timestamp: m.createdAt,
          })));
        }
      } catch (err) {
        console.error('[AIPlannerPage] Failed to load session history:', err);
      }
    };
    loadHistory();
  }, [urlSessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.(); };
  }, []);

  // Toggle map filter
  const toggleFilter = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // ─── Send message & stream AI response ─────────────────────────────────────
  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setError(null);
    lastUserMsgRef.current = trimmed;

    // Add user message to UI
    const userMsg = { id: Date.now(), type: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Create session if first message
      if (!sessionIdRef.current) {
        const session = await chatService.createSession(userId, trimmed);
        sessionIdRef.current = session.id;
      }

      // Stream AI response
      const botMsgId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botMsgId, type: 'ai', text: '' }]);

      abortRef.current = chatService.streamChat(
        sessionIdRef.current,
        trimmed,
        {
          onChunk: (chunk) => {
            setMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg && lastMsg.id === botMsgId) {
                lastMsg.text += chunk;
              }
              return updated;
            });
          },
          onMetadata: (meta) => {
            // Convert recommendations → map pins
            if (meta?.recommendations && Array.isArray(meta.recommendations)) {
              const newPins = meta.recommendations.map((rec, i) => ({
                id: Date.now() + i,
                top: `${20 + (i * 15)}%`,
                left: `${25 + (i * 12)}%`,
                label: rec.name || rec.place_name || `Địa điểm ${i + 1}`,
                address: rec.address || '',
                rating: rec.rating || 0,
              }));
              setMapPins(prev => [...prev, ...newPins]);
              if (newPins.length > 0) setActivePin(newPins[0]);
            }
          },
          onDone: () => {
            setIsTyping(false);
            isProcessingRef.current = false;
            abortRef.current = null;
          },
          onError: (errMsg) => {
            setIsTyping(false);
            isProcessingRef.current = false;
            abortRef.current = null;
            setError(errMsg);
          },
        }
      );
    } catch (err) {
      console.error('[AIPlannerPage] Error:', err);
      setIsTyping(false);
      isProcessingRef.current = false;
      setError(err.message || 'Không thể kết nối tới AI');
    }
  }, [inputText, userId]);

  // ─── Retry last message ────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (lastUserMsgRef.current) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.type === 'ai' && !last.text) return prev.slice(0, -1);
        return prev;
      });
      setError(null);
      setInputText(lastUserMsgRef.current);
      // Trigger send on next tick
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSendMessage(fakeEvent);
      }, 0);
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <main className="flex flex-1 overflow-hidden">

        {/* ═══════════════════════════════════════════════════
         * CỘT TRÁI: CHAT AI
         * ═══════════════════════════════════════════════════ */}
        <aside className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-slate-200 bg-white shrink-0">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 shrink-0">
            <h1 className="text-2xl font-bold text-slate-900">AI Travel Planner</h1>
            <p className="text-sm text-slate-500 mt-1">Thiết kế hành trình ẩm thực của riêng bạn</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Empty state */}
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center text-3xl mb-4">🍜</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Xin chào!</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Hãy hỏi tôi về ẩm thực, du lịch, hoặc yêu cầu lên lịch trình.<br />
                  Ví dụ: &quot;Gợi ý lịch trình ăn uống 3 ngày tại Đà Nẵng&quot;
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'user' ? (
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
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-xs">🤖</div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SavoryTrip AI</span>
                    </div>
                    <div
                      className="max-w-[90%] rounded-2xl rounded-tl-none bg-slate-50 p-5 text-slate-800 shadow-sm border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: sanitizeContent(msg.text) }}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
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

            {/* Error with Retry */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mt-2">
                <p className="text-xs text-red-600 flex-1">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-xs text-red-600 font-medium hover:text-red-700 bg-red-100 px-2 py-1 rounded-lg transition-colors"
                >
                  <RotateCcw size={12} />
                  Thử lại
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
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
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
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
          {/* Background map image */}
          <div className="absolute inset-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdCYJPy3ZVi1r3Sc-VWTxbDivD5JPFgHWAJGTnekp8SiIlKYO2FU9t_SQTHP-YyDyvwuW2ouLXATJY_lzS0e1o5YhvD8n8ViJX0Al3keyyh8YJrUQaVJaseab1v9lAsL3mxwGqzb0--7aknJvMnAuS4NjOBI-K50MAQyhZzvaboX9rBBBc6ytfgHHpryhcs880U1U9TVouhfQMcgJIc4u2tvKD_9Ly6nc7-41Col9TbNU4fXGNkddpsbv0l8bNvDQ-wuNG_M8iiIo"
              alt="Bản đồ Đà Nẵng"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* Dynamic map pins from AI metadata */}
          {mapPins.map((pin) => (
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

          {/* Empty state for map */}
          {mapPins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center max-w-xs shadow-lg">
                <MapPin size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Hỏi AI về địa điểm ẩm thực để hiện các pin trên bản đồ
                </p>
              </div>
            </div>
          )}

          {/* Floating info card */}
          {activePin && (
            <div
              className="absolute z-20 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
              style={{ top: `calc(${activePin.top} - 170px)`, left: activePin.left, transform: 'translateX(-50%)' }}
            >
              <div className="h-24 w-full bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center text-3xl">
                🍜
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-slate-900 flex-1 mr-2 leading-tight">{activePin.label}</h4>
                  {activePin.rating > 0 && (
                    <span className="text-accent-500 text-xs font-bold shrink-0">⭐ {activePin.rating}</span>
                  )}
                </div>
                {activePin.address && (
                  <p className="text-[11px] text-slate-500 mb-3">{activePin.address}</p>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="px-2 py-1.5 bg-accent-500/20 text-accent-600 rounded-lg hover:bg-accent-500/30 transition-colors">
                    <Bookmark size={12} />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100" />
            </div>
          )}

          {/* Close info card button */}
          {activePin && (
            <button
              onClick={() => setActivePin(null)}
              className="absolute z-30 top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-slate-50"
              aria-label="Đóng"
            >
              <X size={14} />
            </button>
          )}

          {/* Filter chips */}
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

          {/* Save itinerary button */}
          <div className="absolute bottom-8 right-8 z-20">
            <button className="flex items-center gap-3 px-8 py-4 bg-accent-500 rounded-full shadow-2xl hover:scale-105 transition-transform text-slate-900 font-bold">
              <Bookmark size={20} />
              Lưu lịch trình
            </button>
          </div>

          {/* City label */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-900">📍 Đà Nẵng, Việt Nam</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIPlannerPage;
