import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, CheckCircle, Globe, Phone, Mail, MapPin, Users, Image as ImageIcon, FileText, ShieldCheck } from 'lucide-react';

// ============================================================
// DEFAULT DATA: Pre-filled content for each page type
// In production, this would be fetched from the backend API
// ============================================================
const DEFAULT_DATA = {
  about: {
    title: 'Về SavoryTrip',
    tagline: 'Hành trình ẩm thực & du lịch thông minh',
    description: 'SavoryTrip là nền tảng gợi ý ẩm thực và du lịch sử dụng AI, giúp người dùng khám phá những địa điểm ăn uống và trải nghiệm du lịch tuyệt vời nhất tại Việt Nam.',
    mission: 'Kết nối người Việt với văn hóa ẩm thực địa phương phong phú, mang lại những hành trình đáng nhớ và trải nghiệm ẩm thực chân thực nhất.',
    vision: 'Trở thành ứng dụng đồng hành du lịch & ẩm thực được tin dùng nhất tại Đông Nam Á vào năm 2028.',
    foundedYear: '2025',
    teamSize: '15',
    coverImageUrl: '/images/about-banner.jpg',
    logoUrl: '/images/logo.png',
    contactEmail: 'hello@savorytrip.vn',
    contactPhone: '0123 456 789',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    // Team members
    team: [
      { name: 'Nguyễn Văn A', role: 'CEO & Co-founder' },
      { name: 'Trần Thị B', role: 'CTO & AI Lead' },
      { name: 'Lê Minh C', role: 'Head of Design' },
    ],
  },
  terms: {
    title: 'Điều khoản dịch vụ',
    lastUpdated: '2026-03-01',
    intro: 'Bằng cách sử dụng SavoryTrip, bạn đồng ý với các điều khoản dịch vụ dưới đây. Vui lòng đọc kỹ trước khi sử dụng nền tảng của chúng tôi.',
    sections: [
      {
        heading: '1. Điều kiện sử dụng',
        content: 'Người dùng phải từ 13 tuổi trở lên để đăng ký tài khoản. Bằng cách tạo tài khoản, bạn đồng ý cung cấp thông tin chính xác và bảo mật thông tin đăng nhập của mình.',
      },
      {
        heading: '2. Quyền sở hữu trí tuệ',
        content: 'Tất cả nội dung trên SavoryTrip (hình ảnh, văn bản, logo) đều thuộc quyền sở hữu của SavoryTrip hoặc đối tác cấp phép. Nghiêm cấm sao chép hoặc phân phối lại mà không có sự cho phép bằng văn bản.',
      },
      {
        heading: '3. Chính sách nội dung người dùng',
        content: 'Bạn chịu trách nhiệm về nội dung bạn đăng tải. SavoryTrip có quyền xóa nội dung vi phạm chính sách và đình chỉ tài khoản vi phạm nghiêm trọng.',
      },
      {
        heading: '4. Giới hạn trách nhiệm',
        content: 'SavoryTrip cung cấp dịch vụ "theo thực tế" và không đảm bảo tính chính xác tuyệt đối của thông tin địa điểm và giá cả. Người dùng tự chịu trách nhiệm khi quyết định dựa trên gợi ý của nền tảng.',
      },
      {
        heading: '5. Thay đổi điều khoản',
        content: 'SavoryTrip có quyền cập nhật điều khoản dịch vụ. Người dùng sẽ được thông báo qua email khi có thay đổi quan trọng.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    lastUpdated: '2026-03-01',
    intro: 'SavoryTrip cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
    sections: [
      {
        heading: '1. Thông tin chúng tôi thu thập',
        content: 'Chúng tôi thu thập: (a) Thông tin bạn cung cấp khi đăng ký (họ tên, email); (b) Dữ liệu sử dụng (địa điểm đã xem, tìm kiếm, lịch sử chat AI); (c) Thông tin thiết bị và vị trí nếu bạn cấp quyền.',
      },
      {
        heading: '2. Mục đích sử dụng',
        content: 'Thông tin được dùng để: Cá nhân hóa gợi ý địa điểm và món ăn; Cải thiện tính năng AI của nền tảng; Gửi thông báo và cập nhật liên quan đến tài khoản.',
      },
      {
        heading: '3. Chia sẻ thông tin',
        content: 'Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ với đối tác cung cấp dịch vụ kỹ thuật (hosting, email) và khi có yêu cầu pháp lý.',
      },
      {
        heading: '4. Bảo mật dữ liệu',
        content: 'Dữ liệu được mã hóa bằng TLS/SSL trong quá trình truyền tải. Mật khẩu được lưu trữ dưới dạng hash (Bcrypt). Chúng tôi thực hiện kiểm tra bảo mật định kỳ.',
      },
      {
        heading: '5. Quyền của bạn',
        content: 'Bạn có quyền: Truy cập và chỉnh sửa thông tin cá nhân; Yêu cầu xóa tài khoản và dữ liệu; Từ chối nhận email marketing bất cứ lúc nào.',
      },
    ],
  },
};

// ============================================================
// ABOUT PAGE FORM
// ============================================================
function AboutForm({ data, setData }) {
  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleTeamChange = (idx, field, val) => {
    const updated = [...data.team];
    updated[idx] = { ...updated[idx], [field]: val };
    setData(prev => ({ ...prev, team: updated }));
  };

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Globe size={18} className="text-primary-600" /> Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên website</label>
            <input type="text" value={data.title} onChange={e => handleChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline (Khẩu hiệu)</label>
            <input type="text" value={data.tagline} onChange={e => handleChange('tagline', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Năm thành lập</label>
            <input type="text" value={data.foundedYear} onChange={e => handleChange('foundedYear', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng nhân viên</label>
            <input type="text" value={data.teamSize} onChange={e => handleChange('teamSize', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả (Giới thiệu ngắn)</label>
          <textarea rows={3} value={data.description} onChange={e => handleChange('description', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Sứ mệnh (Mission)</label>
          <textarea rows={2} value={data.mission} onChange={e => handleChange('mission', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tầm nhìn (Vision)</label>
          <textarea rows={2} value={data.vision} onChange={e => handleChange('vision', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none" />
        </div>
      </div>

      {/* Hình ảnh */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ImageIcon size={18} className="text-primary-600" /> Hình ảnh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Logo</label>
            <input type="text" value={data.logoUrl} onChange={e => handleChange('logoUrl', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Ảnh Banner (Cover)</label>
            <input type="text" value={data.coverImageUrl} onChange={e => handleChange('coverImageUrl', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>
      </div>

      {/* Liên hệ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Phone size={18} className="text-primary-600" /> Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><Mail size={13}/> Email liên hệ</label>
            <input type="email" value={data.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><Phone size={13}/> Số điện thoại</label>
            <input type="text" value={data.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><MapPin size={13}/> Địa chỉ văn phòng</label>
            <input type="text" value={data.address} onChange={e => handleChange('address', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>
      </div>

      {/* Đội ngũ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-primary-600" /> Đội ngũ sáng lập
        </h3>
        {data.team.map((member, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Họ tên</label>
              <input type="text" value={member.name} onChange={e => handleTeamChange(idx, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Vai trò</label>
              <input type="text" value={member.role} onChange={e => handleTeamChange(idx, 'role', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LEGAL PAGE FORM (Terms & Privacy — cùng cấu trúc)
// ============================================================
function LegalForm({ data, setData }) {
  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const handleSectionChange = (idx, field, val) => {
    const updated = [...data.sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setData(prev => ({ ...prev, sections: updated }));
  };

  return (
    <div className="space-y-6">
      {/* Header pháp lý */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-primary-600" /> Thông tin chung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề trang</label>
            <input type="text" value={data.title} onChange={e => handleChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày cập nhật lần cuối</label>
            <input type="date" value={data.lastUpdated} onChange={e => handleChange('lastUpdated', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Đoạn mở đầu (Intro)</label>
          <textarea rows={3} value={data.intro} onChange={e => handleChange('intro', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none" />
        </div>
      </div>

      {/* Các điều khoản / khoản mục */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary-600" /> Các điều khoản / khoản mục
        </h3>
        {data.sections.map((sec, idx) => (
          <div key={idx} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tiêu đề mục {idx + 1}</label>
              <input type="text" value={sec.heading} onChange={e => handleSectionChange(idx, 'heading', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nội dung</label>
              <textarea rows={3} value={sec.content} onChange={e => handleSectionChange(idx, 'content', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const PAGE_CONFIG = {
  about:   { title: 'Về chúng tôi',        description: 'Chỉnh sửa nội dung trang giới thiệu SavoryTrip.', preview: '/about' },
  terms:   { title: 'Điều khoản dịch vụ',  description: 'Cập nhật các điều khoản sử dụng nền tảng.',      preview: '/terms' },
  privacy: { title: 'Chính sách bảo mật',  description: 'Cập nhật chính sách bảo vệ dữ liệu người dùng.', preview: '/privacy' },
};

export default function StaticPageEditor() {
  const { pageType } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = PAGE_CONFIG[pageType] || { title: 'Trang tĩnh', description: '', preview: '/' };

  // Load pre-filled content 
  useEffect(() => {
    setData(DEFAULT_DATA[pageType] ? { ...DEFAULT_DATA[pageType] } : null);
    setSaved(false);
  }, [pageType]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API save call
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Không tìm thấy nội dung cho trang này.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold border-l-4 border-primary-600 pl-3">
            Chỉnh sửa: {config.title}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">{config.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open(config.preview, '_blank')}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium transition shadow-sm"
          >
            Xem trước
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition disabled:opacity-70 text-sm font-medium"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <CheckCircle size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{saved ? 'Đã lưu!' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Form content based on pageType */}
      {pageType === 'about' ? (
        <AboutForm data={data} setData={setData} />
      ) : (
        <LegalForm data={data} setData={setData} />
      )}
    </div>
  );
}
