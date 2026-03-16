import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'food',
    status: 'draft',
    summary: '',
    content: ''
  });

  // Mock fetch data if editing
  useEffect(() => {
    if (id && id !== 'new') {
      // Simulate API call
      setFormData({
        title: 'Top 10 nhà hàng phong cách Nhật tại Quận 1',
        slug: 'top-10-nha-hang-nhat-quan-1',
        category: 'food',
        status: 'published',
        summary: 'Những địa điểm thưởng thức sushi, sashimi và ẩm thực Nhật Bản chuẩn vị nhất ngay giữa lòng Sài Gòn.',
        content: 'Nội dung chi tiết bài viết ở đây...'
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      navigate('/admin/content/blog');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/content/blog')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {id === 'new' ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Đang chỉnh sửa: Bản nháp</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/content/blog')}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Lưu bài viết</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề bài viết</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Đường dẫn (Slug)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="vi-du-duong-dan"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tóm tắt (Summary)</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={3}
                placeholder="Đoạn mô tả ngắn về bài viết..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung bài viết</label>
              {/* Fake WYSIWYG Toolbar */}
              <div className="border border-slate-200 border-b-0 rounded-t-xl bg-slate-50 p-2 flex gap-2">
                <button className="px-3 py-1 font-bold text-slate-700 hover:bg-slate-200 rounded">B</button>
                <button className="px-3 py-1 italic text-slate-700 hover:bg-slate-200 rounded">I</button>
                <button className="px-3 py-1 underline text-slate-700 hover:bg-slate-200 rounded">U</button>
                <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
                <button className="p-1 px-2 text-slate-700 hover:bg-slate-200 rounded"><ImageIcon size={18}/></button>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                placeholder="Bắt đầu viết nội dung ở đây..."
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-b-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status Panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 border-l-4 border-primary-600 pl-2">Trạng thái hiện tại</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-primary-100 bg-primary-50/30 rounded-xl hover:bg-primary-50 transition relative overflow-hidden">
                <input 
                  type="radio" 
                  name="status" 
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-sm text-slate-800">Xuất bản ngay</div>
                  <div className="text-xs text-slate-500">Hiển thị công khai trên website</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                <input 
                  type="radio" 
                  name="status" 
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleChange}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-sm text-slate-800">Lưu bản nháp</div>
                  <div className="text-xs text-slate-500">Chỉ admin có thể xem được</div>
                </div>
              </label>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
            <h3 className="font-semibold text-slate-800 mb-4 border-l-4 border-primary-600 pl-2">Phân loại & Ảnh</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition cursor-pointer"
              >
                <option value="food">Ẩm thực</option>
                <option value="travel">Du lịch</option>
                <option value="tips">Mẹo vặt</option>
                <option value="news">Tin tức</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ảnh bìa (Cover Image)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition cursor-pointer hover:text-primary-600 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary-50 transition-all">
                  <ImageIcon className="text-slate-400 group-hover:text-primary-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">Nhấn để tải ảnh lên</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP tối đa 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
