import { useState } from 'react';
import { Save, Globe, Phone, Settings2, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'SavoryTrip',
    logoUrl: '/images/logo.png',
    description: 'Hệ thống gợi ý lịch trình ẩm thực và du lịch thông minh.',
    email: 'contact@savorytrip.com',
    phone: '0123 456 789',
    address: '123 Đường Hải Triều, Quận 1, TP.HCM',
    allowRegistration: true,
    enableAiBeta: true,
    enableBlog: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold border-l-4 border-primary-600 pl-3">Cài đặt hệ thống</h2>
          <p className="text-slate-500 mt-1">Quản lý các thông số cốt lõi của website</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>Lưu cài đặt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Site Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Globe size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin chung</h3>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tên Website</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đường dẫn Logo (URL)</label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={settings.logoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả ngắn (SEO Meta Description)</label>
                <textarea
                  name="description"
                  value={settings.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition resize-none text-slate-700 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Phone size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ (Footer)</h3>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-slate-400"/> Email hỗ trợ
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400"/> Hotline
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-slate-700 font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400"/> Địa chỉ văn phòng
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition text-slate-700"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Toggles) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Settings2 size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tính năng</h3>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-800 flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500"/> Cho phép đăng ký</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Mở cổng đăng ký tài khoản cho người dùng mới.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Cố vấn AI (Beta)</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Bật tính năng chatbot lên kế hoạch du lịch bằng AI.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" name="enableAiBeta" checked={settings.enableAiBeta} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Hiển thị Blog</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Show mục tin tức và blog trên trang chủ.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" name="enableBlog" checked={settings.enableBlog} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
