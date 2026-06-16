import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // We are using httpOnly cookies, but if we were using localStorage:
  // const token = localStorage.getItem('accessToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle global errors, e.g., redirect to login on 401
    if (error.response?.status === 401) {
      // Implement token refresh logic or redirect
    }
    return Promise.reject(error);
  }
);

export default api;
