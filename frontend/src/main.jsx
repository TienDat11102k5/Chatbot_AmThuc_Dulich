import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

/**
 * Điểm khởi đầu của ứng dụng React.
 * Sử dụng React 18 createRoot API.
 */
const container = document.getElementById('root');
const root = createRoot(container);

// Fallback client ID nếu build time không nhận được biến môi trường VITE_GOOGLE_CLIENT_ID
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "725608355243-e3agptrmu79ga8fo092trsedsoqlatoj.apps.googleusercontent.com";

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
