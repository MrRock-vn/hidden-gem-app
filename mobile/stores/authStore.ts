import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI, usersAPI } from '../services/api';
import { socketService } from '../services/socket';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  is_private: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  googleAuth: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.login({ email, password });

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.register({ username, email, password });

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  googleAuth: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.googleAuth(token);

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google đăng nhập thất bại';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    socketService.disconnect();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // Token exists, fetch user profile
      try {
        const { data } = await usersAPI.getMe();
        if (data) {
          set({ user: data, isAuthenticated: true, isLoading: false });
          socketService.connect();
        } else {
          set({ isAuthenticated: true, isLoading: false });
        }
      } catch (apiError: any) {
        // If token is invalid, clear it and treat as not authenticated
        if (apiError.response?.status === 401 || apiError.response?.status === 400) {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          socketService.disconnect();
          set({ isLoading: false });
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user: User) => set({ user }),
}));
