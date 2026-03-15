/**
 * ServerErrorPage.jsx — Trang lỗi 500 Internal Server Error.
 *
 * Design: Serious nhưng không scary
 * - Icon/emoji lỗi server
 * - Nguyên nhân phổ biến
 * - Hướng dẫn user xử lý
 * - Countdown auto-refresh
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home, ServerCrash } from 'lucide-react';

const ServerErrorPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Đếm ngược 30s rồi tự refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-xl mx-auto">

        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ServerCrash size={44} className="text-red-500" />
        </div>

        {/* Error code */}
        <div className="inline-block bg-red-100 text-red-600 font-mono font-bold text-sm px-4 py-1.5 rounded-full mb-4">
          ERROR 500 · Internal Server Error
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
          Máy chủ gặp sự cố 🔧
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          Server của chúng tôi đang gặp vấn đề không mong muốn.<br />Đội kỹ thuật đã được thông báo và đang khắc phục.
        </p>

        {/* Countdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 max-w-xs mx-auto">
          <p className="text-sm text-slate-500 mb-1">Tự động thử lại sau</p>
          <p className="text-4xl font-black text-primary-600">{countdown}s</p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-70"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Thử lại ngay
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <Home size={18} />
            Về trang chủ
          </button>
        </div>

        {/* Help info */}
        <p className="mt-8 text-sm text-slate-400">
          Vẫn gặp sự cố?{' '}
          <a href="/contact" className="text-primary-600 hover:underline font-semibold">Liên hệ hỗ trợ</a>
        </p>
      </div>
    </div>
  );
};

export default ServerErrorPage;
