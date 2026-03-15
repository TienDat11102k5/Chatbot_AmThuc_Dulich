/**
 * BlogPage.jsx
 *
 * Trang Blog & Travel Guide của SavoryTrip.
 * Thiết kế theo Stitch "Travel Guide & AI Blog".
 *
 * Bố cục:
 * 1. Bài nổi bật (Featured Post): Layout split trái-phải, ảnh lớn + nội dung
 * 2. Category Pills: filter theo danh mục (Tất cả, AI Tips, Review, Du lịch...)
 * 3. Grid bài viết 3 cột: ảnh banner + tag màu + tiêu đề + "Đọc thêm"
 * 4. Pagination: Xanh cho trang đang chọn
 *
 * Màu nhấn: primary-600 (#0056b3) cho tag Featured, badge, pagination active.
 * Tag màu cam/xanh/xanh lá tùy danh mục bài viết.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Clock } from 'lucide-react';

// ─── Dữ liệu bài viết mẫu ────────────────────────────────────────────────────
const CATEGORIES = ['Tất cả', 'Bí kíp dùng AI', 'Review nhà hàng', 'Kinh nghiệm du lịch', 'Món ngon địa phương'];

const POSTS = [
  {
    id: 1, slug: 'cach-dung-ai-len-lich-trinh',
    category: 'Bí kíp dùng AI', categoryColor: 'bg-primary-600',
    title: 'Cách dùng AI để lên lịch trình du lịch tự túc',
    excerpt: 'Học cách tối ưu hóa thời gian di chuyển và tìm kiếm những địa điểm ít người biết bằng trí tuệ nhân tạo SavoryTrip...',
    readTime: '5 phút',
    emoji: '🤖',
    bg: 'from-blue-100 to-indigo-100',
  },
  {
    id: 2, slug: 'review-pho-bat-da-ha-noi',
    category: 'Review nhà hàng', categoryColor: 'bg-orange-500',
    title: 'Review phở bát đá tại Hà Nội có gì đặc biệt?',
    excerpt: 'Trải nghiệm hương vị phở truyền thống trong bát đá giữ nhiệt sôi sùng sục, kết hợp giữa hiện đại và cổ điển...',
    readTime: '4 phút',
    emoji: '🍲',
    bg: 'from-red-100 to-orange-100',
  },
  {
    id: 3, slug: 'quan-cafe-rooftop-sai-gon',
    category: 'Kinh nghiệm du lịch', categoryColor: 'bg-emerald-500',
    title: 'Top 5 quán cà phê rooftop view cực chill tại quận 1',
    excerpt: 'Những địa điểm ngắm hoàng hôn đẹp nhất Sài Gòn bạn nên thử ít nhất một lần cùng bạn bè vào dịp cuối tuần...',
    readTime: '3 phút',
    emoji: '☕',
    bg: 'from-green-100 to-teal-100',
  },
  {
    id: 4, slug: 'bi-mat-cong-nghe-goi-y-mon-an',
    category: 'Bí kíp dùng AI', categoryColor: 'bg-primary-600',
    title: 'Bí mật đằng sau công nghệ gợi ý món ăn của SavoryTrip',
    excerpt: 'Khám phá thuật toán tìm kiếm hương vị phù hợp với khẩu vị cá nhân của bạn thông qua sở thích ăn uống hàng ngày...',
    readTime: '6 phút',
    emoji: '⚡',
    bg: 'from-purple-100 to-blue-100',
  },
  {
    id: 5, slug: 'am-thuc-mien-tay',
    category: 'Món ngon địa phương', categoryColor: 'bg-indigo-500',
    title: 'Hành trình khám phá ẩm thực miền Tây sông nước',
    excerpt: 'Về miền Tây gạo trắng nước trong, thưởng thức đặc sản lẩu mắm, cá linh bông điên điển mùa nước nổi...',
    readTime: '7 phút',
    emoji: '🌾',
    bg: 'from-amber-100 to-green-100',
  },
  {
    id: 6, slug: 'meo-san-ve-may-bay-ai',
    category: 'Kinh nghiệm du lịch', categoryColor: 'bg-emerald-500',
    title: 'Mẹo săn vé máy bay giá rẻ với trợ lý AI',
    excerpt: 'Tận dụng sức mạnh dữ liệu khổng lồ để tìm kiếm các ưu đãi bay tốt nhất, giúp bạn tiết kiệm đến 40% chi phí...',
    readTime: '5 phút',
    emoji: '✈️',
    bg: 'from-sky-100 to-blue-100',
  },
];

// ─── Component Card bài viết trong grid ──────────────────────────────────────
const PostCard = ({ post }) => (
  <article className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
    {/* Banner ảnh dùng gradient + emoji */}
    <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${post.bg}`}>
      <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
        {post.emoji}
      </div>
      {/* Tag danh mục */}
      <span className={`absolute top-4 left-4 ${post.categoryColor} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`}>
        {post.category}
      </span>
    </div>
    {/* Nội dung */}
    <div className="p-6">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
        <Clock size={12} />
        <span>{post.readTime} đọc</span>
      </div>
      <h3 className="text-lg font-bold mb-3 text-slate-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
        {post.excerpt}
      </p>
      <Link
        to={`/blog/${post.slug}`}
        className="inline-flex items-center gap-1 text-primary-600 font-bold text-sm uppercase tracking-wider hover:gap-2 transition-all"
      >
        Đọc thêm <ChevronRight size={16} />
      </Link>
    </div>
  </article>
);

const BlogPage = () => {
  // State danh mục đang được chọn
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  // State trang hiện tại (pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Lọc bài viết theo danh mục đã chọn
  const filteredPosts = activeCategory === 'Tất cả'
    ? POSTS
    : POSTS.filter((p) => p.category === activeCategory);

  // Bài nổi bật luôn là bài đầu tiên
  const featuredPost = POSTS[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* === 1. BÀI NỔI BẬT === */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row min-h-[400px]">
            {/* Ảnh bên trái (3/5 chiều rộng) */}
            <div className="lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <div className="relative z-10 text-center p-12">
                <div className="text-8xl mb-6">🍜</div>
                <div className="text-white/80 text-sm">Bài viết nổi bật</div>
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              {/* Badge Nổi bật */}
              <span className="absolute top-6 left-6 bg-white text-primary-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                🔥 Nổi bật
              </span>
            </div>

            {/* Nội dung bên phải (2/5 chiều rộng) */}
            <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
              {/* Thông tin tác giả */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg">👨‍🍳</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Minh Tuấn</p>
                  <p className="text-xs text-slate-500">20/10/2023 • {featuredPost.readTime} đọc</p>
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-4 text-slate-900">
                Top 10 món ẩm thực đường phố không thể bỏ lỡ tại Sài Gòn
              </h1>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Khám phá những hương vị đặc trưng nhất của thành phố Hồ Chí Minh qua góc nhìn của AI SavoryTrip. Từ bánh mì Huỳnh Hoa đến ốc đêm quận 4.
              </p>
              <Link
                to="/blog/top-10-mon-sai-gon"
                className="flex items-center gap-2 bg-primary-600 text-white w-fit px-8 py-3.5 rounded-full font-bold hover:gap-4 transition-all shadow-md hover:bg-primary-700"
              >
                Đọc tiếp <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* === 2. CATEGORY PILLS === */}
        <section className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-600 hover:text-primary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* === 3. GRID BÀI VIẾT 3 CỘT === */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        {/* === 4. PAGINATION === */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
          <span className="mx-1 text-slate-400">...</span>
          <button onClick={() => setCurrentPage(10)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-700 transition-colors">
            10
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
