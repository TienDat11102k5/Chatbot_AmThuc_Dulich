/**
 * ChangePasswordSection.jsx — Phần đổi mật khẩu trong trang Cài đặt / Hồ sơ.
 *
 * Tính năng:
 * - Form 3 trường: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới
 * - Tái sử dụng logic kiểm tra độ mạnh mật khẩu (8 ký tự, chữ hoa, số)
 * - Gọi API PUT /api/v1/users/{id}/password
 * - Xử lý các lỗi từ backend (sai mật khẩu cũ, v.v.)
 */
import { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../lib/userService';

// --- Helper: Kiểm tra các tiêu chí mật khẩu ---
const getPasswordRules = (password) => [
  { label: 'Ít nhất 8 ký tự', pass: password.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', pass: /[A-Z]/.test(password) },
  { label: 'Có chữ số (0-9)', pass: /[0-9]/.test(password) },
];

// Helper tạo input mật khẩu có nút hiện/ẩn
const PasswordField = ({ label, name, value, isVisible, onChange, onToggle }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={isVisible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const ChangePasswordSection = ({ userId }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const rules = getPasswordRules(form.newPassword);
  const allRulesPassed = rules.every((r) => r.pass);
  const passwordsMatch =
    form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;

  // Màu strength bar
  const passedCount = rules.filter((r) => r.pass).length;
  const strengthColor =
    passedCount === 3 ? 'bg-green-500' :
    passedCount === 2 ? 'bg-yellow-400' :
    passedCount === 1 ? 'bg-orange-500' : 'bg-slate-200';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) {
      toast.error('Mật khẩu mới chưa đạt yêu cầu bảo mật.');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    setIsLoading(true);
    try {
      await userService.changePassword(userId, form);
      toast.success('Đổi mật khẩu thành công!');
      // Reset form
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-10">
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mật khẩu hiện tại */}
        <PasswordField 
          label="Mật khẩu hiện tại" 
          name="currentPassword" 
          value={form.currentPassword}
          isVisible={show.current}
          onChange={handleChange}
          onToggle={() => toggleShow('current')}
        />

        {/* Mật khẩu mới */}
        <PasswordField 
          label="Mật khẩu mới" 
          name="newPassword" 
          value={form.newPassword}
          isVisible={show.new}
          onChange={handleChange}
          onToggle={() => toggleShow('new')}
        />

        {/* Strength bar & Rules */}
        {form.newPassword && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {rules.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < passedCount ? strengthColor : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <div className="space-y-1">
              {rules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2 text-xs">
                  {rule.pass ? (
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle size={13} className="text-slate-300 flex-shrink-0" />
                  )}
                  <span className={rule.pass ? 'text-green-600' : 'text-slate-500'}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Xác nhận mật khẩu mới */}
        <PasswordField 
          label="Xác nhận mật khẩu mới" 
          name="confirmPassword" 
          value={form.confirmPassword}
          isVisible={show.confirm}
          onChange={handleChange}
          onToggle={() => toggleShow('confirm')}
        />

        {/* Hiển thị trạng thái khớp mật khẩu */}
        {form.confirmPassword && (
          <p className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
            {passwordsMatch
              ? <><CheckCircle size={13} /> Mật khẩu khớp</>
              : <><XCircle size={13} /> Mật khẩu không khớp</>
            }
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !allRulesPassed || !passwordsMatch || !form.currentPassword}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default ChangePasswordSection;
