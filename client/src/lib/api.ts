import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
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
    // Do not redirect if the request was to check auth status
    if (error.response?.status === 401 && error.config?.url !== '/auth/profile') {
      const publicPaths = ['/login', '/register', '/'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/form/');
      
      if (!isPublicPath) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
