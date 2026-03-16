import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

// Mock data
const INITIAL_BLOGS = [
  { id: '1', title: 'Top 10 nhà hàng phong cách Nhật tại Quận 1', date: '2026-03-10', status: 'published', views: 1250 },
  { id: '2', title: 'Khám phá ẩm thực đường phố Hà Nội', date: '2026-03-12', status: 'draft', views: 0 },
  { id: '3', title: 'Bí quyết chọn hải sản tươi ngon khi đi biển', date: '2026-03-15', status: 'published', views: 430 },
];

export default function BlogList() {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold border-l-4 border-primary-600 pl-3">Blog / Tin tức</h2>
          <p className="text-slate-500 mt-1">Quản lý nội dung các bài viết trên trang</p>
        </div>
        <button
          onClick={() => navigate('/admin/content/blog/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition"
        >
          <Plus size={18} />
          <span>Viết bài mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
          />
        </div>
        <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition cursor-pointer">
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4">Lượt xem</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium">{blog.title}</td>
                  <td className="px-6 py-4 text-slate-500">{blog.date}</td>
                  <td className="px-6 py-4 text-slate-500">{blog.views} lượt</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {blog.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* This link directs to public site, assuming we have /blog/route later */}
                      <button 
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        title="Xem bài viết"
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/content/blog/${blog.id}`)}
                        title="Chỉnh sửa"
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        title="Xóa bài viết"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>Hiển thị 1 - 3 trong tổng số 3 bài viết</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
