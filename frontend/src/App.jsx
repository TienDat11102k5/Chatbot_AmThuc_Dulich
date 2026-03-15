import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

/**
 * Root component của ứng dụng SavoryTrip.
 * Bọc tầng Router để cung cấp context điều hướng cho toàn bộ app.
 */
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
