/**
 * ExplorePage.jsx
 *
 * Trang Khám phá Địa điểm & Ẩm thực - SavoryTrip.
 * Thiết kế theo Stitch "Explore Destinations & Food".
 *
 * Bố cục:
 * 1. Hero Search Bar: tìm kiếm toàn trang
 * 2. Filter Strip: chip Thành phố, Loại hình ẩm thực, Đánh giá + nút "Xem bản đồ"
 * 3. Grid Cards (4 cột): mỗi card có ảnh, rating badge, like button, tên & địa điểm
 * 4. Nút "Xem thêm" dạng outlined
 *
 * Màu nhấn: `primary-600` xanh biển cho filters, buttons.
 * Rating badge dùng `accent-500` (vàng) theo Stitch.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Heart, MapPin, Map, ChevronDown, SlidersHorizontal } from 'lucide-react';

// ─── Dữ liệu địa điểm & ẩm thực mẫu ─────────────────────────────────────────
const PLACES = [
  { id: 1, name: 'Bún Chả Cá Bà Phiến', type: 'Local food, Cafe', city: 'Đà Nẵng', rating: 4.8, liked: false, emoji: '🍜', bg: 'from-orange-200 to-amber-100' },
  { id: 2, name: 'Phở Thìn Bờ Hồ', type: 'Vietnamese Phở, Traditional', city: 'Hà Nội', rating: 4.5, liked: false, emoji: '🍲', bg: 'from-red-100 to-rose-200' },
  { id: 3, name: 'Bánh Mì Phượng Hội An', type: 'Street Food, World Famous', city: 'Hội An', rating: 4.9, liked: true, emoji: '🥖', bg: 'from-yellow-100 to-amber-200' },
  { id: 4, name: 'Cà Phê Trứng Giảng', type: 'Drinks, Iconic Cafe', city: 'Hà Nội', rating: 4.7, liked: false, emoji: '☕', bg: 'from-amber-100 to-orange-100' },
  { id: 5, name: 'Hải sản Năm Đảnh', type: 'Seafood, Local Gem', city: 'Đà Nẵng', rating: 4.6, liked: false, emoji: '🦐', bg: 'from-blue-100 to-cyan-100' },
  { id: 6, name: 'Chè Liên Đà Nẵng', type: 'Dessert, Snacks', city: 'Đà Nẵng', rating: 4.3, liked: false, emoji: '🍮', bg: 'from-purple-100 to-pink-100' },
  { id: 7, name: 'Nhà Cổ Tấn Ký', type: 'Heritage, Museum', city: 'Hội An', rating: 4.9, liked: true, emoji: '🏮', bg: 'from-green-100 to-teal-100' },
  { id: 8, name: 'Bún Chả Đắc Kim', type: 'Vietnamese BBQ, Lunch', city: 'Hà Nội', rating: 4.4, liked: false, emoji: '🥩', bg: 'from-red-100 to-orange-100' },
];

// ─── Tùy chọn bộ lọc ─────────────────────────────────────────────────────────
const CITIES = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hội An', 'Huế'];
const FOOD_TYPES = ['Tất cả', 'Street Food', 'Hải sản', 'Cafe', 'Fine Dining', 'Chay'];
const RATINGS = ['Tất cả', '4.9+', '4.5+', '4.0+'];

// ─── Component Card địa điểm ─────────────────────────────────────────────────
const PlaceCard = ({ place, onToggleLike }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative flex flex-col">
    <Link to={`/place/${place.id}`} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${place.name}`}></Link>
    
    {/* Ảnh (dùng gradient + emoji làm placeholder) */}
    <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${place.bg}`}>
      <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {place.emoji}
      </div>
      {/* Nút like (heart) */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleLike(place.id); }}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${
          place.liked
            ? 'bg-red-500 text-white'
            : 'bg-white/90 text-slate-400 hover:text-red-500'
        }`}
        aria-label="Yêu thích"
      >
        <Heart size={18} fill={place.liked ? 'currentColor' : 'none'} />
      </button>
      {/* Rating badge góc dưới trái */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 z-10 pointer-events-none">
        <Star size={12} className="text-accent-500" fill="currentColor" />
        <span className="text-xs font-bold">{place.rating}</span>
      </div>
    </div>

    {/* Nội dung card */}
    <div className="p-4 relative z-10 pointer-events-none">
      <h3 className="text-base font-bold mb-1 group-hover:text-primary-600 transition-colors leading-tight">
        {place.name}
      </h3>
      <p className="text-xs text-slate-500 mb-2">{place.type}</p>
      <div className="flex items-center gap-1 text-slate-400">
        <MapPin size={12} />
        <span className="text-xs">{place.city}</span>
      </div>
    </div>
  </div>
);

// ─── Component Dropdown Filter ────────────────────────────────────────────────
const FilterDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-primary-600 transition-all text-sm font-medium text-slate-700"
      >
        {label}{value !== 'Tất cả' && <span className="text-primary-600">: {value}</span>}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${opt === value ? 'text-primary-600 font-bold' : 'text-slate-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ExplorePage = () => {
  // State tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  // State bộ lọc
  const [selectedCity, setSelectedCity] = useState('Tất cả');
  const [selectedFoodType, setSelectedFoodType] = useState('Tất cả');
  const [selectedRating, setSelectedRating] = useState('Tất cả');
  // State danh sách yêu thích
  const [places, setPlaces] = useState(PLACES);
  // Số lượng hiển thị (pagination đơn giản)
  const [showCount, setShowCount] = useState(8);

  /**
   * Toggle trạng thái yêu thích của một địa điểm.
   * @param {number} id - ID của địa điểm
   */
  const toggleLike = (id) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

  /**
   * Lọc danh sách địa điểm theo các bộ lọc đã chọn.
   * Trả về mảng đã được lọc và giới hạn số lượng hiển thị.
   */
  const filteredPlaces = places
    .filter((p) => {
      // Lọc theo từ khóa tìm kiếm (tên hoặc thành phố)
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Lọc theo thành phố
      if (selectedCity !== 'Tất cả' && p.city !== selectedCity) return false;
      // Lọc theo đánh giá
      if (selectedRating === '4.9+' && p.rating < 4.9) return false;
      if (selectedRating === '4.5+' && p.rating < 4.5) return false;
      if (selectedRating === '4.0+' && p.rating < 4.0) return false;
      return true;
    })
    .slice(0, showCount);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* === 1. HERO SEARCH BAR === */}
        <section className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
            Khám phá hương vị thế giới
          </h1>
          <p className="text-slate-500 mb-6">Tìm kiếm hàng ngàn địa điểm ẩm thực hấp dẫn trên khắp Việt Nam</p>
          {/* Search input nổi bật */}
          <div className="relative flex items-center shadow-xl shadow-primary-600/5 rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <Search size={20} className="absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành phố, món ăn, nhà hàng..."
              className="w-full py-4 pl-12 pr-32 border-none bg-transparent focus:outline-none text-lg placeholder:text-slate-400"
            />
            <button className="absolute right-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors">
              Tìm kiếm
            </button>
          </div>
        </section>

        {/* === 2. FILTER STRIP === */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <SlidersHorizontal size={18} className="text-slate-500" />
            <FilterDropdown
              label="Thành phố" options={CITIES}
              value={selectedCity} onChange={setSelectedCity}
            />
            <FilterDropdown
              label="Loại hình ẩm thực" options={FOOD_TYPES}
              value={selectedFoodType} onChange={setSelectedFoodType}
            />
            <FilterDropdown
              label="Đánh giá" options={RATINGS}
              value={selectedRating} onChange={setSelectedRating}
            />
            {/* Nút reset bộ lọc */}
            {(selectedCity !== 'Tất cả' || selectedFoodType !== 'Tất cả' || selectedRating !== 'Tất cả') && (
              <button
                onClick={() => { setSelectedCity('Tất cả'); setSelectedFoodType('Tất cả'); setSelectedRating('Tất cả'); }}
                className="text-sm text-slate-500 hover:text-primary-600 transition-colors font-medium"
              >
                × Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Nút xem bản đồ */}
          <Link
            to="/ai-planner"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold text-sm shrink-0"
          >
            <Map size={18} />
            Xem bản đồ
          </Link>
        </section>

        {/* === 3. GRID CARDS === */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onToggleLike={toggleLike} />
            ))}
          </div>
        ) : (
          // Thông báo khi không có kết quả
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-slate-500">Hãy thử từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        )}

        {/* === 4. NÚT XEM THÊM === */}
        {showCount < places.length && filteredPlaces.length === showCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowCount(showCount + 8)}
              className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-600 hover:text-white transition-all"
            >
              Xem thêm địa điểm
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
