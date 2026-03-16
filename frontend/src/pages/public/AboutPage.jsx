/**
 * AboutPage.jsx
 *
 * Trang "Về chúng tôi" (About Us) của SavoryTrip.
 * Thiết kế theo bản cập nhật mới nhất (chuẩn Stitch).
 */

import { Link } from 'react-router-dom';
import { Brain, MapPin, Sparkles } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Nguyễn Minh Quân',
    role: 'Chief Executive Officer',
    desc: 'Chuyên gia chiến lược với 10 năm kinh nghiệm trong ngành du lịch số.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoyzkLXovb_VjBbrRm98wsdVQtpe_PAkCTI2tnVdU3PiEYBQhYCXLydw-1BJjMVmbORSvR2vnp1w3wVc2mp0pbN0UC52YwUtKgXKE9lAewhtg9yFWOFsVmIiUoTDDfcEZmXPF8Qe9uOsgZIyzcRtbnGvAmGpRQUhAboSV7XTcQOSSn2ws87bQv-00dNaP4bDrgsUiRSvzsdKroMxpbkC3AVVnIMVdQ93gBt_2NGaVFMpqA-9tplwkYbbSKZuLN3H54-SLbaaUYmBc'
  },
  {
    name: 'Trần Lê Thu Hà',
    role: 'Chief Technology Officer',
    desc: 'Tiến sĩ AI, người đứng sau hệ thuật toán thông minh của SavoryTrip.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWRgknBID7mhzmg6DukV-wwBHZAPnE7daJR81JjXl-F-95tckB0I4CTxbJXUFQSJvkG7eWPTHw2xD3JKOb1R4I6tkLAk0vbb3UVjPL5WaUy7ZooCy1XL9eCk0t7DCZ7T-Dw1p5BNB_GDfd-9vbLWGXXo9ZuQhKHQrINYGzQQeRbdybtWbj2FqhB0eXb8edyKb-YzPxhTO6yqx9qJmX_WgqxPx8iRAVqQcWL_tw1OrPLVhUfVs1y0kW_K-gisCR6H9hsl2U1jCSOLA'
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Head of Product',
    desc: 'Nhà thiết kế trải nghiệm người dùng đam mê ẩm thực đường phố.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNuqGaUA98qEpZ71u3VaiHAwhDN58S01lyRm_P1JSFzkbpHGCCzTvMNsX58rmTVPUW9elJqWwrb9yk0tT6Yr5wFrWAIWruPOvOMLYRgc2zTc1yhiInqvj2tqANkoMnuEA5nAsK1rGpFa3Y9T90PiT5WnhOaxQBb_1M0Msq772h6Ob2P5poy47dE7Pf1llFC_CLQoZHE85MKNjrhyE6Xt0VJ7pZao3kt9grkDXetjNfc1fUtZ_OYss5hrP0H_WFRUtQCi2zF6DRNmU'
  }
];

const CORE_VALUES = [
  {
    icon: Brain,
    title: 'Trí tuệ nhân tạo (AI)',
    desc: 'Hệ thống AI thông minh phân tích hàng triệu dữ liệu để mang lại gợi ý chính xác nhất cho từng người dùng.'
  },
  {
    icon: MapPin,
    title: 'Tính bản địa (Local)',
    desc: 'Ưu tiên những giá trị văn hóa và hương vị truyền thống đích thực từ cộng đồng địa phương.'
  },
  {
    icon: Sparkles,
    title: 'Trải nghiệm cá nhân',
    desc: 'Mỗi hành trình là duy nhất, được tùy chỉnh dựa trên sở thích, dị ứng và mong muốn riêng của bạn.'
  }
];

const AboutPage = () => {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 z-10"></div>
          <img 
            alt="Founders sharing a meal" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8MWalvkRb4lKst-LyEEh7LyRoLRkrUQbDh2orGz2BjhZAj7RFs-HP36juZ0jwhedKt4h8FGfnTrAN_WB8zkeAKDhKE_U6wEaySoJpyYuqn0oOeXebBxskryMSqUCQ4Fmg1O8hywQ7VW88P5QMDdlpZyBh5TLFu12DcQjaynpID8iqU0-tWuxXToCMQYD3XzRx0jRv1iFvQTmm3P29DDis5MntUW1EjXCQTHacYsqGF3Mtyi_-Bz3Hn9BzEOPDStSmnnWirhTU9Y"
          />
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-white text-5xl md:text-7xl font-extrabold font-poppins mb-6 leading-tight drop-shadow-lg">
            Travel Through Taste
          </h1>
          <div className="h-1.5 w-24 bg-accent-500 mx-auto rounded-full mb-6"></div>
          <p className="text-slate-100 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
            Khám phá thế giới qua những trải nghiệm ẩm thực tinh tế cùng trợ lý du lịch AI của chúng tôi.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="max-w-[1200px] mx-auto px-10 py-24 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-primary-600 font-bold tracking-widest uppercase text-sm">Câu chuyện của chúng tôi</span>
            <h2 className="text-slate-900 text-4xl font-bold font-poppins mt-4 mb-8">Khởi nguồn của SavoryTrip</h2>
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                SavoryTrip bắt đầu từ một ý tưởng đơn giản tại một quán phở nhỏ ở Hà Nội. Chúng tôi nhận thấy rằng du lịch thực sự không chỉ là ngắm cảnh, mà là cảm nhận linh hồn của vùng đất đó thông qua hương vị ẩm thực bản địa.
              </p>
              <p>
                Tuy nhiên, việc tìm kiếm những địa điểm ăn uống đích thực, không "du lịch hóa" thường là một thách thức lớn đối với khách du lịch. Đó là lý do chúng tôi xây dựng SavoryTrip.
              </p>
            </div>
          </div>
          <div className="space-y-6 text-slate-600 leading-relaxed text-lg pt-0 md:pt-20">
            <p>
              Chúng tôi kết hợp sức mạnh của <span className="text-primary-600 font-semibold">trí tuệ nhân tạo</span> với kiến thức chuyên sâu của những chuyên gia ẩm thực bản địa. AI của chúng tôi không chỉ gợi ý địa điểm, nó thấu hiểu sở thích và khẩu vị cá nhân của bạn để tạo ra một hành trình ẩm thực độc bản.
            </p>
            <p>
              Mỗi gợi ý từ SavoryTrip đều được kiểm chứng để đảm bảo bạn sẽ có những trải nghiệm chân thực nhất, từ các quầy hàng rong ven đường đến những nhà hàng cao cấp ẩn mình trong phố cổ.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 text-3xl font-bold font-poppins">Giá trị cốt lõi</h2>
            <div className="h-1 w-16 bg-accent-500 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary-600/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="text-primary-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{val.title}</h3>
                  <p className="text-slate-600">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-10 py-24">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 text-3xl font-bold font-poppins">Đội ngũ sáng lập</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Những con người đam mê công nghệ và văn hóa ẩm thực, cùng nhau xây dựng tương lai của du lịch.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="size-48 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6">
                  <img alt={`${member.role} Portrait`} className="w-full h-full object-cover" src={member.image} />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mt-1">{member.role}</p>
                <p className="text-slate-500 text-sm mt-3 px-4">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-[1120px] mx-auto px-4 mb-24 mt-24">
        <div className="bg-primary-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-bold font-poppins mb-6">Sẵn sàng cho chuyến phiêu lưu vị giác?</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg">Gia nhập cộng đồng hơn 50,000 người yêu du lịch và ẩm thực trên khắp thế giới.</p>
          <Link to="/explore" className="inline-block bg-white text-primary-600 font-bold py-4 px-10 rounded-lg hover:bg-slate-100 transition-colors shadow-xl relative z-10">
            Khám phá ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
