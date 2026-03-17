import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { X } from 'lucide-react';
import AppRoutes from './routes/AppRoutes';

/**
 * Root component của ứng dụng SavoryTrip.
 * Bọc tầng Router để cung cấp context điều hướng cho toàn bộ app.
 */
function App() {
  return (
    <Router>
      <AppRoutes />
      {/* Toast notifications toàn cục - hiển thị ở góc phải trên với kích thước lớn và nút đóng */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '16px',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '450px',
            background: '#fff',
            color: '#1e293b',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: { primary: '#2563eb', secondary: '#fff' },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                <div className="flex-1 px-1">{message}</div>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </Router>
  );
}

export default App;
