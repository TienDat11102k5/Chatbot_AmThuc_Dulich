/**
 * useAuth.js — Custom React Hook quản lý trạng thái đăng nhập.
 *
 * Hook này là "nguồn sự thật duy nhất" cho trạng thái xác thực.
 */
import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY } from '../lib/api';

export default function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        setUser(data ? JSON.parse(data) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = useCallback((userData) => {
    // Debugging auth flow
    if (!userData || !userData.token) {
      console.warn('[useAuth] Login called but userData is missing or has no token!', userData);
    } else {
      console.log('[useAuth] Login called with valid token.');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('authChange'));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
  }, []);

  // Nếu state bị desync, dự phòng đọc trực tiếp
  let finalUser = user;
  if (!finalUser) {
    try {
      const ls = localStorage.getItem(STORAGE_KEY);
      if (ls) finalUser = JSON.parse(ls);
    } catch(e) {}
  }

  // Chắc chắn rà soát xem token có tồn tại ở bất kỳ cấp độ nào không 
  // (phòng trường hợp backend bọc object)
  let exactToken = finalUser?.token;
  if (!exactToken && finalUser?.data?.token) {
    exactToken = finalUser.data.token;
  }

  return {
    user: finalUser,
    token: exactToken || null,
    userId: finalUser?.userId || finalUser?.data?.userId || null,
    role: finalUser?.role || finalUser?.data?.role || null,
    isAuthenticated: !!exactToken,
    login,
    logout,
  };
}

