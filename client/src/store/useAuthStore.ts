import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  plan?: string;
  subscriptionStatus?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/profile');
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
}));
