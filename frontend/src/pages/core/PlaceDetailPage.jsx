import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, MapPin, Clock, Banknote, ChevronRight, Plus } from 'lucide-react';

function PlaceDetailPage() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  // Dữ liệu mẫu vì hiện tại chưa có API get detail
  const placeData = {
    id: id,
    name: 'Phở Gia Truyền',
    rating: '4.9',
    reviewsCount: '1.2k',
    location: 'Phố Cổ, Hà Nội',
    address: '49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội, Việt Nam',
    hours: '06:00 - 10:00 | 18:00 - 20:30',
    price: '50.000đ - 70.000đ ($$)',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhRw5sPeI7Ubs3fATAfgV9h4mmQRUf2jTegYU_G1uSKsnBIuL5jxvp6pTpRZ4yBpa3pDjwRBS77hmbSSHa8RPLs2JsthKbNFueNYG2q2RiYtNTe0qat2_bZObj6Ux-NXFfUOgKZlx6vtuwdKxz1av862JxVbu8OfqJuDtzO5Y190oYXnVU2SycHmSJA7QWxJEqeIGX5UNfs_VK67ahiMgZ26LPqfLBSTQ63s8BdKeKKdgmW26stGxMWflVHbeAIhGljN4rZmr3WgQ',
    description: [
      'Phở Gia Truyền Bát Đàn không chỉ là một quán ăn, mà là một biểu tượng văn hóa ẩm thực của Hà Nội. Nổi tiếng với nước dùng trong vắt nhưng đậm đà, được ninh từ xương bò trong nhiều giờ cùng các loại gia vị bí truyền như quế, hồi, gừng nướng.',
      'Điểm đặc biệt ở đây là phong cách "phở xếp hàng" đặc trưng, nơi thực khách tự phục vụ để thưởng thức những lát thịt bò tươi ngon, mềm mại được thái ngay tại quầy. Sợi phở dai vừa phải, hòa quyện cùng hành lá và tương ớt truyền thống tạo nên một trải nghiệm khó quên.'
    ],
    menu: [
      {
        name: 'Phở Tái Nạm',
        desc: 'Thịt bò tươi thái mỏng, nạm giòn',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhaoHlsL3C3GsvTbVPLCNfiYiRhh1HGv2TkSi7b8UZElg9wh-liAK0ho8pgOs-DumQI76hLO4MqABPtDWqYylCh4Ga7xBejKBi4YedSrDCHsf4DWi481KvNwi5yHURS9zk7GwJQ9A2xKaXt1CrePDpmgLMzgBkYlyXRyObB6hCZjzLuXmBOQ47ZS2xSb2tOqv-Im537EYolrd5T74PDZRHi-mTaeM_Vh47l-O36HP7OSnK-R25jC_E0Q366OJKPFtSF9sA-aJjg9w'
      },
      {
        name: 'Phở Tái',
        desc: 'Vị ngọt thanh từ thịt bò trần',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZuJQXuKJgYA-uWDmdGDCyMfC2GkfBmpYEArXkIOYJUOUOUzkCGRYMZqdgk5r0-k40WtnPABWL6lG5Yo48iTJqmHwialZ7uRXnWU7LEs4ItHU8sJ-cF3jqmSvCMlnMB3sNb6y7tgxVOwNMkTDgogWMVLJ7RWshZH0rM1_m6AV_NFwugWxHXfeCW6dFFrz_gu_N_FOSce2vJ7SmkGhGUtgrQavKmuRlGY7ASnHR9yVyXvImu7SzgEJ28bMsL6xGdZKBDEqNb6Nb3RU'
      },
      {
        name: 'Phở Chín',
        desc: 'Thịt chín kỹ, đậm đà gia vị',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg1wnOUq0LtI95LdR9hitMIjZjnEM5Q14MpjXShyLOScoOVYfet1Nlv3gCexT0Ag8bdku3l9iywW0EeU9XDZcuJyDGYt1WGadZ62UZyvGygE1jlSjWi5B8FENhrJsYejP_BQ9o38fbIgnK9Ci_jAHXjl1MfTBhmgiEzfMM5p-uN9D-07-liPeafSBL_ee34ucI8FaEX02o-7R63bqBfmy_dQHKaIkUuTZEecvnYPlkoCBJKcE9BM3YU6mbCNgG8ba_rMS9BQJnkMo'
      }
    ],
    reviews: [
      {
        user: 'Minh Anh',
        time: '2 ngày trước',
        rating: 5,
        content: 'Nước dùng thực sự đỉnh cao. Dù phải xếp hàng hơi lâu nhưng rất đáng công chờ đợi. Quẩy ở đây cũng rất giòn và ngon.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC40etV1tAHofBsmaw3URB1DW_zxLMVhAfEaUUE8CUplhFZ68sFS-UEYNUIrHMZt6U57xjyJ2gnS_pOTAi5HugHatgqsWYnmgRkGSSZveeMTRW3Y3NMeZKlmARbfty54o5w5w5gu_CXWXWowIx-ZNW3KqTun_JX5BYGR8pSEqFwNN3scWNiyAyH0XT0kx8oiFslq4l6riQDuVI3O-RckTcDEBeHdfeHup5D_RZ5uYccrF5vyJN-SvhPEGbATt4zsnfWsmcYl7IcuEc'
      },
      {
        user: 'Hoàng Nam',
        time: '1 tuần trước',
        rating: 5,
        content: 'Hương vị phở xưa đúng chuẩn Hà Nội. Không gian hơi chật hẹp một chút nhưng đó là một phần của trải nghiệm Phố Cổ.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3acBqhznDqQwC4ImDaV2udPCBgo792PyVKPx76GsiNm3EV0LzcWxh_Q3nx_8DVf3psH-6SW5P--bFH2KgV5155S1lrmOO8P1KpdWYWozCPX_zHzMN_C0DHwbubJFuO_0vC6gNLWyGVnG0j7SluI1SyBAwevHjwFVhlT238WA9tNb_jGbx7gRqfolmRnh-01eBiie0NGAgulbCKNqJX5C2s7ilXzLmHtUIlFgkYIdvwvwjyWuakI9b23rrlcrvIPq4SSKVbzzrYIY'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpWXI_A0oRU4Ae37yVtc-kqSTiqFVakIiPCVd7-JyCmT7m4UmdNs0ScGTsXmPsTZ4X6q-yPkM5od30jmi5xpAwtPUGxCn9ymzyNykaR__GRFMyfvdCz7ORZcLAczzKya4MHj90U6cJH3EFgsJAPPqCpiyA_9ltFESUTVH4JImnJnrqjgV8M-5YcsnW0Y8kb-dfBGWGLrCgk5MpK9Jr5DkJgUGAzEBskhXNBOhXzyDLOLHyl81atZeHReS96y2ULG5TnUGLBZ2n7M',
    suggestions: [
      {
        name: 'Bánh Mì Phố Cổ',
        rating: '4.7 (850)',
        distance: '200m',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAocdMbpPWSoCGCqtqet48lYkQD82TcNrvNUKJb_KXDBPlP-Kc6Yj2Gr7lMnBtkCPGf2R4MsOev3hVp9OOeqJUywMcKmta2jwbb7xBKFpb9yn45E6VxhsCUISBqUvIfsIOC_FUnQi8bhD3g_f0PVv7LVw07EB5IvfEEc6ujzwm2_CFfDae8UuY4yvO2iSihtFeTe2PcvVmSSF4L6ZP_rg31ugsJl5S8cqTY0jYuoXioqjfHZxHnYjI3Pwq5UNrQVfbEz_nlSJ7jVRA'
      },
      {
        name: 'Cà Phê Trứng Giảng',
        rating: '4.8 (2.1k)',
        distance: '450m',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpq1EAchqhgMxp5t-WTbWrfNr1smGFKPRhfHVcc0kuv_XtKAhS7P25NX1sKDtqb_1vyUyNhZG4T5GXwY-87Qzft4WJ6ejZubgKcvlFsnJiP8IPos4qscIAHT_Df1rWMNR5bXgBQypEF-hVZHhCBvPv9YGmt5C9Fn6dj5kRn6JlWV1stlwgNjkQL4fKja1X06cscLYiOx6yimSnxjVvOuKB28Vz7ozbJ3iKW0bDtk1VdvmwsHeSRwSi0d3NHRtFuK16be5IWoifTGg'
      },
      {
        name: 'Bún Chả Đắc Kim',
        rating: '4.6 (1.5k)',
        distance: '300m',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChYmmR1pTXcy5EBbkoJ1WGH39D82ePj3OXkEL2MPgK4gwSj1wZ7ySkltGLnZUUxQo9zA367Mhw8hmLZ2uwhrJk7ZP9mmYvheIz8CvcAMyAH0KXi2YjShaPiPK-4ZD3KsXmyowbATj4W15UEWVthaJKyHIfFxAnhW-7iXK0cRxOz4fALrNe8BWDQQXrXoNSOCtYWObyyBUz0g0X0HPNKNCHDcla0NR-Hw2BzslDHyMX3qmS58R7vkJAx_44R_TRRWuXR5dF4wJkiRQ'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==============================================================
            Hero Section
            ============================================================== */}
        <section className="relative h-[450px] w-full rounded-xl overflow-hidden mb-8 shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url('${placeData.heroImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{placeData.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <Star className="text-accent-500 w-4 h-4 fill-accent-500" />
                  <span className="ml-1 font-bold text-sm">{placeData.rating}</span>
                  <span className="ml-1 text-xs opacity-80">({placeData.reviewsCount} đánh giá)</span>
                </div>
                <span className="text-white/80 text-sm">• {placeData.location}</span>
              </div>
            </div>
            {/* Lưu địa điểm */}
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-lg transition-transform hover:scale-105"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
              {isSaved ? 'Đã lưu' : 'Lưu địa điểm'}
            </button>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ==============================================================
              Left Column: Content (70%)
              ============================================================== */}
          <div className="lg:w-[70%] space-y-8">
            
            {/* Quick Info Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center text-primary-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Địa chỉ</p>
                  <p className="text-sm font-medium">{placeData.address.split(',')[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Giờ mở cửa</p>
                  <p className="text-sm font-medium">{placeData.hours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mức giá</p>
                  <p className="text-sm font-medium">{placeData.price}</p>
                </div>
              </div>
            </div>

            {/* Flavor & History */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Hương vị & Lịch sử</h2>
              <div className="prose max-w-none text-slate-600 leading-relaxed">
                {placeData.description.map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Menu Must Try */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Menu phải thử</h2>
                <Link to="#" className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  Xem tất cả <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {placeData.menu.map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2">
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Đánh giá từ cộng đồng</h2>
                <button className="text-primary-600 font-bold text-sm bg-primary-600/10 px-4 py-2 rounded-lg hover:bg-primary-600/20 transition-colors">
                  Viết đánh giá
                </button>
              </div>
              <div className="space-y-6">
                {placeData.reviews.map((review, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{review.user}</h4>
                        <span className="text-xs text-slate-400">{review.time}</span>
                      </div>
                      <div className="flex text-accent-500">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-accent-500" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ==============================================================
              Right Column: Widgets (30%)
              ============================================================== */}
          <aside className="lg:w-[30%] space-y-6">
            
            {/* Map Widget */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-sm">Vị trí</span>
                <button className="text-primary-600 text-xs font-bold uppercase tracking-wide hover:underline">Mở Maps</button>
              </div>
              <div className="h-48 bg-slate-200 relative">
                <img src={placeData.mapImage} alt="Map View" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="text-rose-500 w-10 h-10 fill-rose-500 drop-shadow-md" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 leading-tight italic">{placeData.address}</p>
              </div>
            </div>

            {/* AI Itinerary CTA */}
            <div className="bg-accent-500 rounded-xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 text-xl">✨</span>
                <h3 className="text-slate-900 font-bold text-lg">Công cụ AI</h3>
              </div>
              <p className="text-slate-800 text-sm font-medium">Bạn muốn thêm địa điểm này vào lịch trình du lịch {placeData.location.split(',')[1]} tự động?</p>
              <Link to="/planner" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm vào AI Itinerary
              </Link>
            </div>

            {/* Suggestions */}
            <div className="space-y-4 mt-8">
              <h3 className="font-bold text-slate-900">Gợi ý gần đây</h3>
              <div className="space-y-3">
                {placeData.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-3 items-center group cursor-pointer">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={suggestion.img} 
                        alt={suggestion.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-primary-600 transition-colors">{suggestion.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Star className="text-accent-500 w-3 h-3 fill-accent-500" />
                        <span>{suggestion.rating} • {suggestion.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 mt-2 text-slate-500 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Khám phá thêm gần đây
              </button>
            </div>
            
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PlaceDetailPage;
