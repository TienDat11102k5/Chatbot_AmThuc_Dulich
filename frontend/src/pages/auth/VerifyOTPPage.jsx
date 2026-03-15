/**
 * VerifyOTPPage.jsx — Trang Xác minh Email / OTP.
 *
 * Fix flows:
 * 1. Guard: nếu không có sessionStorage context → redirect về đúng trang trước
 * 2. Luồng đăng ký: sau xác thực thành công → set localStorage('savorytrip_user')
 *    rồi dispatch 'authChange' để Navbar cập nhật ngay
 * 3. Luồng đặt lại mật khẩu: xác thực xong → /reset-password
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const OTP_LENGTH = 6;

const VerifyOTPPage = () => {
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(56);
  const inputRefs = useRef([]);
  const navigate  = useNavigate();

  const email   = sessionStorage.getItem('register_email') || sessionStorage.getItem('reset_email') || '';
  const context = sessionStorage.getItem('otp_context') || 'verify_email';

  // ── Guard: nếu vào thẳng URL không có context → redirect ──────────────────
  if (!email) {
    // Không có context preload → đẩy về forgot-password (an toàn cho cả 2 luồng)
    return <Navigate to="/forgot-password" replace />;
  }

  // Đếm ngược 56s
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Format countdown thành MM:SS
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError('');
    if (idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (otp[idx]) { next[idx] = ''; setOtp(next); }
      else if (idx > 0) { next[idx - 1] = ''; setOtp(next); inputRefs.current[idx - 1]?.focus(); }
    }
  };

  const handlePaste = (e, idx) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < OTP_LENGTH && i < pasted.length; i++) next[idx + i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(idx + pasted.length - 1, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    if (otp.join('').length < OTP_LENGTH) { setError('Vui lòng nhập đủ 6 chữ số.'); return; }
    setIsLoading(true);
    setError('');
    try {
      // TODO: POST /api/v1/auth/verify-otp
      await new Promise((r) => setTimeout(r, 800));

      if (context === 'reset_password') {
        // Luồng quên mật khẩu → sang trang đặt lại mật khẩu
        navigate('/reset-password');
      } else {
        // Luồng đăng ký: xác thực email thành công → set user vào localStorage
        const userName = sessionStorage.getItem('register_name') || email.split('@')[0];
        const mockUser = { name: userName, email, role: 'USER' };
        localStorage.setItem('savorytrip_user', JSON.stringify(mockUser));
        // Notify Navbar cập nhật ngay (không cần F5)
        window.dispatchEvent(new Event('authChange'));
        // Dọn sessionStorage
        sessionStorage.removeItem('register_email');
        sessionStorage.removeItem('register_name');
        navigate('/');
      }
    } catch {
      setError('Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(56);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
    // TODO: POST /api/v1/auth/resend-otp
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        {/* Icon + title */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Xác minh Email</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Vui lòng nhập mã bảo mật gồm 6 chữ số đã được gửi đến email của bạn
          </p>
          {email && (
            <p className="text-xs text-primary-600 font-semibold mt-1">{email}</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* 6 OTP boxes */}
        <div className="flex justify-center gap-2.5 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={(e) => handlePaste(e, idx)}
              className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                digit
                  ? 'border-primary-600 bg-primary-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'
              }`}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify} disabled={isLoading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
        >
          {isLoading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : 'Xác nhận mã'
          }
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-slate-500">
          Chưa nhận được mã?{' '}
          {countdown > 0 ? (
            <span className="text-primary-600 font-semibold">Gửi lại [{formatTime(countdown)}]</span>
          ) : (
            <button onClick={handleResend} className="text-primary-600 font-bold hover:underline">
              Gửi lại ngay
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
