import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

/**
 * Root component của ứng dụng SavoryTrip.
 * Bọc tầng Router để cung cấp context điều hướng cho toàn bộ app.
 */
function App() {
  return (
    <Router>
      <AppRoutes />
      {/* Toast notifications toàn cục - hiển thị ở góc phải trên */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        }}
      />
    </Router>
  );
}

export default App;
