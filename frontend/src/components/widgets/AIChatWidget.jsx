/**
 * AIChatWidget.jsx — Widget chat AI nổi, tích hợp API streaming thật.
 *
 * Migration từ mock data sang API thật:
 * - Gọi chatService.createSession() + chatService.streamChat()
 * - Yêu cầu đăng nhập (login overlay nếu chưa auth)
 * - Streaming responses qua SSE (typing effect)
 * - DOMPurify chống XSS khi render markdown
 * - AbortController cleanup khi unmount hoặc đóng widget
 * - Race condition guard (isProcessingRef)
 * - Nút "Thử lại" khi xảy ra lỗi
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Bot, User, ExternalLink, LogIn, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../../lib/chatService';
import useAuth from '../../hooks/useAuth';

// ─── Quick suggestion chips ──────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  '🍜 Phở ngon nhất Hà Nội?',
  '✈️ Lịch trình Đà Nẵng 3 ngày',
  '☕ Café view đẹp Sài Gòn',
  '🏖️ Bãi biển đẹp miền Trung',
];

// ─── Initial greeting message ────────────────────────────────────────────────
const INITIAL_MESSAGE = {
  id: 0,
  role: 'assistant',
  content: 'Xin chào! Tôi là **SavoryAI** 🍜\nTôi có thể giúp bạn tìm nhà hàng ngon, gợi ý món ăn hoặc lên kế hoạch chuyến đi. Bạn muốn khám phá gì hôm nay?',
  timestamp: Date.now(),
};

// ─── Timestamp helpers ───────────────────────────────────────────────────────
const THIRTY_MINUTES = 30 * 60 * 1000;

function shouldShowTimestamp(currentMsg, prevMsg) {
  if (!prevMsg) return true;
  return ((currentMsg.timestamp || 0) - (prevMsg.timestamp || 0)) > THIRTY_MINUTES;
}

function formatChatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return `Hôm nay, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Hôm qua, ${time}`;
  return `${date.toLocaleDateString('vi-VN')}, ${time}`;
}

// ─── Sanitize markdown content ───────────────────────────────────────────────
// Dùng custom style cho markdown content (ul, ol, li, strong)
const MarkdownComponents = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-primary-700" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
  a: ({ node, ...props }) => (
    <a className="text-primary-600 hover:underline hover:text-primary-800 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
  )
};

function AIChatWidget() {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [error, setError] = useState(null);

  // Session & streaming refs
  const sessionIdRef = useRef(null);
  const abortRef = useRef(null);
  const isProcessingRef = useRef(false);
  const messagesEndRef = useRef(null);
  const lastUserMsgRef = useRef(null); // For retry functionality
  const inputRef = useRef(null); // For auto-focusing input
  const chatContainerRef = useRef(null);

  // ─── Drag functionality cho nút Chat ───────────────────────────────────────
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ isDown: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, hasMoved: false });

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current.isDown = true;
    dragInfo.current.hasMoved = false;
    dragInfo.current.startX = e.clientX;
    dragInfo.current.startY = e.clientY;
    dragInfo.current.startPosX = position.x;
    dragInfo.current.startPosY = position.y;
  }, [position]);

  const handlePointerMove = useCallback((e) => {
    if (!dragInfo.current.isDown) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    
    // Chỉ kích hoạt drag khi kéo xa quá 3px (chống nhầm lẫn với click)
    if (!dragInfo.current.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      dragInfo.current.hasMoved = true;
      setIsDragging(true);
    }
    
    if (dragInfo.current.hasMoved) {
      setPosition({
        x: dragInfo.current.startPosX + dx,
        y: dragInfo.current.startPosY + dy
      });
    }
  }, []);

  const handlePointerUp = useCallback((e) => {
    dragInfo.current.isDown = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    setTimeout(() => {
      if (dragInfo.current.hasMoved) {
        setIsDragging(false);
        dragInfo.current.hasMoved = false;
      }
    }, 0);
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    // Sử dụng setTimeout ngắn để đảm bảo DOM render kịp chunk Text mới của ReactMarkdown.
    // Việc này sửa lỗi "khựng, không cuộn sát dưới đáy" khi SSE stream dồn dập
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    const timerId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timerId);
  }, [messages, isLoading]);

  // Auto focus input when chat opens or AI finishes loading
  useEffect(() => {
    if (isOpen && isAuthenticated && !isLoading) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isAuthenticated, isLoading]);

  // Listen for external "open chat" events (e.g. from LandingPage CTA)
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openAIChatWidget', handleOpenChat);
    return () => window.removeEventListener('openAIChatWidget', handleOpenChat);
  }, []);

  // Cleanup: abort stream when widget closes or component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.();
    };
  }, []);

  // ─── Send message handler ──────────────────────────────────────────────────
  const handleSend = useCallback(async (text = inputText) => {
    const trimmed = (typeof text === 'string' ? text : inputText).trim();
    if (!trimmed || isProcessingRef.current) return;

    // Guard: must be authenticated
    if (!isAuthenticated) return;

    isProcessingRef.current = true;
    setShowQuick(false);
    setError(null);
    lastUserMsgRef.current = trimmed;

    // Add user message to UI
    const userTs = Date.now();
    setMessages(prev => [...prev, { id: userTs, role: 'user', content: trimmed, timestamp: userTs }]);
    setInputText('');
    setIsLoading(true);

    try {
      // Step 1: Create session if first message
      if (!sessionIdRef.current) {
        const session = await chatService.createSession(userId, trimmed);
        sessionIdRef.current = session.id;
      }

      // Step 2: Stream AI response
      const botMsgId = Date.now() + 1;

      // Add empty bot message placeholder for streaming
      setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '', timestamp: botMsgId }]);

      abortRef.current = chatService.streamChat(
        sessionIdRef.current,
        trimmed,
        {
          onChunk: (chunk) => {
            // Append chunk to last bot message (streaming effect)
            // IMPORTANT: Create NEW object (immutable) to avoid React StrictMode double-render duplication
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.id === botMsgId) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, content: lastMsg.content + chunk }
                ];
              }
              return prev;
            });
          },
          onMetadata: (meta) => {
            // Metadata received (recommendations, intent) — can be used for map pins
            console.log('[AIChatWidget] Metadata received:', meta);
          },
          onDone: () => {
            setIsLoading(false);
            isProcessingRef.current = false;
            abortRef.current = null;
          },
          onError: (errMsg) => {
            setIsLoading(false);
            isProcessingRef.current = false;
            abortRef.current = null;
            setError(errMsg);
          },
        }
      );
    } catch (err) {
      console.error('[AIChatWidget] Error:', err);
      setIsLoading(false);
      isProcessingRef.current = false;
      setError(err.message || 'Không thể kết nối tới AI');
    }
  }, [inputText, userId, isAuthenticated]);

  // ─── Retry last message ────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (lastUserMsgRef.current) {
      // Remove last bot message (the failed/empty one)
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setError(null);
      handleSend(lastUserMsgRef.current);
    }
  }, [handleSend]);

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
      <div 
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${isOpen ? 1 : 0.9})` }}
        className={`
        fixed z-50 bottom-24 right-4 sm:right-6
        w-[calc(100vw-32px)] sm:w-96
        max-h-[70vh] sm:max-h-[520px]
        bg-white rounded-2xl shadow-2xl border border-slate-200
        flex flex-col overflow-hidden
        transition-all duration-300 ease-out origin-bottom-right
        ${isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
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

        {/* ── LOGIN OVERLAY (nếu chưa đăng nhập) ───────────────────────── */}
        {!isAuthenticated && isOpen && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <LogIn size={28} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Đăng nhập để trò chuyện</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Bạn cần đăng nhập để sử dụng SavoryAI.<br />
              Chỉ mất vài giây thôi! 🚀
            </p>
            <button
              onClick={() => { setIsOpen(false); navigate('/login'); }}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors shadow-md"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50">
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* Timestamp separator */}
              {shouldShowTimestamp(msg, messages[index - 1]) && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap px-2">
                    {formatChatTimestamp(msg.timestamp)}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              {/* Message bubble */}
              <div className={`flex gap-2.5 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-200 text-primary-600'
                }`}>
                  {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[14.5px] leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        components={MarkdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
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

          {/* Error message with Retry button */}
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

          {/* Quick suggestions */}
          {showQuick && (
            <div className="space-y-2 mt-2">
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
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? 'Hỏi về ẩm thực, địa điểm...' : 'Đăng nhập để trò chuyện...'}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none min-w-0"
              disabled={isLoading || !isAuthenticated}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading || !isAuthenticated}
              className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white disabled:opacity-40 disabled:bg-slate-300 transition-all hover:bg-primary-700 flex-shrink-0"
              aria-label="Gửi"
            >
              <Send size={13} />
            </button>
          </div>
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
          NÚT FLOATING (DRAGGABLE)
          ================================================================ */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (isDragging || dragInfo.current.hasMoved) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          setIsOpen(!isOpen);
        }}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`, 
          touchAction: 'none' 
        }}
        className={`
          fixed bottom-5 right-4 sm:right-6 z-50
          w-14 h-14 rounded-full
          bg-primary-600 hover:bg-primary-700
          text-white shadow-lg
          flex items-center justify-center
          transition-colors duration-200 active:scale-95
          cursor-grab active:cursor-grabbing
        `}
        aria-label={isOpen ? 'Đóng chat AI' : 'Mở chat AI'}
      >
        <div className="transition-all duration-200 pointer-events-none">
          {isOpen ? <X size={24} /> : <Sparkles size={22} />}
        </div>
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
