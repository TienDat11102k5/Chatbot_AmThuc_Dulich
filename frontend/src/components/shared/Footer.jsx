/**
 * Footer - Chân trang của website SavoryTrip.
 *
 * Chứa các nhóm thông tin:
 *   - Cột 1: Giới thiệu thương hiệu và mạng xã hội.
 *   - Cột 2: Liên kết Khám phá (tính năng chính).
 *   - Cột 3: Liên kết Công ty (About, Contact).
 *   - Cột 4: Liên kết Pháp lý (Terms, Privacy) - KHÔNG đặt ở Header.
 *
 * Lưu ý:
 *   - Responsive: 1 cột trên Mobile, 2 cột trên Tablet, 4 cột trên Desktop.
 *   - Copyright tự động lấy năm hiện tại.
 */
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  // Lấy năm hiện tại để hiển thị trong Copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Grid 4 cột cho Desktop, 2 cột cho Tablet, 1 cột cho Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* ========== CỘT 1: Thương hiệu ========== */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="text-white font-bold text-xl tracking-tight">
              SavoryTrip
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Khám phá ẩm thực và lên kế hoạch du lịch thông minh với sự hỗ trợ của AI. Hơn 10.000 địa điểm trên khắp Việt Nam.
            </p>
          </div>

          {/* ========== CỘT 2: Khám phá ========== */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Khám phá
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/explore" className="text-sm hover:text-white transition-colors duration-150">
                  Địa điểm ăn uống
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-white transition-colors duration-150">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-white transition-colors duration-150">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* ========== CỘT 3: Công ty ========== */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Công ty
            </h3>
            <ul className="space-y-2.5">

              <li>
                <Link to="/contact" className="text-sm hover:text-white transition-colors duration-150">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* ========== CỘT 4: Pháp lý ========== */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Pháp lý
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terms" className="text-sm hover:text-white transition-colors duration-150">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white transition-colors duration-150">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Đường kẻ phân tách */}
        <div className="border-t border-neutral-800 pt-6">
          <p className="text-xs text-center text-neutral-600">
            © {currentYear} SavoryTrip. Đã đăng ký bản quyền.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
