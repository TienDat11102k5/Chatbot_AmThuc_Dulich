import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Lightbulb, CheckCircle2 } from 'lucide-react';

const mockData = {
  'top-10-mon-ngon-da-lat': {
    title: 'Top 10 món ngon không thể bỏ qua khi đến Đà Lạt mùa mưa',
    date: '24/03/2026', readTime: '5 phút đọc', tag: 'Ẩm thực', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200',
    content: (
      <>
        <p className="text-xl font-medium italic text-slate-600 leading-relaxed border-l-4 border-blue-200 pl-6 py-2 mb-10">
          Đà Lạt những ngày mưa mang một vẻ đẹp trầm mặc, se lạnh và lãng mạn vô cùng. Nhưng cái thú vị nhất của những cơn mưa cao nguyên chính là việc được ngồi quây quần bên bếp lửa ấm, hít hà mùi thơm của những món đặc sản nóng hổi. Dưới đây là danh sách những món ngon "cứu rỗi" tâm hồn bạn trong những chiều mưa Đà Lạt.
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">1. Lẩu gà lá é</h2>
        <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwVpcNsP5WO_s8wpndJSH-FlGxdWdvxJk1nkUNmIkMHz8Sv2uhyxvdIXb-qM43cQXxabBlSjK7OFuqxMhsyMcSQm0_YoPy3hHT-HrO1nbZ5m_9XEV8eNj21vyp3pBbtbA3kROf4JYk2BQ1QRI1yRw0NIlE3spijYKkfXukyxFZt0h5_CpM2wr0bTFzqrT_00dTF1v8rA-rcSZkT4fVYFAeP5afwBN6YAT_uiRALGwk4FHaK-ORuH3BHcIAlu9ARA421Ml4KTSWoRo" alt="Lẩu gà lá é" className="w-full h-[400px] object-cover" />
        </div>
        <p className="mb-10 leading-relaxed text-slate-600">
          Nếu phải chọn một món ăn biểu tượng cho sự ấm áp giữa tiết trời se lạnh của Đà Lạt mùa mưa, chắc chắn đó phải là Lẩu gà lá é. Vị ngọt thanh của thịt gà ta, chút cay nồng của ớt xiêm xanh và hương thơm đặc trưng của lá é hòa quyện tạo nên một hương vị khó quên. Cảm giác húp một ngụm nước dùng nóng hổi khi tiếng mưa vẫn đang tí tách trên mái tôn là một trải nghiệm cực kỳ "chill".
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">2. Bánh tráng nướng</h2>
        <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8nNfwR02jpy_RfOHHqq35SDfvPsKrUvsTUz5tLQ73nR80ICZvXsZNQyN32M_C13V-tApDTpMUbeCbB42jp8j-853s9NzLhLR8CQc2_rqvqIYQwVSa1daectSzTMkQcCVDlMEWkbEnixeMSDZT2r6RGSFwILXijDwmAvPTJ0AWdc4EI1wHr2KagGRthJtxvxnxoiFbnR9DFs7EvSwJjrwzHvo3LqwjaI9pgLjRXYhO2ERt2WChyVsOlX0yzzcQIh-c4Oq8oHYRBE" alt="Bánh tráng nướng" className="w-full h-[400px] object-cover" />
        </div>
        <p className="mb-8 leading-relaxed text-slate-600">
          Được mệnh danh là "Pizza Đà Lạt", bánh tráng nướng là món ăn vặt quốc dân không thể bỏ lỡ. Dưới bàn tay thoăn thoắt của người bán, chiếc bánh tráng mỏng được nướng giòn rụm trên than hồng, phủ đầy trứng, hành lá, phô mai và xúc xích. Cầm trên tay chiếc bánh nóng hổi, vừa thổi vừa ăn giữa trời mưa phùn là một niềm hạnh phúc giản đơn của mọi lữ khách khi đến với thành phố ngàn hoa.
        </p>

        <div className="my-16 px-8 py-10 bg-[#031635] rounded-xl relative overflow-hidden text-center shadow-lg">
          <span className="material-symbols-outlined absolute -top-4 -left-4 text-white/10" style={{ fontSize: '100px' }}>format_quote</span>
          <blockquote className="relative z-10 italic text-2xl text-white">
            "Ẩm thực Đà Lạt không chỉ là món ăn, đó là cách chúng ta ôm lấy cái lạnh và biến nó thành sự ấm áp khó quên."
          </blockquote>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">3. Nem nướng Đà Lạt</h2>
        <p className="mb-10 leading-relaxed text-slate-600">
          Nem nướng là sự kết hợp tinh tế giữa thịt xay nướng trên than hồng, bánh tráng giòn và đặc biệt là loại nước chấm tương đậu phộng sền sệt độc quyền. Ăn kèm với rau sống tươi ngon của vùng đất sương mù, món ăn này mang lại sự cân bằng hoàn hảo về hương vị.
        </p>
      </>
    )
  },
  'meo-san-ve-may-bay-ai': {
    title: 'Mẹo săn vé máy bay giá rẻ với trợ lý AI',
    date: '24/03/2026', readTime: '8 phút đọc', tag: 'Kinh nghiệm du lịch', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqxNM2arNOHlRrEMB2y8F5M69k5ELaVw-waLaIy_SVrnhHDwg76sNe8ktorLuSgFhJSzccXyoTtYXQPDJj0Aiw1jBG7J8G7CtTuio7yFuinEoQQi8Jd2jxWpyKFKFd3r6vnQGTfH-UmQCXMKpwFh6uCFCL55G19TLeA7Y1A_VeQnsExAfW_bW4zu_CeFyes0Qwj6M919Me9ftJmNCug5rdbAbJ6ozDOOVCuC-jD16N4A3RTve3if8evqjg5KKuLA9BuGhoziWILyk',
    content: (
      <>
        <p className="text-xl font-medium text-slate-700 leading-relaxed mb-10 first-letter:text-5xl first-letter:font-bold first-letter:text-[#031635] first-letter:mr-2 first-letter:float-left">
          Việc tìm kiếm tấm vé máy bay giá rẻ chưa bao giờ là điều dễ dàng, cho đến khi cuộc cách mạng Trí tuệ nhân tạo (AI) bùng nổ. Không còn phải thức trắng đêm hay canh cánh chờ đợi các đợt khuyến mãi, giờ đây bạn có thể "thuê" một trợ lý AI thông minh làm việc đó 24/7 cho mình.
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-16 mb-6">AI thay đổi luật chơi như thế nào?</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Các thuật toán học máy hiện nay có khả năng phân tích hàng tỷ điểm dữ liệu lịch sử giá vé để dự đoán xu hướng trong tương lai với độ chính xác lên đến 95%. Thay vì chỉ liệt kê các giá vé hiện tại, AI sẽ khuyên bạn nên: "Mua ngay" hoặc "Chờ đợi vì giá sẽ giảm 20% trong 5 ngày tới".
        </p>

        <div className="bg-slate-50 rounded-2xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 opacity-50 -mr-16 -mt-16 rounded-full"></div>
          <h3 className="text-xl font-bold text-[#031635] mb-6 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-purple-600">tips_and_updates</span>
            Gợi ý công cụ hàng đầu
          </h3>
          <ul className="space-y-4 relative z-10">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#031635] mt-0.5" style={{ fontSize: '20px' }}>check_circle</span>
              <div className="text-slate-600">
                <strong className="text-slate-800">Google Flights AI:</strong> Tích hợp sâu vào hệ sinh thái, cho phép theo dõi và dự báo biến động giá cực kỳ nhạy bén.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#031635] mt-0.5" style={{ fontSize: '20px' }}>check_circle</span>
              <div className="text-slate-600">
                <strong className="text-slate-800">Hopper:</strong> Ứng dụng di động sử dụng AI để "chốt" thời điểm vàng mua vé rẻ nhất trong năm.
              </div>
            </li>
          </ul>
        </div>

        <div className="my-16 flex flex-col md:flex-row gap-8 items-center bg-slate-50 border border-slate-100 rounded-3xl p-4 shadow-sm">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-square">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQWcJYQ8tu0tPry7CbbgbmtTwq6pmdXrbPywndYfG5rzUnrqEiDSTuN-QqiHP-binksd0jonsyBf13YPGpdHaflI1P0sqKy_z2SIW9CHfk--bEB-UrHzGjDOvzM8x5atYGgJLj42yYMPMHBqrQnIa8cSIt7wgz-Ez2sTLiBsZUFuulosGEqqAqAw11N21-BBi7fuaAwcv0ELPSo9kksHrfPVfFfl86RahabrtMiDJ0XbhthOPy5T9DMOTRFkcxOVE6S3R6sznLRyI" alt="AI Data Visualization" className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 px-4 py-8 md:py-4">
            <h3 className="text-2xl font-bold text-[#031635] mb-4">Dữ liệu lớn, giá nhỏ</h3>
            <p className="text-slate-600 text-base leading-relaxed">
              Bằng cách tổng hợp dữ liệu từ hàng ngàn hãng hàng không toàn cầu, AI có thể phát hiện ra những "vé lỗi" (error fares) hoặc các hành trình nối chuyến thông minh mà mắt thường khó có thể nhận ra.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-16 mb-6">3 Bước thiết lập trợ lý săn vé của riêng bạn</h2>
        <p className="text-slate-600 leading-relaxed mb-10">
          Để đạt được hiệu quả tối ưu, hãy làm theo quy trình đơn giản sau:
        </p>

        <ol className="space-y-8 list-none pl-0 mb-16">
          <li className="flex gap-6">
            <span className="flex-shrink-0 w-12 h-12 bg-[#031635] text-white rounded-full flex items-center justify-center font-black text-xl shadow-md">1</span>
            <div>
              <h4 className="font-bold text-slate-800 text-lg mb-2">Thiết lập thông báo giá (Price Alerts)</h4>
              <p className="text-slate-600 leading-relaxed">Chọn hành trình và để AI theo dõi 24/7. Bạn sẽ nhận được thông báo đẩy ngay khi giá chạm ngưỡng kỳ vọng.</p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="flex-shrink-0 w-12 h-12 bg-[#031635] text-white rounded-full flex items-center justify-center font-black text-xl shadow-md">2</span>
            <div>
              <h4 className="font-bold text-slate-800 text-lg mb-2">Sử dụng tính năng "Explore" linh hoạt</h4>
              <p className="text-slate-600 leading-relaxed">Thay vì nhập ngày cụ thể, hãy để AI gợi ý tháng nào rẻ nhất để bay đến địa điểm bạn mơ ước.</p>
            </div>
          </li>
        </ol>

        <blockquote className="border-l-8 border-[#cfe8e3] bg-slate-50 p-10 my-16 rounded-r-3xl italic text-2xl text-slate-800 shadow-sm border border-slate-100">
          <p className="mb-6 leading-relaxed">"AI không chỉ là công cụ, nó là một người bạn đồng hành thông minh giúp biến những chuyến đi xa xỉ trở nên nằm trong tầm tay của tất cả mọi người."</p>
          <cite className="block text-sm font-bold uppercase tracking-widest text-emerald-600 not-italic">— EDITORIAL TEAM, SAVORYTRIP</cite>
        </blockquote>
      </>
    )
  },
  'du-lich-mot-minh-savorytrip': {
    title: 'Du lịch một mình không còn khó với trợ lý SavoryTrip',
    date: '25/03/2026', readTime: '6 phút đọc', tag: 'Công nghệ AI', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200',
    content: (
      <>
        <p className="text-xl font-medium italic text-slate-600 leading-relaxed border-l-4 border-blue-200 pl-6 py-2 mb-10">
          Trong kỷ nguyên của sự tự do, du lịch một mình (Solo Travel) đã trở thành một biểu tượng cho sự trưởng thành và khám phá bản thân. Tuy nhiên, rào cản về an toàn và lịch trình luôn là nỗi lo thường trực. SavoryTrip xuất hiện như một "người đồng hành số" hoàn hảo.
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Xóa bỏ rào cản tâm lý khi đi một mình</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Đi du lịch một mình không có nghĩa là bạn cô đơn. Với SavoryTrip, mọi bước chân của bạn đều được hỗ trợ bởi hệ thống trí tuệ nhân tạo hiểu rõ sở thích cá nhân. Từ việc gợi ý những quán cà phê ẩn mình trong hẻm nhỏ tại Venice đến việc đặt vé tàu cao tốc xuyên biên giới, mọi thứ đều nằm trong tầm tay.
        </p>

        <div className="my-10 p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold text-[#031635] mb-5">Tính năng an toàn ưu việt</h3>
          <ul className="space-y-4 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></span>
              <span><strong>Check-in tự động:</strong> Gửi vị trí định kỳ cho người thân mà không cần thao tác thủ công.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></span>
              <span><strong>Bản đồ nhiệt an toàn:</strong> Tránh các khu vực vắng vẻ hoặc có tỷ lệ tội phạm cao dựa trên dữ liệu thời gian thực.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></span>
              <span><strong>Trợ lý khẩn cấp 24/7:</strong> Kết nối ngay lập tức với cơ quan chức năng địa phương chỉ bằng một chạm.</span>
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Hành trình may đo riêng cho bạn</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Thay vì những tour du lịch đại trà, SavoryTrip sử dụng thuật toán để tối ưu hóa trải nghiệm dựa trên tâm trạng của bạn. Bạn muốn một buổi chiều tĩnh lặng đọc sách bên bờ hồ Como hay một đêm sôi động tại các quán bar ngầm ở Berlin? Trợ lý sẽ tự động điều chỉnh lộ trình để phù hợp nhất với năng lượng của bạn trong ngày.
        </p>

        <blockquote className="border-l-4 border-orange-300 pl-8 py-4 my-12 italic text-2xl text-slate-700 bg-orange-50/50 rounded-r-xl">
          "SavoryTrip không chỉ là một ứng dụng, nó là sự an tâm trong túi áo của mỗi lữ khách độc hành."
        </blockquote>

        <div className="grid grid-cols-2 gap-6 my-12">
          <div className="rounded-xl overflow-hidden aspect-square shadow-lg shadow-slate-200">
            <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800" alt="Solo traveler woman" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden aspect-square shadow-lg shadow-slate-200">
            <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800" alt="Eiffel tower" className="w-full h-full object-cover" />
          </div>
        </div>

        <p className="mb-10 leading-relaxed text-slate-600">
          Kết thúc hành trình, SavoryTrip còn giúp bạn lưu trữ những kỷ niệm dưới dạng nhật ký số được trình bày như một cuốn tạp chí thời thượng. Những bức ảnh, tọa độ và cảm xúc được sắp xếp tinh tế, sẵn sàng để chia sẻ hoặc giữ lại cho riêng mình.
        </p>
      </>
    )
  },
  'top-10-mon-sai-gon': {
    title: 'Top 10 món ẩm thực đường phố không thể bỏ lỡ tại Sài Gòn',
    date: '20/10/2023', readTime: '5 phút đọc', tag: '🔥 NỔI BẬT', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1200',
    customHeader: (
      <div className="w-full h-[400px] md:h-[600px] bg-[#031635] rounded-xl overflow-hidden mb-16 flex items-center justify-center relative shadow-xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDeKt9TGHnyzJQbipfuJrN_Bcp4ihdxjS5JUo2wEvz0dW4CfKlrx3ZDi5HXvuqZJmKi5gc6UcqVF1VmMWaIJ_AUBoDrhr5X0ikhV-j9uB4LptdY5p8ubMmNCVBNL78Orr6YG5xzMz3FlHlOXoMTOYR0AtD9MGgt-Pe5xAiFxEMxhEF2RmEqy6b_Pde0mZfbysCFeVA7xRk1_2xYcf9p2YPdnvjGcUUJOyQGcUEJiFxeMc9Wo5oZkb9ru3bSpmYFY5h9sViHnLA8-0')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        </div>
        <div className="relative z-10 text-center scale-150">
          <span className="material-symbols-outlined text-9xl text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>ramen_dining</span>
          <div className="mt-4 text-white/40 font-['Epilogue'] font-bold text-xl tracking-[0.2em]">CƠN LỐC VỊ GIÁC</div>
        </div>
      </div>
    ),
    content: (
      <>
        <p className="text-xl font-medium text-slate-800 leading-relaxed italic border-l-4 border-emerald-600 pl-6 mb-12">
          Sài Gòn - nơi được mệnh danh là thiên đường ẩm thực đường phố của Đông Nam Á. Từ những con hẻm nhỏ đến phố lớn, hương vị của các món ăn luôn nồng nàn và đầy sức sống.
        </p>
        
        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-4 font-['Epilogue']">1. Bánh mì Huỳnh Hoa - Huyền thoại "ổ bánh mì đắt nhất"</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Không phải ngẫu nhiên mà Bánh mì Huỳnh Hoa lại trở thành một biểu tượng. Với ổ bánh mì nặng tay, đầy ắp các loại chả, bơ và đặc biệt là lớp pate béo ngậy đặc trưng, đây là món ăn mà bất kỳ du khách nào cũng sẵn lòng đứng xếp hàng dài để thưởng thức.
        </p>
        <div className="my-10 rounded-xl overflow-hidden shadow-soft">
          <img className="w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4SFNzrGj0uA_u2AF3rNDa80FpEc6FrJiqAmhNmp2rsUeGKFeGYG0yg5Y4Bzwr4iD9DKWIqhK2vzyGDI79xA7EsQpAMUcJq__AqR4xBCqiPi2sP5o4me2Ng4aIqUAYVNQvOsJ993f-L0HeTP9ToTac-IJQ4GRozHLWCk4FLtA5rdktdguWkagdU4p7s3pfXjPKqGmTQowLAZpHU5vHioQ588bQYJlVesdISDPKmYsNFR3LQSY1uqlLpcnCZJHwBd2BHqF3vl8zSoo" alt="Bánh mì Huỳnh Hoa"/>
          <div className="bg-slate-100 p-4 text-center text-sm text-slate-500 italic">
            Bánh mì Sài Gòn luôn mang một sức hút khó cưỡng với lớp vỏ giòn tan và nhân đậm đà.
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-4 font-['Epilogue']">2. Ốc quận 4 - Văn hóa "nhậu" về đêm</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Đến Sài Gòn mà chưa đi ăn ốc là một thiếu sót lớn. Tại quận 4, bạn sẽ lạc vào mê cung của hàng trăm loại ốc được chế biến theo đủ phong cách: xào me, nướng mỡ hành, rang muối hay hấp sả. Không khí nhộn nhịp, mùi thơm của bơ và sả lan tỏa khắp phố phường.
        </p>
        <div className="grid grid-cols-2 gap-4 my-10">
          <img className="rounded-lg h-64 w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYAWWwii_pchs3E_1xXq_sPT9OCNzDndF-LQNR_KwdpNow2K5F0QiMkyCOqkYtD-BjF8NabJRR41s-auqVRzxoWh-l1KwLoOvaFyj5sKTMS5w9eUG-rnUvNeePlLBYDe3byX13pT7PLB8DYwFeEaaCkUcC9rYZEbET_jTZqPoeqsDz9DAwR3_99ZbI9_WE-JglqTsN_dQ_F7sDAuTtYpmx0AHxt4XCQoYNj90MFnXhk1leZxPPJ8DhpFG324wL5iFt05-EHJ8gTg8" alt="Ốc xào me"/>
          <img className="rounded-lg h-64 w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuxaObGZrfyHHwYxShPXSUU4n0hk9l7tlOWnQtvjlj4qaMM1vRbZ0zCnirJJQYzgwYOGbQOe28qyMVXzxbIFCoLXw1Agegfs_U3HB8dyiNH_OGf2_q_MuKmIU6U3p5qtsaMlEQsut-L9dicnTNnc87-R7min9nPwx12nIKgH-hAt9NVj16RGsLFeyQJi-iH2daayDftMKfZjUdTwxnRLIz2HLbwMgpDJStjiBJ5cNW7gzuR0IdrNGGKD6egBy0C4_d6PXhPJ2rnec" alt="Ốc mỡ hành"/>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-4 font-['Epilogue']">3. Cơm Tấm - Linh hồn bữa sáng Sài Thành</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Từ tầng lớp bình dân đến thượng lưu, cơm tấm luôn là sự lựa chọn ưu tiên. Miếng sườn nướng mật ong thơm nức, bì dai giòn cùng chả trứng vàng ươm, ăn kèm với chén nước mắm chua ngọt sền sệt là định nghĩa của hạnh phúc vào mỗi buổi sáng.
        </p>
        <div className="bg-sky-50 rounded-xl p-8 my-12 border-l-8 border-sky-400">
          <h4 className="font-bold text-[#031635] mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">lightbulb</span>
            Mẹo của đầu bếp:
          </h4>
          <p className="mb-0 text-sm text-slate-700">Hãy thử xin thêm một chút "mỡ hành" và "tóp mỡ" khi ăn cơm tấm, đó chính là bí quyết để món ăn trở nên hoàn hảo và đúng điệu nhất.</p>
        </div>
        
        <p className="leading-relaxed text-slate-600 mt-12 mb-4 italic text-lg text-center font-medium">
          Còn rất nhiều món ngon khác như Bún riêu Cua, Phá lấu, hay Gỏi cuốn... đang chờ đợi bạn khám phá. Sài Gòn không bao giờ ngủ, và dạ dày của bạn cũng vậy khi đặt chân đến đây!
        </p>
      </>
    )
  },
  'cach-dung-ai-len-lich-trinh': {
    title: 'Cách dùng AI để lên lịch trình du lịch tự túc',
    date: '15/01/2026', readTime: '5 phút đọc', tag: 'Bí kíp dùng AI', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6V9IOZNh7wtDttdF5EXC_VNw877lCy66MiMvBxEyzUFgF8mVSCPSJFce1eSzCM0x-uwtQneXX4SbXINftfbdilTlUja8unIUIZ24VM1x_lOiDvSiyXCgi-kwmfQNbSK3uizCzRVXtng4xYca7MjwHbKrdvkdVbseBLEcLvzNiifYbtIDE7MZbNZftswUQSk0COd1YPbyCaO84tFcP2qgE3ooYrP4WaNA84Tn2gxk8cC3YSmPVC3urcZnw5fVu0WQWSV3uJ25b9AA',
    content: (
      <>
        <p className="text-xl font-medium italic text-slate-800 leading-relaxed border-l-4 border-emerald-400 pl-6 py-2 mb-10">
          Học cách tối ưu hóa thời gian di chuyển và tìm kiếm những địa điểm ít người biết nhờ sức mạnh của trí tuệ nhân tạo. Chuyến đi của bạn sẽ không còn là những kế hoạch khô khan, mà là một hành trình được cá nhân hóa hoàn hảo.
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">1. Tại sao nên dùng AI cho chuyến du lịch tiếp theo?</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Lên kế hoạch du lịch truyền thống thường tốn hàng giờ đồng hồ lướt web, đọc review và so sánh giá. Với AI, bạn có thể tổng hợp toàn bộ thông tin chỉ trong vài giây. Quan trọng hơn, AI có khả năng phân tích sở thích cá nhân để đưa ra những gợi ý "may đo" riêng cho bạn.
        </p>

        <div className="my-10 p-8 bg-slate-50 border-l-4 border-yellow-400 rounded-r-2xl">
          <h4 className="flex items-center gap-2 font-bold text-[#031635] mb-3 text-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">lightbulb</span> Mẹo Prompt (Câu lệnh)
          </h4>
          <p className="text-slate-600 italic">
            "Hãy đóng vai là một chuyên gia du lịch địa phương tại Đà Lạt. Lên lịch trình 3 ngày 2 đêm tập trung vào các quán cà phê phong cách Retro và những cung đường săn mây ít người biết, khởi hành từ TP.HCM."
          </p>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">2. Quy trình 3 bước lên lịch trình "thần thánh"</h2>
        
        <h3 className="text-xl font-bold text-[#1a2b4b] mt-8 mb-4">Bước 1: Xác định khung xương hành trình</h3>
        <p className="mb-6 leading-relaxed text-slate-600">
          Đừng yêu cầu AI làm tất cả cùng lúc. Hãy bắt đầu bằng việc yêu cầu nó liệt kê các khu vực chính hoặc các thành phố bạn nên ghé thăm dựa trên số ngày nghỉ của bạn.
        </p>

        <div className="grid grid-cols-2 gap-4 my-8">
          <img alt="Planning" className="rounded-xl shadow-sm w-full aspect-video object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7eMS2qyVlKguf53pze6Zg33yvAJZsU5Yng7-lGB6cqmmDFHov8Knp9gFzXdVSZxY1MW1GQBSZB3vyPmhz4xy86XTiNJM7JqfV_KQ4gC9Zj8gBgCipC7i4pj6kLfg3XpjnNVuxjD6hh_5LjZe4hv9zSgOIz4gMpF2pIXsaawax-JRLJgN_q9qOWKUabe4bqnaM2ZqgQesztYuTBRPob3aQ_3-KdktxgHvZZwagHEwPr55bzmi937eA3EdH_rnhNEE74Fm6w3huMk8" />
          <img alt="Destination" className="rounded-xl shadow-sm w-full aspect-video object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDp0io3_Lu5JDIVipNvlljCbepxELPCd18l1NuEjb6wSs7uxNbzxw5fGxDFss2g83punlaqmTd5cT6RVeRJqrQ-rCKqJXF6vplJGiTpshZjxLBBNBk6HEwff_9IsU84O4fOcGGi3oUzpYIqMeQssitckkLun59NMAsA_Sd8t04HILX0mL4G3lP3UENYw6gtSBxmswZuitx49R52_F-at2_psuJVnEN9c6DMElFWdEvWXHzMusxqxD_olPZT8PA4kFBt7IGijiQM3k" />
        </div>

        <h3 className="text-xl font-bold text-[#1a2b4b] mt-8 mb-4">Bước 2: Tối ưu hóa di chuyển</h3>
        <p className="mb-6 leading-relaxed text-slate-600">
          AI có thể tính toán khoảng cách và đề xuất phương tiện di chuyển hợp lý nhất. Bạn có thể hỏi: "Khoảng cách giữa điểm A và điểm B là bao nhiêu? Có nên đi xe buýt hay gọi Grab để tiết kiệm thời gian?"
        </p>

        <h3 className="text-xl font-bold text-[#1a2b4b] mt-8 mb-4">Bước 3: Tinh chỉnh và Cá nhân hóa</h3>
        <p className="mb-10 leading-relaxed text-slate-600">
          Sau khi có bản thảo, hãy yêu cầu AI thay đổi các điểm đến dựa trên khẩu vị ẩm thực hoặc mức ngân sách cụ thể. "Thay thế các nhà hàng sang trọng bằng các quán ăn đường phố nổi tiếng được người bản địa yêu thích."
        </p>

        <div className="my-12 py-10 border-y border-slate-200 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-emerald-400 text-4xl mb-4">auto_awesome</span>
          <h4 className="text-xl font-bold text-[#031635] mb-2">Bạn đã sẵn sàng cho chuyến đi tự túc?</h4>
          <p className="text-slate-600 max-w-md mx-auto mb-6">Thử ngay công cụ AI Planner của SavoryTrip để nhận lịch trình chỉ trong 30 giây.</p>
          <button className="px-8 py-3 bg-[#1a2b4b] text-white rounded-lg font-bold hover:bg-[#031635] transition-all">Thử ngay miễn phí</button>
        </div>
      </>
    )
  },
  'review-pho-bat-da-ha-noi': {
    title: 'Review phở bát đá tại Hà Nội có gì đặc biệt?',
    date: '10/02/2026', readTime: '4 phút đọc', tag: 'Review nhà hàng', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-rOJLai4dObAw3bcqp9qGYU22KjHUMhoxuwFlR3Kj74zvrBKNwszRZZmxtPMUENT95Umi1XI89CDLoi5WFzma7dorLIaOo4TRAxXBavFwGiocqK9QocTrM3wM1p-oMxiJWE8JoMJPPoDotgrmWNBnuFvuwSVxhQZQFKlk6pv5MROCYKKbLlKsjxkwAHO2K_xk6u50ZYSXxETH3oGRtIBJQ0DHJ2NKaWWoCObn-UycCdG9vODSo9dFSojPK1HfvWR-YGa-erM0CKA',
    content: (
      <>
        <p className="text-xl font-medium italic text-slate-800 leading-relaxed border-l-4 border-emerald-400 pl-6 py-2 mb-10">
          Hà Nội vốn nổi tiếng với những bát phở truyền thống bốc khói nghi ngút. Thế nhưng gần đây, một trào lưu ẩm thực mới đã "gây bão" chính là phở bát đá. Liệu bát đá nóng hổi có thực sự thay đổi hương vị truyền thống hay chỉ là một chiêu trò marketing?
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">1. Trải nghiệm "tự phục vụ" độc đáo</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Khác với phở thông thường khi đầu bếp đã xếp sẵn bánh phở, thịt và chan nước dùng, phở bát đá mang đến cho thực khách một bàn tiệc thu nhỏ. Bát đá được đun nóng đến hơn 300 độ C, giữ cho nước dùng luôn sôi sùng sục ngay cả khi bạn đã thưởng thức đến những sợi bánh cuối cùng.
        </p>

        <div className="my-10 rounded-2xl overflow-hidden bg-slate-50 p-4 border border-slate-100">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzebUURbR5BIiYxuKD7X4Bd98_OLrgrD6OC7dE-3SNEmW2zSlJfhlhUzgqIekcIq9SwduQDiysBFFFnV2SqIFtAj8y0suW6ZsOJdMrq2qP4RPaaOiIN32y_xAdZ-2Q2b9q-GiwdL-EmSzHt0j6SgkVgtQKjo8dFfRrl16Bv3GxnZR71kSX84zd0LweJvotn9gWIkSStCzVeGJr0Y6Q0sYM8_hJVvslGdH0d12yfxSdxwDzUQNXwCkun6h2vmR8XFIvh6JeceTi7HA"
            alt="Nguyên liệu đầy đủ của một set phở bát đá"
            className="rounded-xl w-full object-cover mb-4 max-h-[500px]"
          />
          <p className="text-xs text-center text-slate-500 font-semibold uppercase tracking-wider">Nguyên liệu tươi ngon đi kèm bát đá nóng hổi</p>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">2. Hương vị nước dùng nguyên bản</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Nước dùng trong phở bát đá thường thanh hơn, không quá béo. Việc được nhúng từng miếng thịt bò tái vào nước dùng đang sôi giúp thịt giữ được độ ngọt tự nhiên nhất. Sợi phở cũng được để riêng, ăn đến đâu nhúng đến đó, tránh tình trạng bị nát hay quá mềm.
        </p>
        <h3 className="text-2xl font-bold text-[#1a2b4b] mt-8 mb-4">Bí mật nằm ở chiếc bát đá</h3>
        <p className="mb-8 leading-relaxed text-slate-600">
          Chiếc bát đá không chỉ có tác dụng thẩm mỹ. Nó đóng vai trò như một bộ lưu nhiệt, giúp hương thơm của gừng, hồi, quế được kích hoạt liên tục trong suốt quá trình ăn. Đây chính là điểm "ăn tiền" nhất mà phở bát sứ thông thường không thể làm được.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <img className="rounded-xl aspect-[4/3] object-cover" alt="Bát đá nóng" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0RZs9CoAM-5rRCX9hULtE4PZxbv8lcDnM-pL5nT7tTk6EOViVh7IVSEOht3gyXkaSnvWEhQNUUNYSpJRLs3MliAKDqB2rNymw1qhCbRUS8SzcaDxiDhmKEB5LrXYyYIoDLX2UgJIiSVUPOzGV3QGOyPpzosDvA9bsXgT9a1H0aebgrhZt1KSbRceH7MPQplk9QS6k1-QDLcQhf5vDMrW5hJsBmtoUm6CYbIX79ZH_cLp_awF2tJ0PrOqrVviG1MZLDNQRT1tFEfs" />
          <img className="rounded-xl aspect-[4/3] object-cover" alt="Nhúng thịt bò" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkR8qVHEEWFVgZ43CYoAFgxZ4z20Ansbb7SEHgFyxU0bkKF6U-56L0fvCUAMkrFfEpb9BbOMZWlG7YNTQrNinu134aKSwW4AZn_cL5BXRuuRnOGZ0xHoZZLKgbLTfV_q-XephVKqjb-rhfxopVO-Wcs4g4AMvP99VhpYUrH4YZjXUevoNRHgwpwBg6wtHQujvcgsLUUyXMOaWzbgiC_JLro_LOiYt08gWIkByZs0BL6xH_sMuJlZG1_i0lUb7BpoU8kg6owvFh0oY" />
        </div>

        <p className="mb-10 leading-relaxed text-slate-600">
          Tóm lại, phở bát đá không chỉ là món ăn, đó là một trải nghiệm về nhiệt độ và thời gian. Nếu bạn là một người yêu thích phở Hà Nội nhưng muốn tìm kiếm một cảm giác mới lạ, sang trọng hơn, phở bát đá chắc chắn là lựa chọn không thể bỏ qua.
        </p>
      </>
    )
  },
  'quan-cafe-rooftop-sai-gon': {
    title: 'Top 5 quán cà phê rooftop view cực chill tại Quận 1',
    date: '05/03/2026', readTime: '3 phút đọc', tag: 'Kinh nghiệm du lịch', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk0SdedSJlwjVmb1Xrk_JYXb0kfefoJu5WlZhQ3BupZTxCfayJ2SUBeFTfKMOhiXBK6k63tnupjyPqzPm907AGGgaZSvnuzcvXswFqgs3Ydl0epSLudTCW9SoRT_cNDSzBrqx-jEcjvV578Ek644irhNfp9U56tmmzEhWJ7UWPKurFfhqqYyZjVMUzPY4EuNBA3ro_tUjkEfpdJVghTziX5gNLugb5fsr5qiVlWgpKoZkdBt8AJZCdClmyMiKbIwF-8u1j8eJGKC0',
    content: (
      <>
        <p className="text-lg font-medium text-slate-800 italic border-l-4 border-cyan-200 pl-6 py-2 mb-10 leading-relaxed">
          Quận 1 luôn là tâm điểm của những trải nghiệm sang trọng và sôi động tại Sài Gòn. Nếu bạn đang tìm kiếm một không gian để ngắm nhìn thành phố từ trên cao, hãy cùng khám phá danh sách 5 quán cà phê rooftop ấn tượng nhất.
        </p>

        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#031635] flex items-center gap-3">
              <span className="text-slate-200 text-4xl">01</span>
              Blank Lounge — Landmark 81
            </h2>
            <p className="leading-relaxed text-slate-600">Tọa lạc tại tầng 75 và 76 của tòa nhà Landmark 81, Blank Lounge được mệnh danh là quán cà phê cao nhất Đông Nam Á. Từ đây, bạn có thể phóng tầm mắt bao trọn cả thành phố và dòng sông Sài Gòn thơ mộng.</p>
            <img className="w-full h-[400px] object-cover rounded-xl shadow-sm" alt="Blank Lounge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeI1vv7D71qo2hyCvjZCDhqyAyjElT_W_3OS61KgYANiXS_IO2XiPOO7XWkPGkOYbh8H5Eeh95yAQOoZSOO4h9-__dwIVq8H4m34A3YwrCtFFJqrmlkBTym2KqAszgwQHtgF_DMIw-MCaeMxvMjdnajd-0U9QoVXYK9LxBiuWeTrnG_pH_aNJtE41N4g42UyrIycccow-tkg0wf0xaei_CJenFYEfC9b17twCmJXUUjk2wBO_Hcm7-9QYnvqNPjl4WmOLYUawLG2Y" />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#031635] flex items-center gap-3">
              <span className="text-slate-200 text-4xl">02</span>
              Zion Sky Lounge &amp; Dining
            </h2>
            <p className="leading-relaxed text-slate-600">Zion mang đến một không gian hiện đại với hồ bơi vô cực và hệ thống âm thanh ánh sáng đẳng cấp. Đây là địa điểm lý tưởng cho những buổi hẹn hò lãng mạn hoặc tụ tập bạn bè vào dịp cuối tuần.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <img className="w-full h-[300px] object-cover rounded-xl" alt="Zion Sky Lounge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhq_oSh6qmIUoNYSL704F9vsAtTztDh-vNcVlImQI1aHVNI9DbD_C7wMPgbSPRXlLPjyTn7-p4wqhlyPEUc3admP8_mUPzOUT92fDgii67tcY0lObdYXe4mp_LguFFVTxwJto1YLuVrP80EO60raDuJiQaA76gAcdNgxPhtANLLjpi7PjPsyUFoWZfa28BQ4Kj2ni7atgEbIizRbvbR7kwBAru_SrlbihJfsXkWgbTxJGe6qFj92acvhXkkVi5Hv3rQJzhbUvjY" />
              <div className="bg-slate-50 p-8 rounded-xl flex flex-col justify-center border border-slate-100">
                <h4 className="font-bold text-[#031635] mb-4 text-center md:text-left">Đặc điểm nổi bật</h4>
                <ul className="text-sm space-y-3 list-none pl-0 text-slate-600">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>View 360 độ trung tâm Quận 1</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>Cocktail được pha chế thủ công</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>Nhạc Live vào tối thứ 6</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#031635] flex items-center gap-3">
              <span className="text-slate-200 text-4xl">03</span>
              Shri Restaurant &amp; Lounge
            </h2>
            <p className="leading-relaxed text-slate-600">Shri là một trong những nhà hàng rooftop lâu đời nhất tại Sài Gòn. Với không gian mở thoáng đãng, Shri mang lại cảm giác nhẹ nhàng, tách biệt khỏi sự ồn ào của phố thị bên dưới.</p>
            <img className="w-full h-[400px] object-cover rounded-xl shadow-sm" alt="Shri Restaurant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkjjw8_RQzFzM3eHNzGapwRDsE8Yv2FEbkQ4jczbyTTX0oJMmXdgb34KzUjhLQUhA4xdQtMMO0zFS6HyCeq85pMaVpdUbC3cY4bKuni8uFvWEUnD21Te9ytsPR7-uw-431NTofjR2sXWCNn5ABA4eVVyTyM_6ojUQ7t32Nc-WIlboNx8ZAtwAedGNMhe45AYKcwTvOxzrtuOcZchEKMtx3u8alhaY-YZ94F1JS9GsZh669mkg_5IEylcGKxu2HHMJ3IWx6PHFG6Xc" />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#031635] flex items-center gap-3">
              <span className="text-slate-200 text-4xl">04</span>
              Breeze Sky Bar
            </h2>
            <p className="leading-relaxed text-slate-600">Nằm trong khuôn viên khách sạn Majestic, Breeze Sky Bar mang đậm kiến trúc Pháp cổ điển. Nơi đây sở hữu góc nhìn tuyệt đẹp hướng ra bến Bạch Đằng, đặc biệt lung linh khi hoàng hôn buông xuống.</p>
            <img className="w-full h-[400px] object-cover rounded-xl shadow-sm" alt="Breeze Sky Bar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6lVPBBH-ttTXzIH1qzH_j7sM5dOHFJN1kYU1GqAz3Ebj_m1rNzr6KgTX6rM0cu6-Hh0vanmGBaEHMtTcXoNh5EPh8IxpABsVBm-svFocmvhYhqUxR0gtWb6Rfw7vaUYl6ttDr7F1KiGLT1ndUKaAV22EXlLff3b3Qkd118iyKgyY1mzxLL-OiSe3nx7VE8UExz1-lcjnFz8O_fQZrYBK1hUt5dj-wavuGk8h466G01UA6QUEm49hAq9U-l5n1mr4r8sqDYsV2kdo" />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#031635] flex items-center gap-3">
              <span className="text-slate-200 text-4xl">05</span>
              Social Club Rooftop Bar
            </h2>
            <p className="leading-relaxed text-slate-600">Một địa điểm sang trọng tại Hotel des Arts Saigon. Hồ bơi vô cực và quầy bar bằng gỗ tạo nên một tổng thể vô cùng "instagrammable" cho các tín đồ mê chụp ảnh.</p>
            <img className="w-full h-[400px] object-cover rounded-xl shadow-sm" alt="Social Club Rooftop Bar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkDiaTEaGavzsREikb_ILcve4yS46TI2oBP_XQxtgN6c54FDin6DG_9pmZeKK9hZ3vlM5iuEzAI1pwBN47ZFjuFaNQHg4v4F1mBiPX0Yv33zLoSimIq024z60O-nr0AmSKZ0-HsXUdGov4ZifuLN__Ur3MlSfvz4jxHOqlUy3RufkM_sAsFKaBKTbaC3IkDvtjycF2MQS-KRgpoVKyuCPRVPogXHN4-q6obmaqoFxmuYi_5Cq2-cP_F9WHZNJfFRaISluHgbf0yy0" />
          </div>
        </div>
      </>
    )
  },
  'bi-mat-cong-nghe-goi-y-mon-an': {
    title: 'Bí mật đằng sau công nghệ gợi ý món ăn của SavoryTrip',
    date: '20/03/2026', readTime: '6 phút đọc', tag: 'Bí kíp dùng AI', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
    content: (
      <>
        <p className="text-xl font-medium text-slate-600 leading-relaxed border-l-4 border-violet-200 pl-6 py-2 mb-10">
          Bạn đã bao giờ thắc mắc tại sao SavoryTrip luôn gợi ý chính xác món phở tái lăn béo ngậy vào một sáng mùa đông Hà Nội, hay một ly nước ép mát lạnh ngay khi bạn vừa check-in tại bãi biển Nha Trang? Đó không phải là ngẫu nhiên, mà là kết quả của một hệ thống trí tuệ nhân tạo (AI) được tinh chỉnh để thấu hiểu vị giác của con người.
        </p>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Thuật toán thấu hiểu vị giác cá nhân</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Hệ thống AI của chúng tôi sử dụng mô hình "Neural Taste Graph" — một mạng lưới thần kinh mô phỏng cách não bộ con người liên kết các tầng hương vị. Từ độ cay của ớt hiểm đến vị thanh nhẹ của thảo mộc, mỗi thành phần đều được mã hóa thành các điểm dữ liệu. Khi bạn tương tác với ứng dụng, AI sẽ âm thầm xây dựng một "Dấu vân tay vị giác" (Taste Fingerprint) duy nhất dành riêng cho bạn.
        </p>

        <div className="my-10 rounded-2xl overflow-hidden bg-slate-50 p-3">
          <img
            src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=1200"
            alt="AI phân tích dữ liệu vị giác"
            className="rounded-xl w-full aspect-video object-cover mb-3"
          />
          <p className="text-sm text-center text-slate-500 font-medium italic">Hình 1: Mô phỏng quy trình xử lý dữ liệu vị giác từ AI của SavoryTrip.</p>
        </div>

        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Dữ liệu khổng lồ từ cộng đồng</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Sức mạnh thật sự của SavoryTrip nằm ở hàng triệu đánh giá từ cộng đồng những người sành ăn. AI không chỉ đọc chữ, nó phân tích cảm xúc đằng sau từng câu chữ, hình ảnh để xác định độ tin cậy của một nhà hàng. Chúng tôi lọc bỏ những đánh giá ảo và ưu tiên những ý kiến từ những "Expert Foodies" có khẩu vị tương đồng với bạn.
        </p>

        <div className="my-10 p-6 bg-violet-50 border border-violet-100 rounded-2xl flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <p className="font-bold text-[#031635] mb-1">Bạn có biết?</p>
            <p className="text-slate-600 text-sm">AI của chúng tôi có khả năng dự đoán xu hướng ẩm thực sắp tới dựa trên các từ khóa tìm kiếm tăng vọt trong 24 giờ qua.</p>
          </div>
        </div>

        <p className="mb-10 leading-relaxed text-slate-600">
          Tương lai của ẩm thực không chỉ là ăn ngon, mà là ăn đúng. Với sự hỗ trợ từ công nghệ, SavoryTrip cam kết mang đến những trải nghiệm cá nhân hóa tuyệt đối, biến mỗi bữa ăn trở thành một cuộc hành trình khám phá vị giác đầy cảm hứng.
        </p>
      </>
    )
  },
  'am-thuc-mien-tay': {
    title: 'Hành trình khám phá ẩm thực miền Tây sông nước',
    date: '22/03/2026', readTime: '7 phút đọc', tag: 'Món ngon địa phương', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?q=80&w=1200',
    content: (
      <>
        {/* Đoạn dẫn nhập */}
        <p className="text-xl leading-relaxed font-medium mb-12 text-slate-600 italic border-l-4 border-emerald-200 pl-6">
          Miền Tây Nam Bộ không chỉ quyến rũ bởi cảnh sắc sông nước hữu tình mà còn bởi nền ẩm thực dân dã, tinh tế. Mỗi món ăn nơi đây đều mang trong mình hơi thở của phù sa và lòng hiếu khách của người dân bản địa.
        </p>

        {/* --- Món 1: Lẩu Mắm --- */}
        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Lẩu Mắm — Bản Giao Hưởng Của Hương Vị</h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          Nhắc đến ẩm thực miền Tây, không thể không nhắc đến lẩu mắm. Đây là món ăn hội tụ đầy đủ các loại đặc sản từ đồng ruộng đến sông ngòi. Nước lẩu được nấu từ mắm cá sặc hoặc mắm cá linh hảo hạng, mang vị đậm đà đặc trưng mà không nơi nào có được.
        </p>
        {/* Ảnh inline Lẩu Mắm */}
        <div className="my-10 rounded-2xl overflow-hidden bg-slate-50 p-3">
          <img
            src="https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1200"
            alt="Lẩu mắm miền Tây với rau sống tươi ngon"
            className="rounded-xl w-full aspect-video object-cover mb-3"
          />
          <p className="text-sm text-center text-slate-500 font-medium italic">Lẩu mắm — Tinh hoa ẩm thực sông nước Cửu Long</p>
        </div>

        {/* --- Món 2: Bánh Xèo Cao Lãnh --- */}
        <h2 className="text-3xl font-bold text-[#031635] mt-12 mb-6">Bánh Xèo Cao Lãnh — Giòn Rụm Vị Quê</h2>
        <p className="mb-6 leading-relaxed text-slate-600">
          Khác với bánh xèo miền Trung nhỏ nhắn, bánh xèo miền Tây to bản, vỏ mỏng tang và giòn rụm. Nhân bánh thường gồm thịt ba chỉ, tôm đất, đậu xanh và đặc biệt là củ hủ dừa ngọt lịm. Thưởng thức bánh xèo cùng với hơn 20 loại rau rừng là một trải nghiệm không thể quên.
        </p>
        <h3 className="text-xl font-semibold text-[#1a2b4b] mt-8 mb-4">Các loại rau ăn kèm đặc trưng</h3>
        <ul className="space-y-3 mb-10 text-slate-600">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Lá cách, lá lốt, đọt xoài</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Cải bẹ xanh, xà lách, húng quế</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Bông điên điển, bông súng</span>
          </li>
        </ul>

        {/* --- Món 3: Cá Tai Tượng (Card nổi bật) --- */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h2 className="text-2xl font-bold text-[#031635] mb-4 relative z-10">Cá Tai Tượng Chiên Xù</h2>
          <p className="relative z-10 leading-relaxed text-slate-600">
            Món cá tai tượng chiên xù là biểu tượng của các bữa tiệc miệt vườn. Cá được chiên nguyên vảy trong chảo dầu nóng cho đến khi vàng ươm, vảy cá dựng đứng giòn tan. Cuộn miếng cá vào bánh tráng cùng bún, rau sống và chấm nước mắm me chua ngọt thì thật tuyệt vời.
          </p>
        </div>

        {/* Đoạn kết */}
        <p className="mb-10 leading-relaxed text-slate-600">
          Hành trình ẩm thực miền Tây không chỉ dừng lại ở vị giác mà còn là cảm nhận về một lối sống phóng khoáng, tự tại của con người nơi đây. Mỗi bữa ăn là một câu chuyện kể về nguồn cội và tình yêu quê hương đất nước.
        </p>
      </>
    )
  }
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = mockData[id];

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi vào chi tiết bài viết
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Bài viết không tồn tại</h1>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Trở lại Trang Khám Phá
        </button>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 bg-[#fbf8fc]">
      <article className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          
          {/* Header Bìa */}
          <header className="mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-900 font-bold text-xs tracking-widest rounded-full mb-6 uppercase">
              {post.tag}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#031635] leading-tight mb-8">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-l-4 border-blue-200 pl-6">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Đăng ngày: {post.date}</span>
              </div>
            </div>
          </header>

          {/* Ảnh Nổi Bật hoặc Custom Header */}
          {post.customHeader ? (
             post.customHeader
          ) : (
            <div className="mb-16 rounded-3xl overflow-hidden bg-blue-50 aspect-[21/9] relative group">
              <img 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src={post.image}
              />
            </div>
          )}

          {/* Nội Dung HTML */}
          <div className="max-w-[800px] mx-auto prose prose-slate prose-lg">
            {post.content}
          </div>
        </div>

        {/* Cột Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-extrabold text-[#031635] mb-8 border-b border-slate-200 pb-4">Bài viết liên quan</h3>
            
            <div className="space-y-8">
              {Object.entries(mockData).filter(([key]) => key !== id).map(([key, relatedPost]) => (
                <Link to={`/blog/${key}`} key={key} className="group block cursor-pointer">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-2 block">{relatedPost.tag}</span>
                  <h4 className="font-bold text-[#031635] group-hover:text-blue-600 transition-colors line-clamp-2">{relatedPost.title}</h4>
                </Link>
              ))}
            </div>
          </section>

          {/* Khối Subscribe */}
          <section className="bg-[#031635] p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 italic">Góc Biên Tập</h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">Đăng ký nhận bản tin để cập nhật những bí mật du lịch và ẩm thực độc quyền mỗi tuần.</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  className="w-full bg-slate-800/50 border-none rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-3 transition-all" 
                  placeholder="Email của bạn" 
                  type="email"
                />
                <button className="w-full bg-white text-[#031635] font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">Đăng ký bản tin</button>
              </form>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          </section>

        </aside>
      </article>
    </main>
  );
};

export default BlogDetail;
