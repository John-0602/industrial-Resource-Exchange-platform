import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resourceApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('resource_exchange_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('resource_exchange_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('resource_exchange_token');
    localStorage.removeItem('resource_exchange_user');
    setToken(null);
    setUser(null);
  }, []);

  // Sync session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('resource_exchange_token');
      if (storedToken) {
        try {
          const res = await resourceApi.get('/api/auth/me');
          if (res.data.success) {
            const userData = {
              id: res.data.data._id || res.data.data.id,
              name: res.data.data.name,
              email: res.data.data.email,
              collegeName: res.data.data.collegeName,
              department: res.data.data.department,
              profileImage: res.data.data.profileImage,
              createdAt: res.data.data.createdAt
            };
            setUser(userData);
            localStorage.setItem('resource_exchange_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid on startup');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleExternalLogout = () => logout();
    window.addEventListener('auth:logout', handleExternalLogout);
    return () => window.removeEventListener('auth:logout', handleExternalLogout);
  }, [logout]);

  const login = async (email, password) => {
    const res = await resourceApi.post('/api/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      localStorage.setItem('resource_exchange_token', receivedToken);
      localStorage.setItem('resource_exchange_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await resourceApi.post('/api/auth/register', userData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      localStorage.setItem('resource_exchange_token', receivedToken);
      localStorage.setItem('resource_exchange_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
