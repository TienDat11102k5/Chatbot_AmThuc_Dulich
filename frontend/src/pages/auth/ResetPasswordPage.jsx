/**
 * ResetPasswordPage.jsx — Trang Tạo mật khẩu mới.
 *
 * Thiết kế theo Stitch "Reset New Password - SavoryTrip Recovery":
 * - White card căn giữa, max-w-sm
 * - Tiêu đề "Tạo mật khẩu mới" (không có icon vòng tròn trên cùng)
 * - Subtitle "Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây."
 * - Input "Mật khẩu mới" với eye toggle
 * - Hint text "Sử dụng tối thiểu 8 ký tự, bao gồm chữ cái và số"
 * - Input "Xác nhận mật khẩu mới" với eye toggle
 * - Nút "Cập nhật mật khẩu" primary xanh
 * - Link "← Quay lại trang đăng nhập"
 */
import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../lib/authService';

// Password strength rules
const PASSWORD_RULES = [
  { id: 'length',  label: 'Ít nhất 8 ký tự',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Có chữ hoa (A-Z)',           test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Có chữ số (0-9)',            test: (p) => /\d/.test(p) },
];

const getStrength = (pw) => PASSWORD_RULES.filter((r) => r.test(pw)).length;

const STRENGTH_COLORS = ['bg-slate-200', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
const STRENGTH_LABELS = ['', 'Yếu', 'Trung bình', 'Mạnh'];

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showPw, setShowPw]                     = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [error, setError]                       = useState('');
  const navigate = useNavigate();

  // Guard: nếu không có luồng đặt lại mật khẩu hợp lệ → redirect
  if (!sessionStorage.getItem('reset_email')) {
    return <Navigate to="/forgot-password" replace />;
  }

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8)          { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; }
    if (newPassword !== confirmPassword)  { setError('Mật khẩu xác nhận không khớp.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const email = sessionStorage.getItem('reset_email');
      const otp = sessionStorage.getItem('reset_otp') || '';
      await authService.resetPassword(email, otp, newPassword);
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('otp_context');
      sessionStorage.removeItem('reset_otp');
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công! Hãy đăng nhập lại.' } });
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
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Tạo mật khẩu mới</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                required placeholder="Nhập mật khẩu mới"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Hint text */}
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="text-primary-600">●</span>
              Sử dụng tối thiểu 8 ký tự, bao gồm chữ cái và số.
            </p>

            {/* Strength bar */}
            {newPassword && (
              <div className="space-y-1">
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
            {newPassword && (
              <div className="bg-slate-50 rounded-xl px-3 py-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(newPassword);
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

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required placeholder="Xác nhận lại mật khẩu"
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-white ${
                  confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-xs">Mật khẩu xác nhận không khớp</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Cập nhật mật khẩu'
            }
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:underline font-medium">
            ← Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
