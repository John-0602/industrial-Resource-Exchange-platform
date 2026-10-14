import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resourceApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('irep_company_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('irep_company_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('irep_company_token');
    localStorage.removeItem('irep_company_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('irep_company_token');
      if (storedToken) {
        try {
          const res = await resourceApi.get('/api/auth/me');
          if (res.data.success) {
            const companyData = {
              id: res.data.data._id || res.data.data.id,
              name: res.data.data.name,
              email: res.data.data.email,
              registrationRef: res.data.data.registrationRef,
              industrySector: res.data.data.industrySector,
              contactPerson: res.data.data.contactPerson,
              city: res.data.data.city,
              state: res.data.data.state,
              companyRole: res.data.data.companyRole,
              verificationStatus: res.data.data.verificationStatus,
              role: res.data.data.role,
              createdAt: res.data.data.createdAt
            };
            setUser(companyData);
            localStorage.setItem('irep_company_user', JSON.stringify(companyData));
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
      const { token: receivedToken, company: receivedCompany } = res.data.data;
      localStorage.setItem('irep_company_token', receivedToken);
      localStorage.setItem('irep_company_user', JSON.stringify(receivedCompany));
      setToken(receivedToken);
      setUser(receivedCompany);
      return receivedCompany;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (companyData) => {
    const res = await resourceApi.post('/api/auth/register', companyData);
    if (res.data.success) {
      const { token: receivedToken, company: receivedCompany } = res.data.data;
      localStorage.setItem('irep_company_token', receivedToken);
      localStorage.setItem('irep_company_user', JSON.stringify(receivedCompany));
      setToken(receivedToken);
      setUser(receivedCompany);
      return receivedCompany;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company: user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
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
