/**
 * TermsPage.jsx — Trang Điều khoản sử dụng SavoryTrip.
 *
 * Design: Clean typography-focused layout với
 * - Table of contents sticky sidebar
 * - Từng section accordion hoặc scroll target
 * - Last updated date + CTA bottom
 */

import { useState, useEffect } from 'react';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Chấp nhận điều khoản',
    content: `Bằng cách truy cập và sử dụng website SavoryTrip ("Dịch vụ"), bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này và Chính sách Quyền riêng tư của chúng tôi.

Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép truy cập Dịch vụ. Chúng tôi có quyền sửa đổi hoặc thay thế các Điều khoản này bất kỳ lúc nào.`,
  },
  {
    id: 'service',
    title: '2. Mô tả dịch vụ',
    content: `SavoryTrip là nền tảng tư vấn ẩm thực và du lịch trực tuyến sử dụng trí tuệ nhân tạo (AI) để cung cấp:

• Gợi ý lộ trình du lịch cá nhân hóa
• Đề xuất nhà hàng và món ăn phù hợp sở thích
• Lập kế hoạch chuyến đi tự động
• Đánh giá và chia sẻ trải nghiệm ẩm thực

Chúng tôi không đảm bảo tính chính xác tuyệt đối của các thông tin do AI cung cấp.`,
  },
  {
    id: 'account',
    title: '3. Tài khoản người dùng',
    content: `Khi tạo tài khoản, bạn phải cung cấp thông tin chính xác và đầy đủ. Bạn chịu trách nhiệm:

• Bảo mật mật khẩu tài khoản của mình
• Tất cả hoạt động xảy ra dưới tài khoản của bạn
• Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép

Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản vi phạm điều khoản này.`,
  },
  {
    id: 'content',
    title: '4. Nội dung người dùng',
    content: `Bằng cách đăng tải nội dung lên SavoryTrip, bạn cấp cho chúng tôi quyền phi độc quyền để sử dụng, hiển thị và phân phối nội dung đó nhằm cải thiện Dịch vụ.

Bạn không được đăng tải:
• Nội dung vi phạm bản quyền
• Thông tin sai lệch hoặc gây hiểu nhầm
• Nội dung quảng cáo không được phép
• Nội dung gây hại hoặc xúc phạm người khác`,
  },
  {
    id: 'limitation',
    title: '5. Giới hạn trách nhiệm',
    content: `SavoryTrip không chịu trách nhiệm về:

• Tổn thất trực tiếp hoặc gián tiếp từ việc sử dụng Dịch vụ
• Sự gián đoạn hoặc không khả dụng của Dịch vụ
• Tính chính xác của thông tin do bên thứ ba cung cấp
• Thiệt hại do việc dựa vào gợi ý AI mà không kiểm chứng

Giới hạn trách nhiệm tối đa của chúng tôi là số tiền bạn đã thanh toán cho Dịch vụ (nếu có).`,
  },
  {
    id: 'governing',
    title: '6. Luật điều chỉnh',
    content: `Các Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh liên quan đến các điều khoản này sẽ được giải quyết tại Tòa án có thẩm quyền tại Thành phố Hồ Chí Minh, Việt Nam.`,
  },
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <Shield size={40} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3">Điều khoản Dịch vụ</h1>
          <p className="text-primary-200">Cập nhật lần cuối: 01 tháng 3, 2024</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar TOC */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Mục lục</h3>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    activeSection === s.id
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ChevronRight size={12} className={activeSection === s.id ? 'text-primary-600' : 'text-slate-300'} />
                  <span className="line-clamp-2">{s.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3 space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}

          {/* CTA */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
            <CheckCircle size={32} className="text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg mb-2">Câu hỏi về Điều khoản?</h3>
            <p className="text-slate-500 text-sm mb-4">Liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào.</p>
            <a href="/contact" className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
              Liên hệ hỗ trợ
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsPage;
