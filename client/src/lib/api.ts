import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['x-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle global errors, e.g., redirect to login on 401
    if (error.response?.status === 401) {
      // Session expired, redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
