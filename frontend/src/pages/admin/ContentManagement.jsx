/**
 * ContentManagement.jsx — Trang quản lý nội dung (CMS) trong Admin.
 *
 * Thiết kế theo Stitch "Admin - CMS":
 * - Filter tabs: Tất cả / Blog / Điểm đến / Nhà hàng
 * - Bảng bài viết: Tiêu đề / Danh mục / Tác giả / Ngày đăng / Trạng thái / Thao tác
 * - Nút "Thêm bài viết" màu primary
 */

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Globe, EyeOff } from 'lucide-react';

// ─── Dữ liệu bài viết mẫu ────────────────────────────────────────────────────
const ARTICLES = [
  { id: 1, title: 'Top 10 quán phở Hà Nội không thể bỏ qua', category: 'Blog', author: 'Admin', date: '16/03/2024', status: 'published', views: 1240 },
  { id: 2, title: 'Khám phá Đà Nẵng trong 3 ngày 2 đêm',     category: 'Điểm đến', author: 'Quốc Duy', date: '15/03/2024', status: 'published', views: 985 },
  { id: 3, title: 'Nhà hàng Hải Cảng — Review chi tiết',       category: 'Nhà hàng', author: 'Quốc Duy', date: '14/03/2024', status: 'draft', views: 0 },
  { id: 4, title: 'Cẩm nang du lịch Hội An mùa hè 2024',     category: 'Điểm đến', author: 'Admin', date: '13/03/2024', status: 'published', views: 2100 },
  { id: 5, title: 'Bí kíp chọn quán ăn khi đi phượt Tây Bắc', category: 'Blog', author: 'Admin', date: '12/03/2024', status: 'draft', views: 0 },
  { id: 6, title: 'Làng chài Mũi Né — Thiên đường biển xanh', category: 'Điểm đến', author: 'Quốc Duy', date: '10/03/2024', status: 'published', views: 765 },
];

const CATEGORIES = ['Tất cả', 'Blog', 'Điểm đến', 'Nhà hàng'];

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'published'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-amber-100 text-amber-700'
  }`}>
    {status === 'published' ? <Globe size={11} /> : <EyeOff size={11} />}
    {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
  </span>
);

const ContentManagement = () => {
  const [articles, setArticles]     = useState(ARTICLES);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('Tất cả');

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'Tất cả' || a.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id) => setArticles((prev) => prev.filter((a) => a.id !== id));

  const toggleStatus = (id) =>
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'published' ? 'draft' : 'published' }
          : a,
      ),
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý trang (CMS)</h1>
          <p className="text-slate-500 text-sm mt-1">{articles.length} bài viết trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 w-fit">
          <Plus size={18} />
          Thêm bài viết mới
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              catFilter === cat
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-600 hover:text-primary-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bảng bài viết */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Tiêu đề', 'Danh mục', 'Tác giả', 'Ngày đăng', 'Lượt xem', 'Trạng thái', 'Thao tác'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">{article.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      article.category === 'Blog' ? 'bg-blue-50 text-blue-700' :
                      article.category === 'Điểm đến' ? 'bg-teal-50 text-teal-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {article.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{article.author}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{article.date}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Eye size={13} className="text-slate-400" />
                      {article.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={article.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(article.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        title="Đổi trạng thái"
                      >
                        {article.status === 'published' ? <EyeOff size={15} /> : <Globe size={15} />}
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy bài viết phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {filtered.length} / {articles.length} bài viết
          </p>
          <div className="flex gap-2">
            {[1, 2].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === 1 ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
