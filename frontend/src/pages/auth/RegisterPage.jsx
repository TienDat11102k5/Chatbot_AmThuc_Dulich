/**
 * RegisterPage.jsx — Trang Đăng ký SavoryTrip.
 *
 * Luồng: Nhập username + email + password → POST /api/auth/register
 * → Backend trả AuthResponse (token, userId...) → login thẳng, bỏ OTP.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../lib/authService';
import useAuth from '../../hooks/useAuth';

// Password strength rules
const PASSWORD_RULES = [
  { id: 'length',  label: 'Ít nhất 8 ký tự',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Có chữ hoa (A-Z)',           test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Có chữ số (0-9)',            test: (p) => /\d/.test(p) },
];

const getStrength = (pw) => PASSWORD_RULES.filter((r) => r.test(pw)).length;

const STRENGTH_COLORS = ['bg-slate-200', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
const STRENGTH_LABELS = ['', 'Yếu', 'Trung bình', 'Mạnh'];

const RegisterPage = () => {
  const [formData, setFormData]               = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [agreedTerms, setAgreedTerms]         = useState(false);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const strength = getStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim())                                 e.username        = 'Vui lòng nhập tên đăng nhập';
    if (formData.username.length < 3)                              e.username        = 'Tối thiểu 3 ký tự';
    if (!formData.email.includes('@'))                             e.email           = 'Email không hợp lệ';
    if (formData.password.length < 8)                              e.password        = 'Tối thiểu 8 ký tự';
    if (formData.confirmPassword !== formData.password)            e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!agreedTerms)                                              e.terms           = 'Bạn cần đồng ý với điều khoản';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Register → backend trả AuthResponse (token, userId, username, email, role)
      const data = await authService.register(formData.username, formData.email, formData.password);
      // Login thẳng, bỏ OTP
      login(data);
      toast.success('Đăng ký thành công! Chào mừng bạn đến SavoryTrip 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Đăng ký thất bại.';
      toast.error(typeof msg === 'string' ? msg : 'Đăng ký thất bại.');
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
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
            <input
              type="text" name="username" value={formData.username} onChange={handleChange}
              placeholder="Nhập tên người dùng"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${errors.username ? 'border-red-400' : 'border-slate-300'}`}
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
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

            {/* Hint text */}
            {!formData.password && !errors.password && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="text-primary-600">●</span>
                Sử dụng tối thiểu 8 ký tự, bao gồm chữ cái và số.
              </p>
            )}

            {/* Strength bar */}
            {formData.password && (
              <div className="space-y-1 mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-slate-200'}`} />
                  ))}
                </div>
                {STRENGTH_LABELS[strength] && (
                  <p className={`text-xs font-medium ${strength >= 3 ? 'text-green-600' : strength === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                    Độ mạnh: {STRENGTH_LABELS[strength]}
                  </p>
                )}
              </div>
            )}

            {/* Rules list */}
            {formData.password && (
              <div className="bg-slate-50 rounded-xl px-3 py-2 mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(formData.password);
                  return (
                    <div key={rule.id} className="flex items-center gap-2 text-xs">
                      {ok ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-slate-300" />}
                      <span className={ok ? 'text-green-700' : 'text-slate-400'}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
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
              : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
