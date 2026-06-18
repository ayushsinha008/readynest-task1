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
    // Let individual components handle 401 errors
    return Promise.reject(error);
  }
);

export default api;
