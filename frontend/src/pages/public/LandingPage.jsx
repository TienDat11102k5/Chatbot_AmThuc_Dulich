/**
 * LandingPage.jsx
 *
 * Trang chủ (Landing Page) của SavoryTrip.
 * Gồm các sections: Hero, Benefits, Explore Destinations, AI Chat Demo, Blog, Footer.
 * Thiết kế theo đúng 100% file HTML gốc trên Stitch-loop với bảng màu Blue + Yellow.
 *
 * Cấu trúc chính:
 * 1. HeroSection       - Banner giới thiệu chính với CTA (Call-to-Action)
 * 2. BenefitsSection   - 3 tính năng nổi bật của AI Travel Assistant
 * 3. DestinationsSection - Grid điểm đến nổi bật kết hợp bản đồ
 * 4. FoodCategorySection - Các loại hình ẩm thực (Street Food, Nhà hàng, Cafe, Chợ đêm)
 * 5. AIChatDemoSection   - Demo giao diện chat tối màu với ví dụ hội thoại
 * 6. BlogSection         - Các bài viết/blog nổi bật
 */

import { Link } from 'react-router-dom';

// =============================================================
// Section 1: Hero Banner
// Gradient nền xanh-trắng-vàng, CTA gồm "Tạo lịch trình" + "Khám phá"
// =============================================================
const HeroSection = () => (
  <section className="relative w-full px-6 md:px-20 py-16 md:py-28 overflow-hidden">
    {/* Nền gradient chuyển màu theo thiết kế Stitch */}
    <div className="absolute inset-0 z-0">
      <div className="w-full h-full bg-gradient-to-br from-primary-600/10 via-white to-accent-500/10" />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
      {/* Badge "AI thế hệ mới" */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/20 text-primary-600 font-bold text-xs uppercase tracking-widest mb-4">
        <span className="text-sm">✨</span>
        Trí tuệ nhân tạo thế hệ mới
      </div>

      {/* Tiêu đề chính H1 */}
      <h1 className="text-4xl md:text-6xl font-black leading-tight text-slate-900">
        Khám phá ẩm thực &{' '}
        <span className="text-primary-600">du lịch thông minh</span> cùng AI
      </h1>

      {/* Mô tả ngắn */}
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-medium">
        Lên kế hoạch chuyến đi hoàn hảo và tìm kiếm những món ăn địa phương đặc sắc nhất
        với trợ lý trí tuệ nhân tạo chuyên sâu về Việt Nam.
      </p>

      {/* Nhóm nút CTA */}
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {/* Nút chính - màu xanh biển */}
        <button
          onClick={() => window.dispatchEvent(new Event('openAIChatWidget'))}
          className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-600/30 hover:scale-105 hover:bg-primary-700 transition-all"
        >
          ✨ Hỏi SavoryAI ngay
        </button>

        {/* Nút phụ - viền xám */}
        <Link
          to="/explore"
          className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
        >
          🔍 Khám phá địa điểm
        </Link>
      </div>
    </div>
  </section>
);

// =============================================================
// Section 2: Tính năng nổi bật (AI Benefits)
// 3 khung: Ẩm thực / Lịch trình / Viên ngọc ẩn
// Hover effect: đổi màu nền icon, nâng khung lên
// =============================================================
const BenefitsSection = () => {
  // Danh sách 3 tính năng nổi bật lấy từ Stitch
  const benefits = [
    {
      icon: '🍜',
      title: 'Khám phá ẩm thực',
      desc: 'AI tìm kiếm những món ăn đặc sản đúng vị địa phương, từ quán vỉa hè đến nhà hàng cao cấp.',
      accentColor: 'border-b-primary-600/40',
      iconBg: 'bg-primary-600/10 text-primary-600 group-hover:bg-primary-600 group-hover:text-white',
    },
    {
      icon: '📅',
      title: 'Lịch trình thông minh',
      desc: 'Tự động tối ưu hóa lộ trình di chuyển, thời gian tham quan và gợi ý phương tiện phù hợp nhất.',
      accentColor: 'border-b-accent-500/40',
      iconBg: 'bg-accent-500/10 text-slate-900 group-hover:bg-accent-500 group-hover:text-white',
    },
    {
      icon: '💎',
      title: 'Viên ngọc ẩn',
      desc: 'Gợi ý những địa điểm ít người biết, những góc sống ảo triệu view được lọc bởi cộng đồng du lịch.',
      accentColor: 'border-b-green-400/40',
      iconBg: 'bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white',
    },
  ];

  return (
    <section className="px-6 md:px-20 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trợ lý du lịch AI ưu việt
            </h2>
            <p className="text-slate-600 text-lg">
              Công nghệ thông minh giúp trải nghiệm của bạn trở nên trọn vẹn và cá nhân hóa hơn bao giờ hết.
            </p>
          </div>
        </div>

        {/* Grid 3 cột tính năng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className={`group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl transition-all border-b-4 ${b.accentColor}`}
            >
              {/* Icon với hiệu ứng hover đổi màu */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors text-3xl ${b.iconBg}`}
              >
                {b.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{b.title}</h3>
              <p className="text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =============================================================
// Section 3: Điểm đến nổi bật
// Grid 2x2 thẻ địa điểm + cột bản đồ (Stitch: 8/12 + 4/12)
// =============================================================
const DestinationsSection = () => {
  // Dữ liệu mẫu các điểm đến - lấy theo nội dung từ Stitch
  const destinations = [
    {
      city: 'Hà Nội',
      desc: '15 món đặc sản nên thử • 240+ địa điểm',
      badge: 'PHỔ BIẾN',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD64rZETKlJ0Vg31qdzL-GtPFG1HkiWcSsRVAHGSXsuUoxgDuUU12nEOQI6-ICLvYvPPQdjSv8WvZ-DPsFWg4sHskhqn6BF1coEeEHJCtkl7OfxO1xpvGV0OaV4JZc0QFgGKlj7XtFj4p34_ZzBa-0ZGUhmwWqsoNU9w0mjJ1T-sFyMdijiSPC2k-w0Oc8NIeLY7BcKWHFM_WvNoqre70CMhqvxd_7t5-xlwni45NNVpQrw8mLjwAn3Ic3jeOqgcmJMdi21BbXxNKw',
    },
    {
      city: 'TP. Hồ Chí Minh',
      desc: '20 món đặc sản nên thử • 310+ địa điểm',
      badge: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz_hI3rFjlvaa3gja8Glm0iP4t--patH2yemdDEzbk8NFM81lEOa44yLDolkqsZ6t54RPrtRv5q-DrF7rOUiPjjE8DeaJGX-64cM9ciM3dL2N1Eytm9nDjyNb_Y1IwdgRpcDGP4p1mii8INTCvkCLF3ORYzw1l0l-1wu9xcpHPIWABDllk1EnUi106yCZWM6usjKYm9Jbwlqsrhuzu1b6N1M2uOa3wRn7zHibSN4Qrls2XezpRp6uWnCLZpScgMMpHFxeK9ebXjs8',
    },
    {
      city: 'Đà Nẵng',
      desc: '12 món đặc sản nên thử • 180+ địa điểm',
      badge: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARXTO1seGRV2AUlzbYcR8K95V_kMPBg_eFBkJ8f01R8IejrWb_GxzsirAPo4qR6OIwUpVlKEIxN8yevfwmw4YYj2_pB6c43DR9lkL5samxrZX_AQdRD1bep2LtIl0rYi-zDbuEhpBUR0XRczIyDT60WWelGhlBiA57BOdFMRttoB-VoSWi4RajNaA6vd7B0emRp7vdVMiiCmWOgj51z3EFxTweHC-OfbYPfVC74teEa2gEa2cnO0SmMCJ5-hc0MbPHPaSsWUB05ac',
    },
    {
      city: 'Huế',
      desc: '18 món đặc sản nên thử • 150+ địa điểm',
      badge: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi5QgEBrxlxRH86jF4FmKXLsdZ5ZkjxOncuSMGnvRTav5gBRCeHY5xlPaDmpuTDU9q8Zm7iguIGVBsZDpWE4ik8w9wYae-uoXdTjAL62n8F17Ff0hE3WE0sP1mQ63AM9ZJTXkW11d0ddS5O-OnE8sZqpOH-u-zBcTfqMXrrlElysZGgrywTKMyzYUSNwi-ybvSpaYTChXd9JxiX08UaWlcC3JA-HT44-X8rgwmWJ5JXaueZpTckggK5QqZXZssvLsrkE8ash_6uvE',
    },
  ];

  return (
    <section className="px-6 md:px-20 py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header section với link "Xem tất cả" */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Điểm đến nổi bật</h2>
          <Link
            to="/explore"
            className="text-primary-600 font-bold flex items-center gap-1 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Layout grid: 8/12 cards + 4/12 bản đồ (theo Stitch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Nhóm 4 thẻ địa điểm (2x2 grid) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {destinations.map((dest, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
              >
                {/* Ảnh đại diện thành phố */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={dest.img}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge "PHỔ BIẾN" chỉ hiện khi có */}
                  {dest.badge && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-xs font-bold text-primary-600">
                      {dest.badge}
                    </div>
                  )}
                </div>
                {/* Thông tin địa điểm */}
                <div className="p-5">
                  <h4 className="text-xl font-bold mb-1">{dest.city}</h4>
                  <p className="text-slate-500 text-sm mb-4">{dest.desc}</p>
                  <Link
                    to={`/explore?city=${encodeURIComponent(dest.city)}`}
                    className="block w-full py-2 bg-slate-100 hover:bg-primary-600 hover:text-white text-center rounded-lg font-bold transition-colors"
                  >
                    Khám phá ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bản đồ ẩm thực AI (placeholder hiển thị ảnh map) */}
          <div className="lg:col-span-4 bg-slate-200 rounded-3xl overflow-hidden relative min-h-[400px] border-4 border-white shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOocnQqDwcj-yt7I31m3A08japf3fbmZAmvgEkMiqjYbLq14nQo5VSlFBRoM_497T6tV6pasrCG8YliFUcOEDbPmU2Kqk5bR8krRWX40raBqU-69Tfhl70BEUCZmag66OqLABphmVymKmJF1_VidNgovUv-Qvg7akJyZbKAFkYnNtmrEoWzG48LES_3rk6vn182PmEzX1UtXrv7vDsCTqFGO0wTA-LUTgymGoBlCX25T1hjS-n4zr3qHmy7TwfNsaevWpP7wQ96Bk')`,
              }}
            />
            {/* Card thông tin bản đồ nổi bên dưới */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <h5 className="font-bold text-lg mb-2">Bản đồ ẩm thực AI</h5>
              <p className="text-slate-600 text-sm mb-4">
                Đang hiển thị 1,240 địa điểm ăn uống xác thực trên khắp Việt Nam.
              </p>
              {/* Nút mở bản đồ - màu vàng theo Stitch */}
              <Link
                to="/explore"
                className="w-full py-3 bg-accent-500 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-accent-600 transition-colors"
              >
                🗺️ Mở bản đồ tương tác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// =============================================================
// Section 4: Loại hình ẩm thực (Food Experience Categories)
// 4 danh mục: Street Food, Nhà hàng, Cafe, Chợ đêm
// Mỗi item: ảnh tròn + tên + rating sao vàng
// =============================================================
const FoodCategorySection = () => {
  const categories = [
    {
      name: 'Street Food',
      rating: '4.8 (2.4k)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4jG6oSFIT3gLz-8XE9hSqVIeiPQ1HOcuQ_YIzeALy4MBgpvaPynvapjlazxyFroUahZTSBYjBsXGHjtzUN1Qng1kFN_toZ6HsRYMm5LWu_gBjCWWAfNaWmRS91B0Qvl9HkAtkqDBzjVPVk_nad-F5FwKquVAU5RMIxm8KaE_fS3mK9ZPOR63wuddjq8DfILj1nuPrAv48KdrQIGk6AWUnqy5mhljxYgbXawe3n73yhSLGaUHrLMKHyRRd9wZmmN8qaxsV6T043KY',
    },
    {
      name: 'Nhà hàng nội địa',
      rating: '4.9 (1.8k)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYki_0Y2T3NpBxlPSh_Ab0wYt9pCJz2VUOtQYf-oXkWh7hvmM__8uAabDrGaQMg6tccXakW_7DMJq6vcnRQGqx-mUhCT6kQZveabcncFI_l_cZi5rgBmpbyBmKupeYVimK-QoFcAzTRtXHZJx8g9f3pkLmAK6A1P1s4BAT4JsM-YKgNCw-glr26s7JHzBCE0je42wgxGuzonKUot1s9CuQwhcpoNoGOJYHu5JXPr4DMOyf7f5NJbhBzXj-18EqyxVC_QM3TU15tE',
    },
    {
      name: 'Cafe & Chill',
      rating: '4.7 (3.1k)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYTbzXzA8IqtINSt3cVuh19Z85Epdf1PpwZzAo4PCtiOjDcVZy75QqK3xvMMW7AgaguiO7Zs2hAkzDK2HJDJPfroyTbj1EnTVLp2-56vGOxqOxyNJUgbuRN7m3dT_aiI33-_apV-aR2jPkrkw5eZ3HRBIwXyJXPdQsqT7zqR6H8uYmpCndNz-LHB6zDrm1Iy_mxGQB4aOYmVAAftqDUMyTqdKFBa2Ivc1aNeFgVrY0ZYPf5BFIA-dsMwIl87mhy5Xq0dMt7Au_7UM',
    },
    {
      name: 'Chợ đêm',
      rating: '4.6 (1.5k)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTvCa0Z8fODJl3_ek3Ib8t3IQ-kWCyeQ_UiU8IrRRQEtXc3y9UBdU55r_fqKgCkmNbwVNAeohLU7gvRZq3VFWrSmMuBn9APUnilMCuE3FERQyX0cVeAnbdNVS4CYMSZauHRgrZzBuZyGrMiKRCDDhZ0XnzzjgLUv5g4AY-RwUrJ32uohZKLsA6w-N_MtAZ9MRWQ0a2gvucMwAIkPTIR2PuNGqSngCkrpay6jZez0ukaZ6h8ESUPw-GhMqfzp1pYzgM47_A25arBqE',
    },
  ];

  return (
    <section className="px-6 md:px-20 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề + mô tả căn giữa */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trải nghiệm theo cách của bạn
          </h2>
          <p className="text-slate-600">
            Dù bạn là tín đồ trà sữa hay người sành ăn món vỉa hè, SavoryTrip đều có những gợi ý riêng biệt.
          </p>
        </div>

        {/* Grid 4 danh mục, 2 cột trên mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to="/explore"
              className="flex flex-col items-center p-6 rounded-2xl bg-slate-50 hover:bg-primary-600/5 transition-colors border border-transparent hover:border-primary-600/20 cursor-pointer"
            >
              {/* Ảnh dạng tròn */}
              <div className="w-20 h-20 mb-4 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-slate-900 text-center">{cat.name}</span>
              {/* Rating - ngôi sao vàng */}
              <div className="flex items-center gap-1 text-accent-500 mt-1">
                <span className="text-sm">⭐</span>
                <span className="text-xs text-slate-500 font-semibold">{cat.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// =============================================================
// Section 5: Demo Chat AI
// Nền tối (slate-900), minh họa cuộc trò chuyện giữa User và AI
// Bên phải: widget chat có header blue, message bubbles, input
// =============================================================
const AIChatDemoSection = () => {
  // Các ví dụ câu hỏi tiêu biểu người dùng hay hỏi AI
  const exampleQueries = [
    '"Ăn gì ở Sài Gòn dưới 50k?"',
    '"Lịch trình Đà Nẵng 3 ngày 2 đêm cho gia đình"',
    '"Tìm quán cafe vintage có view hồ ở Hà Nội"',
  ];

  // Mẫu cuộc hội thoại giữa người dùng và AI (hiển thị trong widget)
  const chatMessages = [
    {
      role: 'user',
      text: 'Ăn gì ở Sài Gòn tầm này bạn ơi?',
    },
    {
      role: 'ai',
      text: (
        <>
          Chào bạn! Buổi tối ở Sài Gòn bạn không nên bỏ lỡ:<br />
          1. <b>Bánh tráng nướng</b> (Cao Thắng)<br />
          2. <b>Ốc các loại</b> (Quận 4)<br />
          3. <b>Hủ tiếu Nam Vang</b> (Quận 10)<br />
          Bạn muốn tìm ở quận nào cụ thể không?
        </>
      ),
    },
    {
      role: 'user',
      text: 'Lịch trình Đà Nẵng 2 ngày đi đâu?',
    },
    {
      role: 'ai',
      text: 'Đà Nẵng 2 ngày: Ngày 1 Bà Nà Hills, Ngày 2 dạo Bán đảo Sơn Trà & xem Cầu Rồng phun lửa...',
    },
  ];

  return (
    <section className="px-6 md:px-20 py-20 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

        {/* Cột trái: Mô tả tính năng chat */}
        <div className="lg:w-1/2 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Hỏi AI bất cứ điều gì cho chuyến đi của bạn
          </h2>
          <p className="text-slate-400 text-lg">
            Trò chuyện trực tiếp với trợ lý SavoryAI để nhận được những tư vấn ngay lập tức,
            từ lịch trình chi tiết đến món ăn phù hợp với túi tiền.
          </p>
          {/* Danh sách ví dụ câu hỏi */}
          <ul className="space-y-4">
            {exampleQueries.map((q, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-primary-400">✓</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          {/* Nút thử ngay */}
          <button
            onClick={() => window.dispatchEvent(new Event('openAIChatWidget'))}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors"
          >
            🤖 Thử SavoryAI ngay
          </button>
        </div>

        {/* Cột phải: Widget chat demo */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-6 max-w-md mx-auto">
            {/* Header widget chat */}
            <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span>🤖</span>
              </div>
              <div>
                <p className="font-bold text-sm">SavoryAI Assistant</p>
                <p className="text-xs text-green-400">● Đang trực tuyến</p>
              </div>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <div className="space-y-4 h-80 overflow-y-auto pr-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-slate-700 text-white rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input gửi tin nhắn */}
            <div className="mt-6 flex gap-2">
              <div className="flex-1 bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 flex justify-between items-center">
                Nhập câu hỏi của bạn...
                <span>🎤</span>
              </div>
              <Link
                to="/ai-planner"
                className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                ➤
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// =============================================================
// Section 6: Blog / Câu chuyện cảm hứng
// 3 bài viết dạng card ngang, hover scale ảnh nhẹ
// =============================================================
const BlogSection = () => {
  const posts = [
    {
      tag: 'Ẩm thực • 5 phút đọc',
      title: 'Top 10 món ngon không thể bỏ qua khi đến Đà Lạt mùa mưa',
      excerpt:
        'Đà Lạt mùa mưa có gì hấp dẫn? Cùng AI khám phá list những quán lẩu bò, lẩu gà lá é nóng hổi cho ngày lạnh...',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg25yjj6ybaR1z4Ruj-hpWhljgc5OuLsa21HtnbkeWuW_ZH0ML8TKMSl8mjTTEW8OP5UBCEa2dFTLV7ZJp9VTrh4KFNAzxXjZ4XoqXDYUV3EoNjqH2pzu_1uqMG7WWbK_gGNmIW3JKfH9VG5NeGRIUfObMxXelPU0eqMC6P5IMDnnfYytQKhaj62ZqimDH7m5xni110op-Gt42H2NNe4DTXwgDnLJCmX0vnSMpge-WuOuDvg7i_9gM3Nc_BVtkenT5UMzbULJ0CZk',
    },
    {
      tag: 'Kinh nghiệm • 8 phút đọc',
      title: 'Bí kíp săn vé rẻ và đặt phòng khách sạn thông minh với AI',
      excerpt:
        'Công cụ AI nào giúp bạn tiết kiệm đến 40% chi phí chuyến đi? Khám phá ngay hướng dẫn chi tiết của chúng tôi.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBscxyrS7cdSoyz-Nc54YCi7KQMfSAUAxkNfaOIxtVjXiFfdaGnQ-kAfb3UWSpH-7J-CgEc2GL7LtnFehgHKMnwijN3N57x_SR4j_8KBrhFhpUMCrC3MwQNMNBh2ttDJzOqGIyQ37RBUyz1NwqgfNTg-AognfSzRx6VgP7FvCScIENE_PvnYnoe_t483ovBjimM4IpirXsw_Tsu7MfTDWqIunngy4TbbL9Tz7D5LQMYrUm0u923e80QrIjW5svnbL3GMXuw4vh9pZo',
    },
    {
      tag: 'Xu hướng • 6 phút đọc',
      title: 'Du lịch một mình không còn khó với trợ lý SavoryTrip',
      excerpt:
        'Tự tin lên đường một mình với sự đồng hành của AI, đảm bảo an toàn và luôn có gợi ý ăn uống tuyệt vời.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Gu3zBeJjQNOl9Yy-NURoZieZctQtMiTmDT90lRM8JUgD9m09wWSdEcMEbxay4WHG--YiBkbikYI_NhYf765Xx7SSg-PLguVuBhet7zkNLCuI34pjh44LEEaRS4dhDvNTBN_DBPEX31KuPgI5qkXIfbb2NPxtUBpsjlEe57XI5fQl21bOJI-yVMmPgx2_oG7FAop-khMP6SM9yU3XRkYWvpzQBhBDRT18kCCsLmnhN5sgQyi5dRmg0rpo-cRtNpnhsBGBViNDt0WE',
    },
  ];

  return (
    <section className="px-6 md:px-20 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Góc cảm hứng</h2>
          <Link
            to="/blog"
            className="text-primary-600 font-bold hover:underline"
          >
            Xem thêm Blog
          </Link>
        </div>

        {/* Grid 3 bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <article key={i} className="group cursor-pointer">
              {/* Ảnh bài viết dạng 16:10 */}
              <div className="rounded-2xl overflow-hidden mb-4 aspect-[16/10]">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Tag danh mục - màu primary */}
              <p className="text-primary-600 text-xs font-bold uppercase tracking-wider mb-2">
                {post.tag}
              </p>
              {/* Tiêu đề hover đổi màu primary */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h3>
              {/* Tóm tắt (2 dòng) */}
              <p className="text-slate-600 text-sm line-clamp-2">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// =============================================================
// Component xuất chính: LandingPage
// Ghép tất cả sections theo thứ tự như thiết kế Stitch
// =============================================================
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Tính năng AI nổi bật */}
      <BenefitsSection />

      {/* 3. Điểm đến + Bản đồ */}
      <DestinationsSection />

      {/* 4. Loại hình ẩm thực */}
      <FoodCategorySection />

      {/* 5. Demo Chat AI (nền tối) */}
      <AIChatDemoSection />

      {/* 6. Blog / Cảm hứng */}
      <BlogSection />
    </div>
  );
};

export default LandingPage;
