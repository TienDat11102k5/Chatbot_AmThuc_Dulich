/**
 * NotFoundPage.jsx — Trang lỗi 404 Not Found.
 *
 * Design: Animated illustration, fun message, CTA về trang chủ
 * Animation: Fork và spoon quay tròn gợi ý về ẩm thực
 */

import { useNavigate } from 'react-router-dom';
import { Home, Search, Compass } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">

        {/* Animated illustration */}
        <div className="relative mb-10">
          {/* 404 number lớn */}
          <div className="text-[130px] sm:text-[160px] font-black text-primary-600/10 select-none leading-none">
            404
          </div>

          {/* Emoji giữa màn hình */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Đĩa ăn */}
              <div className="w-32 h-32 rounded-full bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center text-6xl animate-bounce">
                🍽️
              </div>
              {/* Fork bên trái */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-3xl" style={{ animation: 'spin 3s linear infinite' }}>
                🍴
              </div>
              {/* Spoon bên phải */}
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-3xl" style={{ animation: 'spin 3s linear infinite reverse' }}>
                🥄
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
          Ôi không! Trang bị thất lạc rồi 😅
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          Trang bạn tìm kiếm không tồn tại, có thể đã bị xoá<br className="hidden sm:block" /> hoặc địa chỉ URL bị nhập sai.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
          >
            <Home size={18} />
            Về trang chủ
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
          >
            <Compass size={18} />
            Khám phá
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
          >
            ← Quay lại
          </button>
        </div>

        {/* Search suggestion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto">
          <p className="text-slate-500 text-sm mb-2">Hoặc tìm địa điểm bạn muốn:</p>
          <div
            className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => navigate('/explore')}
          >
            <Search size={16} className="text-slate-400" />
            <span className="text-slate-400 text-sm">Tìm nhà hàng, địa điểm...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
