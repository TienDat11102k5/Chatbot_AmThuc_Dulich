/**
 * ReviewModal.jsx — Modal đánh giá địa điểm/nhà hàng.
 *
 * Thiết kế theo Stitch "AI-Powered Review Modal":
 * - Overlay nền mờ
 * - Modal card trắng, max-w-lg
 * - Header: Ảnh/emoji địa điểm + Tên + địa chỉ
 * - Star rating 5 sao (click chọn)
 * - Textarea nhập đánh giá
 * - Nút "Phân tích với AI" → AI gợi ý cải thiện review
 * - Nút "Gửi đánh giá" màu primary
 */

import { useState, useEffect } from 'react';
import { X, Star, Sparkles, ThumbsUp, Send } from 'lucide-react';

// ─── AI gợi ý cải thiện review text ──────────────────────────────────────────
const AI_TIPS = [
  '💡 Bạn có thể đề cập đến không gian, phục vụ hoặc giá cả để review thêm sinh động!',
  '✨ Hãy chia sẻ món bạn thích nhất và tại sao để giúp người khác chọn lựa.',
  '🌟 Review của bạn đã hay! Thêm gợi ý cho khách du lịch lần đầu sẽ rất hữu ích.',
  '📸 Bạn đã chụp ảnh tại đây chưa? Gắn ảnh sẽ tăng độ tin cậy cho đánh giá!',
];

// ─── Props: { isOpen, onClose, place: { name, address, emoji, bg } }
export function ReviewModal({ isOpen, onClose, place = {} }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [review,    setReview]    = useState('');
  const [aiTip,     setAiTip]     = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setRating(0); setHovered(0); setReview('');
      setAiTip(''); setSubmitted(false);
    }
  }, [isOpen]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // AI phân tích
  const handleAnalyze = () => {
    if (!review.trim()) return;
    setAnalyzing(true);
    setAiTip('');
    setTimeout(() => {
      setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
      setAnalyzing(false);
    }, 1200);
  };

  // Gửi đánh giá
  const handleSubmit = () => {
    if (!rating || !review.trim()) return;
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  if (!isOpen) return null;

  const starLabels = ['', 'Tệ', 'Không hay', 'Bình thường', 'Tốt', 'Tuyệt vời'];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Nút X đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* === HEADER: ảnh/emoji + info địa điểm === */}
        <div className={`flex items-center gap-4 p-6 rounded-t-2xl bg-gradient-to-br ${place.bg || 'from-primary-400 to-primary-600'}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-lg">
            {place.emoji || '🍽️'}
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{place.name || 'Địa điểm'}</h2>
            <p className="text-white/80 text-sm mt-0.5">{place.address || 'Việt Nam'}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* === STAR RATING === */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Xếp hạng của bạn *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star} sao`}
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-transparent text-slate-300'
                    }`}
                  />
                </button>
              ))}
              {(hovered || rating) > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-600">
                  {starLabels[hovered || rating]}
                </span>
              )}
            </div>
          </div>

          {/* === TEXTAREA === */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Chia sẻ trải nghiệm của bạn *
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
              placeholder="Hãy chia sẻ cảm nhận về không gian, món ăn, dịch vụ..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className={`text-xs ${review.length < 20 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {review.length} / 500 ký tự {review.length >= 20 && '✓'}
              </span>
            </div>
          </div>

          {/* === AI TIP === */}
          {aiTip && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex gap-3">
              <Sparkles size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-800">{aiTip}</p>
            </div>
          )}

          {/* === ACTIONS === */}
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-bold text-slate-800 text-lg">Cảm ơn đánh giá của bạn!</p>
              <p className="text-slate-500 text-sm mt-1">Đánh giá sẽ giúp ích cho cộng đồng SavoryTrip.</p>
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Nút AI Phân tích */}
              <button
                onClick={handleAnalyze}
                disabled={!review.trim() || analyzing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-600/20 bg-primary-600/5 text-primary-600 font-semibold text-sm hover:bg-primary-600/10 disabled:opacity-50 transition-all"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                    Phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Phân tích AI
                  </>
                )}
              </button>

              {/* Nút Gửi */}
              <button
                onClick={handleSubmit}
                disabled={!rating || review.trim().length < 20}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-white transition-all shadow-md shadow-primary-600/20"
              >
                <Send size={15} />
                Gửi đánh giá
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
