import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Determine the correct login page based on the stored user's role
      const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
      })();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const loginPath = user?.role === 'DOCTOR' ? '/doctor/login' : '/login';
      window.location.href = loginPath;
    }
    return Promise.reject(err);
  }
);

export default api;
