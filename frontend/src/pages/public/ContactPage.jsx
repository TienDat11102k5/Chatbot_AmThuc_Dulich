/**
 * ContactPage.jsx
 *
 * Trang Liên hệ & Hỗ trợ của SavoryTrip.
 * Bố cục:
 * 1. Hero Section: Tiêu đề + mô tả kênh liên hệ
 * 2. Contact Info: 3 thẻ thông tin (Email, Hotline, Địa chỉ)
 * 3. Contact Form: Form gửi tin nhắn (Name, Email, Subject, Message)
 * 4. FAQ section: Câu hỏi thường gặp dạng accordion
 */

import { useState } from 'react';

// ============================================================
// Dữ liệu câu hỏi thường gặp (FAQ)
// ============================================================
const FAQ_DATA = [
  {
    q: 'SavoryTrip AI hoạt động như thế nào?',
    a: 'AI của chúng tôi được huấn luyện trên dữ liệu ẩm thực và du lịch Việt Nam. Bạn chỉ cần đặt câu hỏi bằng tiếng Việt tự nhiên và AI sẽ gợi ý địa điểm, lịch trình phù hợp với sở thích của bạn.',
  },
  {
    q: 'Tôi có thể lưu lịch trình và địa điểm yêu thích không?',
    a: 'Có! Sau khi đăng ký tài khoản miễn phí, bạn có thể lưu không giới hạn địa điểm và lịch trình. Tất cả sẽ được đồng bộ trên mọi thiết bị.',
  },
  {
    q: 'Dữ liệu địa điểm được cập nhật thường xuyên không?',
    a: 'Chúng tôi cập nhật dữ liệu hằng tuần từ cộng đồng người dùng và đối tác. Mỗi địa điểm đều được xác thực trước khi công bố.',
  },
  {
    q: 'Ứng dụng có hỗ trợ tiếng Anh không?',
    a: 'Hiện tại SavoryTrip tối ưu cho tiếng Việt. Chúng tôi đang phát triển thêm phiên bản tiếng Anh và sẽ ra mắt trong Q3/2025.',
  },
];

// ============================================================
// Component FAQ Accordion Item
// Nhấn vào câu hỏi để mở/đóng phần trả lời
// ============================================================
const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    {/* Nút câu hỏi */}
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
    >
      <span>{item.q}</span>
      {/* Icon +/- */}
      <span className={`text-primary-600 text-xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>
        +
      </span>
    </button>
    {/* Phần trả lời - chỉ hiện khi mở */}
    {isOpen && (
      <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed bg-white">
        {item.a}
      </div>
    )}
  </div>
);

const ContactPage = () => {
  // State lưu index câu hỏi FAQ đang mở
  const [openFAQ, setOpenFAQ] = useState(null);

  // State dữ liệu form liên hệ
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // State hiển thị thông báo thành công sau khi gửi
  const [submitted, setSubmitted] = useState(false);

  /**
   * Cập nhật giá trị field khi người dùng nhập
   * @param {React.ChangeEvent} e - Sự kiện onChange của input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Xử lý khi nộp form.
   * TODO: Gửi dữ liệu tới API thực tế sau khi tích hợp backend.
   * Hiện tại chỉ giả lập thành công để demo UI.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập gửi thành công
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">

      {/* === 1. HERO === */}
      <section className="px-6 md:px-20 py-16 bg-gradient-to-br from-primary-600/10 via-white to-accent-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 text-primary-600 font-bold text-xs uppercase tracking-widest mb-6">
            💬 Chúng tôi luôn lắng nghe
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Liên hệ &{' '}
            <span className="text-primary-600">Hỗ trợ</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Có câu hỏi về địa điểm, tính năng hay cần hỗ trợ kỹ thuật? Đội ngũ của chúng tôi luôn
            sẵn sàng trả lời trong vòng 24 giờ.
          </p>
        </div>
      </section>

      {/* === 2. THÔNG TIN LIÊN HỆ === */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div className="p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-500 text-sm mb-3">Phản hồi trong 24 giờ</p>
              <a
                href="mailto:hello@savorytrip.vn"
                className="text-primary-600 font-semibold hover:underline"
              >
                hello@savorytrip.vn
              </a>
            </div>

            {/* Hotline */}
            <div className="p-6 rounded-2xl border border-primary-600/30 bg-primary-600/5 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-bold text-slate-900 mb-2">Hotline</h3>
              <p className="text-slate-500 text-sm mb-3">T2 - T7, 8:00 - 18:00</p>
              <a
                href="tel:19001234"
                className="text-primary-600 font-semibold hover:underline text-lg"
              >
                1900 1234
              </a>
            </div>

            {/* Địa chỉ */}
            <div className="p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-slate-900 mb-2">Văn phòng</h3>
              <p className="text-slate-500 text-sm mb-3">Chào đón theo lịch hẹn</p>
              <span className="text-slate-700 font-medium text-sm">
                123 Lê Văn Lương, Q. Cầu Giấy, Hà Nội
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* === 3. FORM LIÊN HỆ === */}
      <section className="px-6 md:px-20 py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Gửi tin nhắn cho chúng tôi</h2>
            <p className="text-slate-600">
              Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại sớm nhất có thể.
            </p>
          </div>

          {/* Thông báo gửi thành công */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Gửi thành công!</h3>
              <p className="text-green-700">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            // Form liên hệ
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6"
            >
              {/* Hàng 1: Tên + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Hàng 2: Chủ đề */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chủ đề
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition bg-white"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  <option value="general">Câu hỏi chung</option>
                  <option value="technical">Hỗ trợ kỹ thuật</option>
                  <option value="report">Báo cáo địa điểm</option>
                  <option value="partnership">Hợp tác kinh doanh</option>
                </select>
              </div>

              {/* Hàng 3: Nội dung */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Mô tả câu hỏi hoặc phản hồi của bạn..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition resize-none"
                />
              </div>

              {/* Nút submit */}
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
              >
                📤 Gửi tin nhắn
              </button>
            </form>
          )}
        </div>
      </section>

      {/* === 4. FAQ === */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-4">
            {FAQ_DATA.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
