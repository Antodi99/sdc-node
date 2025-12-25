import axios from 'axios';
import router from '../router';
import { useAuth } from '../composables/useAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const { token, isAuthenticated } = useAuth();

  if (isAuthenticated.value && token.value) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { logout } = useAuth();
      logout();
      router.push('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
