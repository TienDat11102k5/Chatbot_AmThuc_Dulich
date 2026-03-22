/**
 * LoginPage.jsx — Trang Đăng nhập SavoryTrip.
 *
 * Thiết kế theo Stitch "Modern Login - SavoryTrip UI":
 * - White card căn giữa, shadow nhẹ, rounded-2xl
 * - Tiêu đề "Đăng nhập vào SavoryTrip"
 * - Username field (backend dùng username, không phải email)
 * - Password field + eye toggle + "Quên mật khẩu?" link
 * - Nút "Đăng nhập" màu primary (#2563eb)
 * - "Chưa có tài khoản? Đăng ký ngay"
 * - Divider "Hoặc"
 * - Google button
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import authService from '../../lib/authService';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const navigate   = useNavigate();
  const location   = useLocation();
  const { login }  = useAuth();

  // Hiển thị toast khi được redirect từ ResetPasswordPage hoặc nơi khác
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, { id: 'login-toast' });
      // Dùng navigate để update react-router state thay vì window.history
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Tích hợp Google Login qua Hook để giữ nguyên UI custom
  const handleGoogleLogin = useGoogleLogin({
    prompt: 'consent', // Ép Google hiển thị bảng Consent Screen mỗi lần đăng nhập
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Với useGoogleLogin (implicit flow), ta nhận được access_token. Đẩy xuống Backend xử lý.
        const data = await authService.googleLogin(tokenResponse.access_token);
        login(data);
        toast.success('Đăng nhập Google thành công!');
        const redirectTo = data.role === 'ADMIN' ? '/admin' : '/';
        navigate(redirectTo);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data || 'Đăng nhập Google thất bại.';
        setError(typeof msg === 'string' ? msg : 'Lỗi không xác định.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Lỗi kết nối hoặc uỷ quyền từ Google Popup.');
    }
  });

  // Gọi API đăng nhập thực
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Backend giờ đã trả đủ: token, userId, username, email, role, fullName, avatarUrl
      const data = await authService.login(formData.email, formData.password);
      login(data);

      toast.success('Đăng nhập thành công!');
      // Admin → redirect /admin dashboard, User → redirect trang chủ
      const redirectTo = data.role === 'ADMIN' ? '/admin' : '/';
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Tên đăng nhập hoặc mật khẩu không đúng.';
      setError(typeof msg === 'string' ? msg : 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      {/* White card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        {/* Tiêu đề */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Đăng nhập vào SavoryTrip
          </h1>
          <p className="text-sm text-slate-500">
            Chào mừng bạn trở lại với hành trình ẩm thực
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} required
              placeholder="Nhập địa chỉ email"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 outline-none transition-all"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Ghi nhớ + Quên mật khẩu */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-primary-600 cursor-pointer"
                />
                <span className="text-sm text-slate-600">Ghi nhớ</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Link đăng ký */}
        <p className="text-center text-sm text-slate-500 mt-5">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-xs font-medium">Hoặc</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* OAuth button - Google */}
        <button 
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Tiếp tục với Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
