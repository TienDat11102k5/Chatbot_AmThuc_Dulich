/**
 * PrivacyPage.jsx — Trang Chính sách Quyền riêng tư SavoryTrip.
 *
 * Tương tự TermsPage nhưng focus vào bảo mật data:
 * - Highlight key data points (What we collect, Why, How we use)
 * - User rights cards
 * - Contact DPO information
 */

import { useEffect } from 'react';
import { Lock, Eye, Database, Share2, UserCheck, Trash2, Mail } from 'lucide-react';

const DATA_COLLECTED = [
  { icon: UserCheck, label: 'Thông tin tài khoản', desc: 'Tên, email, ảnh đại diện khi đăng ký' },
  { icon: Eye,       label: 'Dữ liệu sử dụng',    desc: 'Lịch sử tìm kiếm, địa điểm yêu thích, lịch trình đã tạo' },
  { icon: Database,  label: 'Dữ liệu thiết bị',   desc: 'Loại thiết bị, hệ điều hành, địa chỉ IP ẩn danh' },
  { icon: Share2,    label: 'Dữ liệu AI',          desc: 'Nội dung hội thoại với SavoryAI để cải thiện mô hình' },
];

const USER_RIGHTS = [
  { icon: Eye,      title: 'Quyền truy cập',   desc: 'Bạn có quyền yêu cầu bản sao dữ liệu cá nhân của mình bất kỳ lúc nào.' },
  { icon: UserCheck,title: 'Quyền chỉnh sửa',  desc: 'Bạn có thể cập nhật thông tin không chính xác qua trang Cài đặt.' },
  { icon: Trash2,   title: 'Quyền xoá dữ liệu',desc: 'Yêu cầu xoá toàn bộ dữ liệu cá nhân trong vòng 30 ngày.' },
  { icon: Share2,   title: 'Quyền di chuyển',  desc: 'Xuất dữ liệu cá nhân sang định dạng có thể đọc được (JSON/CSV).' },
];

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <Lock size={40} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3">Chính sách Quyền riêng tư</h1>
          <p className="text-slate-400">Cập nhật lần cuối: 01 tháng 3, 2024</p>
          <p className="mt-4 text-slate-300 leading-relaxed max-w-xl mx-auto">
            SavoryTrip cam kết bảo vệ quyền riêng tư của bạn. Tài liệu này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* Dữ liệu chúng tôi thu thập */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dữ liệu chúng tôi thu thập</h2>
          <p className="text-slate-500 mb-6">Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp và cải thiện Dịch vụ.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DATA_COLLECTED.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cách chúng tôi sử dụng */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Cách chúng tôi sử dụng dữ liệu</h2>
          <div className="space-y-4">
            {[
              { title: 'Cá nhân hoá trải nghiệm', desc: 'Sử dụng sở thích của bạn để gợi ý nhà hàng và lộ trình phù hợp hơn.' },
              { title: 'Cải thiện AI SavoryAI', desc: 'Phân tích (ẩn danh) các cuộc hội thoại để huấn luyện mô hình AI chính xác hơn.' },
              { title: 'Thông báo và giao tiếp', desc: 'Gửi email về cập nhật tài khoản, ưu đãi và nội dung phù hợp sở thích (có thể huỷ đăng ký).' },
              { title: 'Bảo mật hệ thống', desc: 'Phát hiện và ngăn chặn gian lận, bảo vệ tài khoản người dùng.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">{item.title}: </span>
                  <span className="text-slate-600 text-sm">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quyền người dùng */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quyền của bạn</h2>
          <p className="text-slate-500 mb-6">Theo Luật An toàn thông tin mạng Việt Nam, bạn có các quyền sau:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USER_RIGHTS.map((right) => {
              const Icon = right.icon;
              return (
                <div key={right.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">{right.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{right.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cookies */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">🍪 Chính sách Cookie</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Chúng tôi sử dụng cookie để duy trì phiên đăng nhập, ghi nhớ tuỳ chọn và phân tích lượng truy cập. Bạn có thể tắt cookie không cần thiết trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng của Dịch vụ.
          </p>
        </section>

        {/* Contact DPO */}
        <section className="bg-primary-600 rounded-2xl p-8 text-white text-center">
          <Mail size={32} className="mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Liên hệ về Quyền riêng tư</h3>
          <p className="text-primary-200 mb-4 text-sm">Để thực hiện bất kỳ quyền nào ở trên hoặc nếu có câu hỏi về chính sách này.</p>
          <a
            href="mailto:privacy@savorytrip.vn"
            className="inline-block bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition-colors"
          >
            privacy@savorytrip.vn
          </a>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
