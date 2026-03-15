/**
 * RegisterPage.jsx — Trang Đăng ký SavoryTrip.
 *
 * Thiết kế theo Stitch: white card căn giữa, đồng bộ với các trang auth khác.
 * Form đơn giản 1 bước: Họ tên + Email + Mật khẩu.
 * Submit → chuyển sang /verify-otp.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData]               = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [agreedTerms, setAgreedTerms]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())                                    e.name            = 'Vui lòng nhập họ tên';
    if (!formData.email.includes('@'))                            e.email           = 'Email không hợp lệ';
    if (formData.password.length < 8)                             e.password        = 'Tối thiểu 8 ký tự';
    if (formData.confirmPassword !== formData.password)           e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!agreedTerms)                                             e.terms           = 'Bạn cần đồng ý với điều khoản';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      // TODO: POST /api/v1/auth/register
      await new Promise((r) => setTimeout(r, 600));
      sessionStorage.setItem('register_email', formData.email);
      sessionStorage.setItem('register_name', formData.name);
      navigate('/verify-otp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        {/* Title */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Tạo tài khoản</h1>
          <p className="text-sm text-slate-500">Bắt đầu hành trình ẩm thực cùng SavoryTrip</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="email@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password} onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${errors.confirmPassword ? 'border-red-400' : 'border-slate-300'}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
          </div>

          {/* Checkbox điều khoản */}
          <div className="space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox" checked={agreedTerms}
                onChange={(e) => { setAgreedTerms(e.target.checked); if (errors.terms) setErrors((p) => ({ ...p, terms: '' })); }}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 accent-primary-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600 leading-snug">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-primary-600 hover:underline font-medium">Điều khoản dịch vụ</Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Chính sách bảo mật</Link>
                {' '}của SavoryTrip.
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs pl-6">{errors.terms}</p>}
          </div>

          {/* Link đã có tài khoản */}
          <p className="text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">Đăng nhập</Link>
          </p>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Tiếp tục →'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
