/**
 * MainLayout - Layout chính dành cho các trang công khai và trang người dùng.
 *
 * Cấu trúc:
 *   ┌─────────────────────────────┐
 *   │ <Navbar />  (Sticky trên đầu) │
 *   ├─────────────────────────────┤
 *   │ <Outlet />  (Nội dung trang)  │
 *   ├─────────────────────────────┤
 *   │ <Footer />  (Cuối trang)      │
 *   └─────────────────────────────┘
 *   <AIChatWidget /> (Nổi ở góc phải dưới - Fixed)
 *
 * Dùng cho: Landing, Explore, Blog, About, Contact, Legal, Profile, Planner...
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AIChatWidget from '@/components/widgets/AIChatWidget';

function MainLayout() {
  return (
    // Wrapper toàn trang - flex column để Footer luôn xuống dưới cùng
    <div className="flex flex-col min-h-screen bg-neutral-50">

      {/* Navbar cố định phía trên - sticky để không biến mất khi cuộn */}
      <Navbar />

      {/* Khu vực nội dung chính - flex-grow để chiếm hết phần còn lại */}
      <main className="flex-grow">
        {/* <Outlet /> là nơi React Router render trang con tương ứng với URL */}
        <Outlet />
      </main>

      {/* Footer luôn nằm dưới cùng trang */}
      <Footer />

      {/* Widget Chat AI nổi góc dưới phải - hiển thị trên mọi trang Main */}
      <AIChatWidget />

    </div>
  );
}

export default MainLayout;
