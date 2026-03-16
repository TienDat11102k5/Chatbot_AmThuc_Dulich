import { Users, Eye, FileText, MessageSquare, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { title: 'Tổng người dùng', value: '1,245', change: '+12%', type: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Lượt truy cập tháng', value: '45.2K', change: '+5%', type: 'up', icon: Eye, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Bài viết đã đăng', value: '128', change: '+2', type: 'up', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Câu hỏi AI Center', value: '3,842', change: '-4%', type: 'down', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const topPlaces = [
    { id: 1, name: 'Nhà hàng Bún chả Hương Liên', location: 'Hà Nội', views: 4250, category: 'food' },
    { id: 2, name: 'Vịnh Hạ Long', location: 'Quảng Ninh', views: 3820, category: 'travel' },
    { id: 3, name: 'Phố cổ Hội An', location: 'Quảng Nam', views: 3105, category: 'travel' },
    { id: 4, name: 'Cơm tấm Ba Ghiền', location: 'TP.HCM', views: 2840, category: 'food' },
    { id: 5, name: 'Bà Nà Hills', location: 'Đà Nẵng', views: 2450, category: 'travel' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold border-l-4 border-primary-600 pl-3">Báo cáo & Thống kê</h2>
        <p className="text-slate-500 mt-1">Tổng quan tình hình hoạt động của website</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold rounded-full px-2.5 py-1 ${
                  stat.type === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}>
                  {stat.type === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart mock */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Lượt truy cập (30 ngày qua)</h3>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-primary-500 hover:bg-white transition cursor-pointer">
              <option>Theo ngày</option>
              <option>Theo tuần</option>
              <option>Theo tháng</option>
            </select>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            {/* Fake Chart Lines */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-primary-100/40 to-transparent opacity-50" />
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full stroke-primary-500 fill-none opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md" style={{ strokeWidth: 0.6 }}>
              <path d="M0,35 Q5,30 10,32 T20,25 T30,20 T40,28 T50,15 T60,18 T70,8 T80,12 T90,5 T100,0" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
              <Eye size={16} className="text-primary-600"/> Dữ liệu biểu đồ mô phỏng
            </div>
          </div>
        </div>

        {/* Top items */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top địa điểm xem nhiều</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topPlaces.map((place, index) => (
              <div key={place.id} className="flex items-center gap-4 group p-2 rounded-xl hover:bg-slate-50 transition -mx-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate group-hover:text-primary-600 transition text-sm">{place.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 w-full truncate">
                    <MapPin size={12} className="shrink-0" /> {place.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-slate-700">{place.views.toLocaleString()}</p>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">lượt</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-slate-50 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition text-sm border border-transparent hover:border-primary-100 shrink-0">
            Xem tất cả
          </button>
        </div>

      </div>
    </div>
  );
}
