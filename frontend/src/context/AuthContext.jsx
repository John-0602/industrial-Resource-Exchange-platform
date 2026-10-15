import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resourceApi } from '../api/client';

const AuthContext = createContext(null);

const normalizeCompany = (c) => {
  if (!c) return null;
  const name = c.name || c.companyName || '';
  const ref = c.registrationRef || c.registrationNumber || '';
  return {
    id: c._id || c.id,
    _id: c._id || c.id,
    name,
    companyName: name,
    email: c.email || '',
    registrationRef: ref,
    registrationNumber: ref,
    industrySector: c.industrySector || '',
    contactPerson: c.contactPerson || '',
    address: c.address || '',
    city: c.city || '',
    state: c.state || '',
    country: c.country || 'India',
    phone: c.phone || '',
    description: c.description || '',
    companyRole: c.companyRole || 'both',
    verificationStatus: c.verificationStatus || 'Pending',
    role: c.role || 'company',
    createdAt: c.createdAt
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('irep_company_user');
      return stored ? normalizeCompany(JSON.parse(stored)) : null;
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
            const companyData = normalizeCompany(res.data.data);
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
      const normalized = normalizeCompany(receivedCompany);
      localStorage.setItem('irep_company_token', receivedToken);
      localStorage.setItem('irep_company_user', JSON.stringify(normalized));
      setToken(receivedToken);
      setUser(normalized);
      return normalized;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (companyData) => {
    const res = await resourceApi.post('/api/auth/register', companyData);
    if (res.data.success) {
      const { token: receivedToken, company: receivedCompany } = res.data.data;
      const normalized = normalizeCompany(receivedCompany);
      localStorage.setItem('irep_company_token', receivedToken);
      localStorage.setItem('irep_company_user', JSON.stringify(normalized));
      setToken(receivedToken);
      setUser(normalized);
      return normalized;
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
