/**
 * EditProfileModal.jsx — Modal chỉnh sửa thông tin hồ sơ người dùng.
 *
 * Tính năng:
 * - Cập nhật Họ tên đầy đủ (fullName)
 * - Cập nhật Tên đăng nhập (username)
 * - Cập nhật Email
 * - Upload ảnh đại diện (Avatar) từ máy tính với preview
 */
import { useState, useRef } from 'react';
import { X, Camera, User, AtSign, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../lib/userService';

const EditProfileModal = ({ user, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý khi người dùng chọn ảnh từ máy tính
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png, webp...).');
      return;
    }
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
      return;
    }
    setAvatarFile(file);
    // Tạo preview URL từ file local
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let updatedUser = user;

      // Bước 1: Upload avatar mới nếu có chọn ảnh
      if (avatarFile) {
        updatedUser = await userService.uploadAvatar(user.id, avatarFile);
        toast.success('Ảnh đại diện đã được cập nhật!');
      }

      // Bước 2: Cập nhật thông tin profile
      const profileChanged =
        form.fullName !== (user.fullName || '') ||
        form.username !== user.username ||
        form.email !== user.email ||
        form.phoneNumber !== (user.phoneNumber || '');

      if (profileChanged) {
        updatedUser = await userService.updateProfile(user.id, form);
        toast.success('Thông tin hồ sơ đã được cập nhật!');
      }

      if (avatarFile || profileChanged) {
        // Cập nhật localStorage để Navbar v.v. nhận thông tin mới
        localStorage.setItem('savorytrip_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('authChange'));
      }

      if (!avatarFile && !profileChanged) {
        toast('Không có thay đổi nào để lưu.', { icon: 'ℹ️' });
      }

      onUpdated(updatedUser); // Cập nhật state ở ProfilePage
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Chỉnh sửa hồ sơ</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* === AVATAR UPLOAD === */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-100 shadow-md bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl">👤</span>
                )}
              </div>
              {/* Nút chọn ảnh */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition"
              >
                <Camera size={14} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarFile && (
              <p className="text-xs text-slate-500">{avatarFile.name}</p>
            )}
            <p className="text-xs text-slate-400">
              Nhấn vào biểu tượng <Camera size={12} className="inline" /> để chọn ảnh (tối đa 5MB)
            </p>
          </div>

          {/* === FORM FIELDS === */}
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Tên đăng nhập"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Số điện thoại
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">+84</span>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="9xx xxx xxx"
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* === BUTTONS === */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
