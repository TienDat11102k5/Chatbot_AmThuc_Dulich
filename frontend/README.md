# 🌐 Giao Diện Frontend (React App)

Cấu trúc Feature-Based này là trái tim của giao diện người dùng - nơi quyết định đánh giá UX/UI của sản phẩm "Website Chatbot Tư vấn Du lịch và Ẩm Thực".

## 📂 Kiến Trúc Thư Mục Feature-Based

Nền tảng: **React/Next.js (Vite)** + **TailwindCSS** + **Zustand** + **React Query**

```text
src/
├── assets/              # Thư mục cho ảnh nền, icon tĩnh (logo.png) và stylesheet chung (index.css)
├── components/          # Giao diện 'Ngu' (Dumb Components) tái sử dụng: `Button/`, `Modal/`, `Input/`, `Spinner/`
├── features/            # [LÕI KIẾN TRÚC] Chứa toàn bộ các tính năng lớn 'Thông Minh' (Smart Components)
│   ├── chat/            # Toàn bộ logic chát: `ChatBox.jsx`, `MessageList.jsx`, `api.js` (gọi AI qua Backend), `store.js`
│   ├── tour/            # Nơi hiển thị các thẻ Bài viết du lịch/địa điểm, chức năng tìm kiếm
│   └── culinary/        # Nơi liệt kê danh mục Ẩm Thực, các bài viết món ăn
├── hooks/               # Các hook tiện ích toàn hệ thống: `useAuth.js`, `useDebounce.js`
├── layouts/             # Khung trang chính: `HomeLayout.jsx` (chứa Header, Footer), `AuthLayout.jsx`
├── lib/                 # Tiện ích liên kết thư viện ngoài: `axios_client.js`, `queryClient.js`
├── pages/               # Tích hợp Features và Layouts lại thành trang: `HomePage.jsx`, `ChatPage.jsx`, `LoginPage.jsx`
├── routes/              # Các đường dẫn: `AppRouter.jsx` dùng react-router-dom
├── store/               # Zustand lưu trạng thái chung (Global state): `authStore.js`
├── types/               # (Nếu có xài TS) Định nghĩa PropTypes hoặc Interface TS
├── App.jsx              # Tầng gốc khởi tạo React Router & Provider
└── main.jsx             # Render Virtual DOM gốc
```

## 📝 Định hướng UI/UX Đồ Án

- **Giao diện chát (Feature Chat):** Cần làm hiệu ứng "AI đang gõ" (`Typing Indicator`) và hỗ trợ in đậm tiêu đề (Markdown) như ChatGPT.
- **Tách biệt State:**
    * Dùng **React Query** (thư viện ngoài) khi Fetch API (lấy địa điểm, lịch sử chat) thay vì useEffect thuần để tận dụng cache và chặn loading rườm rà.
    * Dùng **Zustand** (trong `store/`) chỉ để xử lý việc "bật/tắt Dark Mode", "Đã Login thành công chưa".

> Ghi chú Git: Các file gốc chưa có dữ liệu sẽ được giữ lại trên cấu trúc của Github bằng file rỗng `.gitkeep` thay vì hiển thị trống trải.
