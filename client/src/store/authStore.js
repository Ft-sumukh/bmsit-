import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isInitialized: false,

  // Computed helper
  isAuthenticated: () => !!get().token && !!get().user,

  // Register user
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Login user
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  // Logout user
  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout cleanup warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false, error: null });
    }
  },

  // Restore session on page refresh
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isInitialized: true, user: null, token: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, token, loading: false, isInitialized: true });
    } catch (err) {
      console.warn('Restore session failed:', err.message);
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false, isInitialized: true });
    }
  }
}));

// Listen to interceptor logout requests (refresh token expiry)
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useAuthStore.getState().logout();
  });
}
