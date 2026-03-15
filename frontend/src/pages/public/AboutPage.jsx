/**
 * AboutPage.jsx
 *
 * Trang "Về chúng tôi" (About Us) của SavoryTrip.
 * Thiết kế theo Stitch với bố cục:
 * 1. Hero Section: Tiêu đề + mô tả sứ mệnh
 * 2. Stats Section: Các con số ấn tượng (thành tích)
 * 3. Mission & Vision: Card ngang giải thích sứ mệnh
 * 4. Team Section: Grid thành viên
 * 5. CTA Section: Nút hành động cuối trang
 */

import { Link } from 'react-router-dom';

// =============================================================
// Dữ liệu thống kê nổi bật của SavoryTrip
// =============================================================
const STATS = [
  { value: '1,240+', label: 'Địa điểm ăn uống' },
  { value: '50,000+', label: 'Người dùng hài lòng' },
  { value: '63', label: 'Tỉnh thành phủ sóng' },
  { value: '4.9 ⭐', label: 'Đánh giá trung bình' },
];

// =============================================================
// Dữ liệu đội ngũ thành viên
// =============================================================
const TEAM_MEMBERS = [
  { name: 'Nguyễn Minh Trí', role: 'CEO & Co-founder', emoji: '👨‍💼' },
  { name: 'Lê Thị Hoa', role: 'CTO & AI Lead', emoji: '👩‍💻' },
  { name: 'Trần Văn Dũng', role: 'Head of Design', emoji: '🎨' },
  { name: 'Phạm Thu Hằng', role: 'Head of Content', emoji: '✍️' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen">

      {/* === 1. HERO SECTION === */}
      <section className="relative px-6 md:px-20 py-20 md:py-32 bg-gradient-to-br from-primary-600/10 via-white to-accent-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 text-primary-600 font-bold text-xs uppercase tracking-widest mb-6">
            🌟 Câu chuyện của chúng tôi
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Chúng tôi kết nối bạn với{' '}
            <span className="text-primary-600">trái tim ẩm thực</span> Việt Nam
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            SavoryTrip được tạo ra bởi những người đam mê ẩm thực và du lịch, với mong muốn
            giúp mọi người khám phá tinh hoa ẩm thực Việt Nam qua sức mạnh của AI.
          </p>
        </div>
      </section>

      {/* === 2. STATS SECTION === */}
      <section className="px-6 md:px-20 py-16 bg-primary-600">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.value}</div>
              <div className="text-primary-200 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === 3. MISSION & VISION === */}
      <section className="px-6 md:px-20 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            Sứ mệnh & Tầm nhìn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sứ mệnh */}
            <div className="p-8 rounded-2xl bg-primary-600/5 border border-primary-600/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-primary-600 mb-4">Sứ mệnh</h3>
              <p className="text-slate-600 leading-relaxed">
                Ứng dụng trí tuệ nhân tạo để giúp mọi du khách — từ người Việt đến quốc tế —
                trải nghiệm ẩm thực địa phương đích thực và lên kế hoạch chuyến đi một cách thông minh,
                tiết kiệm và đáng nhớ nhất.
              </p>
            </div>
            {/* Tầm nhìn */}
            <div className="p-8 rounded-2xl bg-accent-500/10 border border-accent-500/30">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Tầm nhìn</h3>
              <p className="text-slate-600 leading-relaxed">
                Trở thành nền tảng AI du lịch & ẩm thực hàng đầu Đông Nam Á vào năm 2027,
                với hệ sinh thái dữ liệu ẩm thực phong phú nhất từ 11 quốc gia trong khu vực.
              </p>
            </div>
          </div>

          {/* Các giá trị cốt lõi */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Chân thực', desc: 'Mỗi địa điểm đều được xác thực bởi cộng đồng thực tế' },
              { icon: '🧠', title: 'Thông minh', desc: 'AI học hỏi từng sở thích để cá nhân hóa gợi ý' },
              { icon: '💚', title: 'Có trách nhiệm', desc: 'Hỗ trợ các nhà hàng địa phương và du lịch bền vững' },
            ].map((v, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center group hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h4 className="font-bold text-lg mb-2">{v.title}</h4>
                <p className="text-slate-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 4. TEAM SECTION === */}
      <section className="px-6 md:px-20 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Đội ngũ sáng lập</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Được dẫn dắt bởi những người có đam mê mãnh liệt với ẩm thực, công nghệ và trải nghiệm du lịch.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                {/* Avatar dạng emoji */}
                <div className="w-20 h-20 rounded-full bg-primary-600/10 text-4xl flex items-center justify-center mx-auto mb-4">
                  {member.emoji}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{member.name}</h4>
                <p className="text-sm text-primary-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 5. CTA SECTION === */}
      <section className="px-6 md:px-20 py-20 bg-primary-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng khám phá Việt Nam theo cách của bạn?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Hàng nghìn người dùng đã tin tưởng SavoryTrip. Hãy bắt đầu hành trình ẩm thực của bạn ngay hôm nay.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/ai-planner"
              className="px-8 py-4 bg-accent-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-accent-600 transition-colors shadow-xl"
            >
              ✨ Tạo lịch trình miễn phí
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              🔍 Khám phá địa điểm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
