/**
 * SettingsPage.jsx — Trang Cài đặt tài khoản SavoryTrip.
 *
 * Sidebar chỉ còn 2 mục: Thông tin cá nhân | Đổi mật khẩu
 * (Đã loại bỏ: Thông báo, Xoá tài khoản)
 */

import { useState, useEffect, useRef } from 'react';
import { User, Lock, Camera, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../lib/userService';
import ChangePasswordSection from '../../components/profile/ChangePasswordSection';
import { STORAGE_KEY } from '../../lib/api';

// ─── Sidebar items (bỏ Thông báo) ────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
];

// ─── Helper: đọc userId từ localStorage (fallback khi API chưa load xong) ───
const getUserIdFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId || parsed?.id || null;
  } catch {
    return null;
  }
};

// ─── Form thông tin cá nhân ───────────────────────────────────────────────────
// Helper: merge profile fields vào localStorage mà KHÔNG ghi đè token/auth fields
const syncProfileToLocalStorage = (updatedUser) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    // Chỉ merge các field profile, giữ nguyên token, userId, role
    const merged = {
      ...stored,
      fullName: updatedUser.fullName || stored.fullName || '',
      avatarUrl: updatedUser.avatarUrl || null,
      username: updatedUser.username || stored.username,
      email: updatedUser.email || stored.email,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('authChange'));
  } catch (err) {
    console.error('[syncProfileToLocalStorage] Lỗi:', err);
  }
};

const PersonalInfoForm = ({ user, onAvatarUpdated }) => {
  // Dùng fullName || username làm giá trị ban đầu để tránh form trống
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(null); // URL thật để hoàn tác khi Hủy
  const fileInputRef = useRef(null);

  // Sync form khi user prop thay đổi
  useEffect(() => {
    if (user) {
      setForm({
        // Ưu tiên fullName, fallback về username để form không bao giờ trống
        fullName: user.fullName || user.username || '',
        email: user.email || '',
      });
      // Cập nhật preview avatar từ URL thật (không dùng blob)
      const fullUrl = user.avatarUrl 
        ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`)
        : null;
      setAvatarPreview(fullUrl);
      setSavedAvatarUrl(fullUrl);
    }
  }, [user]);

  const handleChange = (e) => {
    if (!isEditing && e.target.name !== 'email') return; // Should not happen but for safety
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  // Upload avatar
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png, webp...).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
      return;
    }
    try {
      setIsUploading(true);
      // Preview tạm bằng blob URL để UX nhanh
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      
      const updatedUser = await userService.uploadAvatar(user.id, file);
      
      // Lấy URL thật từ server response để lưu vào localStorage
      const realAvatarUrl = updatedUser.avatarUrl
        ? (updatedUser.avatarUrl.startsWith('http') ? updatedUser.avatarUrl : `http://localhost:8080${updatedUser.avatarUrl}`)
        : null;
      
      // Cập nhật preview sang URL thật (giải phóng blob URL)
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview(realAvatarUrl);
      setSavedAvatarUrl(realAvatarUrl); // Lưu URL thật, không phải blob
      
      // Merge đúng cách vào localStorage: chỉ cập nhật profile fields, giữ token
      syncProfileToLocalStorage(updatedUser);
      
      toast.success('Ảnh đại diện đã được cập nhật!');
      if (onAvatarUpdated) onAvatarUpdated(updatedUser);
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error(error?.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
      // Hoàn lại preview về URL thật cũ
      setAvatarPreview(savedAvatarUrl);
    } finally {
      setIsUploading(false);
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xóa avatar
  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    try {
      setIsUploading(true);
      const updatedUser = await userService.removeAvatar(user.id);
      
      // Merge đúng cách vào localStorage: chỉ cập nhật avatarUrl = null
      syncProfileToLocalStorage(updatedUser);
      
      setAvatarPreview(null);
      setSavedAvatarUrl(null);
      toast.success('Đã gỡ bỏ ảnh đại diện.');
      if (onAvatarUpdated) onAvatarUpdated(updatedUser);
    } catch (error) {
      console.error('Remove avatar error:', error);
      toast.error('Không thể gỡ bỏ ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // Lưu thông tin profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(user.id, form);
      
      // Merge đúng cách: chỉ update profile fields, giữ nguyên token
      syncProfileToLocalStorage(updatedUser);
      
      setSaved(true);
      setIsEditing(false);
      toast.success('Đã lưu thay đổi!');
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
        <p className="text-slate-500 text-sm mt-1">
          Cập nhật thông tin hồ sơ của bạn để cá nhân hoá trải nghiệm SavoryTrip.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-500 border-2 border-slate-200 shadow-sm flex items-center justify-center text-4xl overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>👤</span>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <Loader2 size={20} className="text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <Camera size={12} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Ảnh đại diện</h4>
            <p className="text-xs text-slate-500 mt-0.5">JPG, GIF hoặc PNG. Tối đa 5MB.</p>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="text-xs font-bold text-primary-600 px-3 py-1.5 rounded-lg bg-primary-600/10 hover:bg-primary-600/20 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Đang tải...' : 'Thay đổi'}
              </button>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading || !avatarPreview}
                className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30"
              >
                Gỡ bỏ
              </button>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Họ và Tên</label>
            <input
              name="fullName"
              className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-all ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : 'bg-transparent'}`}
              placeholder="Nhập họ tên của bạn"
              value={form.fullName}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Địa chỉ Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 cursor-not-allowed outline-none transition-all"
              placeholder="email@example.com"
              value={form.email}
              readOnly
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-8 py-2.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
            >
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Khi huỷ, reset form về giá trị gốc (dùng fullName || username làm fallback)
                  if (user) setForm({ fullName: user.fullName || user.username || '', email: user.email || '' });
                }}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                disabled={isLoading}
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
                } disabled:opacity-60`}
              >
                {isLoading && <Loader2 size={15} className="animate-spin" />}
                {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Tip bảo mật */}
      <div className="mx-6 md:mx-8 mb-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-4">
        <Info size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Bảo mật tài khoản</p>
          <p className="mt-0.5">Chúng tôi khuyên bạn nên cập nhật mật khẩu ít nhất 6 tháng một lần để đảm bảo an toàn cho dữ liệu.</p>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN SETTINGS PAGE ───────────────────────────────────────────────────────
const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Load user: ưu tiên API, fallback localStorage
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const data = await userService.getCurrentUser();
        setCurrentUser(data);
        // QUAN TRỌNG: Ghi ngược vào localStorage để Navbar/Header đồng bộ ngay
        // Làm điều này mỗi lần load Settings page để đảm bảo localStorage
        // luôn có dữ liệu mới nhất từ backend (bao gồm sau khi login lại)
        syncProfileToLocalStorage(data);
      } catch (err) {
        console.warn('API /users/me lỗi, đọc từ localStorage:', err?.response?.status);
        // Fallback: đọc từ localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            // Tạo object tương thích với UserProfileResponse
            setCurrentUser({
              id: parsed.userId || parsed.id,
              username: parsed.username,
              email: parsed.email,
              fullName: parsed.fullName || '',
              avatarUrl: parsed.avatarUrl || null,
              createdAt: parsed.createdAt || null,
            });
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Callback khi avatar được cập nhật từ PersonalInfoForm
  // Merge đầy đủ tất cả fields của updatedUser (không chỉ avatarUrl)
  const handleAvatarUpdated = (updatedUser) => {
    setCurrentUser((prev) => ({
      ...prev,
      avatarUrl: updatedUser.avatarUrl,
      fullName: updatedUser.fullName || prev?.fullName || '',
      username: updatedUser.username || prev?.username,
      email: updatedUser.email || prev?.email,
    }));
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'Người dùng';
  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
    : '';
  const avatarSrc = currentUser?.avatarUrl
    ? (currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `http://localhost:8080${currentUser.avatarUrl}`)
    : null;

  // userId từ currentUser hoặc fallback localStorage
  const userId = currentUser?.id || getUserIdFromStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto pb-12">

        {/* Cover + Avatar */}
        <div className="relative mb-24">
          <div className="w-full h-48 md:h-64 overflow-hidden rounded-b-2xl bg-gradient-to-br from-primary-600 to-indigo-700">
            <div className="w-full h-full flex items-center justify-center text-white/10 text-8xl">⚙️</div>
          </div>
          <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-primary-100 overflow-hidden shadow-lg flex items-center justify-center text-5xl">
                {isLoadingUser ? (
                  <div className="w-full h-full bg-slate-200 animate-pulse" />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <button className="absolute bottom-1 right-1 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div className="mb-2">
              {isLoadingUser ? (
                <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mb-2" />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{displayName}</h1>
              )}
              {joinDate && <p className="text-slate-500 font-medium">Tham gia từ {joinDate}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar + Form */}
        <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 sticky top-20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-3">Cài đặt</h3>
              <nav className="flex flex-col gap-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
                        isActive ? 'bg-primary-600/10 text-primary-600' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Form chính */}
          <section className="lg:col-span-9">
            {activeSection === 'profile' && (
              <PersonalInfoForm user={currentUser} onAvatarUpdated={handleAvatarUpdated} />
            )}

            {activeSection === 'password' && (
              userId ? (
                <ChangePasswordSection userId={userId} />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 size={32} className="animate-spin text-primary-600 mb-4" />
                  <p className="text-slate-500 text-sm">Đang tải thông tin...</p>
                </div>
              )
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
