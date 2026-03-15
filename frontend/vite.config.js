// Tệp cấu hình Vite - công cụ build frontend nhanh chóng và hiện đại
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Plugin xử lý JSX và Hot Module Replacement (tự động reload khi sửa code)
    react(),
    // Plugin tích hợp Tailwind CSS v4 trực tiếp vào pipeline Vite
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // Định nghĩa alias '@' trỏ đến thư mục 'src'
      // Cho phép import ngắn gọn: '@/components/...' thay vì '../../components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    // Cổng mặc định cho môi trường phát triển cục bộ
    port: 3000,
    // Tự động mở trình duyệt khi khởi động server
    open: true,
    // Cấu hình proxy API để tránh lỗi CORS khi gọi Backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Thư mục đầu ra khi build production
    outDir: 'dist',
  },
});
