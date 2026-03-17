/**
 * ForgotPasswordPage.jsx — Trang Quên mật khẩu.
 *
 * Thiết kế theo Stitch "Forgot Password Recovery - SavoryTrip":
 * - White card căn giữa, max-w-sm
 * - Icon xoay (RotateCcw) trong circle xanh
 * - Tiêu đề "Quên mật khẩu?"
 * - Subtitle hướng dẫn nhập email
 * - Email field có icon mail
 * - Nút "Gửi liên kết khôi phục" màu primary xanh
 * - Link "← Quay lại đăng nhập"
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../lib/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Email không hợp lệ.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      sessionStorage.setItem('reset_email', email);
      sessionStorage.setItem('otp_context', 'reset_password');
      toast.success('Đã gửi mã OTP đến email của bạn!');
      navigate('/verify-otp');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(typeof msg === 'string' ? msg : 'Đã xảy ra lỗi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        {/* Icon + title */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={28} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Quên mật khẩu?</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Đừng lo lắng, hãy nhập email bạn đã<br />đăng ký để chúng tôi gửi mã khôi phục
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                placeholder="Nhập email của bạn"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
            </div>
          </div>

          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Gửi liên kết khôi phục'
            }
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:underline font-medium">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
