import axios from 'axios';

const RESOURCE_SERVICE_BASE = import.meta.env.VITE_RESOURCE_SERVICE_URL || 'http://localhost:5001';
const EXCHANGE_SERVICE_BASE = import.meta.env.VITE_EXCHANGE_SERVICE_URL || 'http://localhost:5002';

export const resourceApi = axios.create({
  baseURL: RESOURCE_SERVICE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const exchangeApi = axios.create({
  baseURL: EXCHANGE_SERVICE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
const attachAuthToken = (config) => {
  const token = localStorage.getItem('resource_exchange_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

resourceApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
exchangeApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Response interceptor to catch unauthorized / expired tokens
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    console.warn('[API Client] Unauthorized or expired session detected.');
    // Only clear if on authenticated action
    if (localStorage.getItem('resource_exchange_token')) {
      localStorage.removeItem('resource_exchange_token');
      localStorage.removeItem('resource_exchange_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  }
  return Promise.reject(error);
};

resourceApi.interceptors.response.use((response) => response, handleAuthError);
exchangeApi.interceptors.response.use((response) => response, handleAuthError);
