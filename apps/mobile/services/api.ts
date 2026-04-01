import axios from 'axios';
import { API_URL } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Import dynamically to avoid circular dependency
      const { useAuthStore } = await import('@/stores/authStore');
      const store = useAuthStore.getState();

      try {
        await store.refreshTokens();
        
        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${store.tokens?.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        await store.logout();
        return Promise.reject(refreshError);
      }
    }

    // Extract error message
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
