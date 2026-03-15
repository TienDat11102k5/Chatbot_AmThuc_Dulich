/**
 * SavedPlacesPage.jsx — Trang Địa điểm đã lưu.
 *
 * Thiết kế theo Stitch "User Saved Places" + "Empty Saved Places":
 * - Header: tiêu đề + bộ lọc theo danh mục (Tất cả / Nhà hàng / Cafe / Điểm đến)
 * - Grid 3 cột: thẻ địa điểm (ảnh emoji + rating + nút bỏ lưu)
 * - Empty state: illustration + CTA "Khám phá ngay"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Compass } from 'lucide-react';

// ─── Dữ liệu mẫu địa điểm đã lưu ───────────────────────────────────────────
const SAVED_PLACES = [
  {
    id: 1, name: 'Phở Thìn Bờ Hồ', type: 'Nhà hàng', city: 'Hà Nội',
    rating: 4.7, emoji: '🍲', bg: 'from-red-300 to-orange-200',
    category: 'Nhà hàng',
  },
  {
    id: 2, name: 'The Workshop Coffee', type: 'Café', city: 'Hồ Chí Minh',
    rating: 4.8, emoji: '☕', bg: 'from-amber-300 to-yellow-100',
    category: 'Café',
  },
  {
    id: 3, name: 'Cầu Vàng Đà Nẵng', type: 'Điểm tham quan', city: 'Đà Nẵng',
    rating: 4.9, emoji: '🌉', bg: 'from-sky-300 to-blue-200',
    category: 'Điểm đến',
  },
  {
    id: 4, name: 'Bánh Mì Phượng', type: 'Street Food', city: 'Hội An',
    rating: 4.9, emoji: '🥖', bg: 'from-yellow-300 to-amber-200',
    category: 'Nhà hàng',
  },
  {
    id: 5, name: 'Cà Phê Trứng Giảng', type: 'Café', city: 'Hà Nội',
    rating: 4.6, emoji: '🥚', bg: 'from-orange-200 to-yellow-100',
    category: 'Café',
  },
  {
    id: 6, name: 'Phố Cổ Hội An', type: 'Điểm tham quan', city: 'Hội An',
    rating: 4.8, emoji: '🏮', bg: 'from-yellow-400 to-orange-300',
    category: 'Điểm đến',
  },
];

const CATEGORIES = ['Tất cả', 'Nhà hàng', 'Café', 'Điểm đến'];

// ─── Card địa điểm đã lưu ────────────────────────────────────────────────────
const SavedPlaceCard = ({ place, onRemove }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
    {/* Banner */}
    <div className={`relative h-44 bg-gradient-to-br ${place.bg} flex items-center justify-center`}>
      <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{place.emoji}</span>
      {/* Nút bỏ lưu */}
      <button
        onClick={() => onRemove(place.id)}
        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 text-slate-600 transition-all"
        aria-label="Bỏ lưu"
      >
        <Heart size={16} className="fill-current text-red-400" />
      </button>
      {/* Rating badge */}
      <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold shadow-sm">
        <Star size={13} className="fill-yellow-400 text-yellow-400" />
        {place.rating}
      </span>
    </div>
    {/* Nội dung */}
    <div className="p-5">
      <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{place.name}</h3>
      <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
        <MapPin size={13} />
        <span>{place.type} • {place.city}</span>
      </div>
      <Link
        to={`/place/${place.id}`}
        className="w-full flex items-center justify-center py-2.5 border border-primary-600/20 bg-primary-600/5 hover:bg-primary-600 text-primary-600 hover:text-white rounded-xl text-sm font-bold transition-all"
      >
        Xem chi tiết
      </Link>
    </div>
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-8xl mb-6">🔖</div>
    <h3 className="text-2xl font-bold text-slate-700 mb-3">Chưa có địa điểm nào được lưu</h3>
    <p className="text-slate-500 mb-8 max-w-sm">
      Khám phá và lưu những địa điểm ăn uống, du lịch yêu thích để tạo danh sách cá nhân của riêng bạn.
    </p>
    <Link
      to="/explore"
      className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-700 transition-all shadow-md hover:gap-3"
    >
      <Compass size={18} />
      Khám phá ngay
    </Link>
  </div>
);

const SavedPlacesPage = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [savedPlaces, setSavedPlaces] = useState(SAVED_PLACES);

  // Lọc theo danh mục đang chọn
  const filtered = activeCategory === 'Tất cả'
    ? savedPlaces
    : savedPlaces.filter((p) => p.category === activeCategory);

  // Xoá khỏi danh sách lưu
  const handleRemove = (id) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Địa điểm đã lưu</h1>
            <p className="text-slate-500 mt-1">{savedPlaces.length} địa điểm trong danh sách của bạn</p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-600 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid hoặc Empty State */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((place) => (
              <SavedPlaceCard key={place.id} place={place} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default SavedPlacesPage;
