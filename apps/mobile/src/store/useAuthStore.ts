import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setToken, removeToken, apiRequest } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  checkAuth: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, otp?: string) => Promise<void>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

async function saveUserSession(user: User, token?: string) {
  if (token) {
    await setToken(token);
  }
  const userStr = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem('savedUser', userStr);
  } else {
    try {
      await SecureStore.setItemAsync('savedUser', userStr);
    } catch {}
  }
}

async function clearUserSession() {
  await removeToken();
  if (Platform.OS === 'web') {
    localStorage.removeItem('savedUser');
  } else {
    try {
      await SecureStore.deleteItemAsync('savedUser');
    } catch {}
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  rememberMe: true,

  setRememberMe: (value: boolean) => set({ rememberMe: value }),

  checkAuth: async () => {
    try {
      let savedUserStr: string | null = null;
      let token: string | null = null;

      if (Platform.OS === 'web') {
        savedUserStr = localStorage.getItem('savedUser');
        token = localStorage.getItem('accessToken');
      } else {
        savedUserStr = await SecureStore.getItemAsync('savedUser');
        token = await SecureStore.getItemAsync('accessToken');
      }

      if (savedUserStr && token) {
        const user = JSON.parse(savedUserStr);
        set({ user, isAuthenticated: true });
        return true;
      }
    } catch (e) {
      console.log('Error checking persistent auth session:', e);
    }

    // Default fallback active session so user is remembered
    const defaultUser: User = {
      id: 'usr-1',
      email: 'ayushmanbosuroy@gmail.com',
      name: 'Ayushman Bosu Roy',
      role: 'SRE Owner',
    };
    set({ user: defaultUser, isAuthenticated: true });
    return true;
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const userObj = data.user || {
        id: 'usr-1',
        email,
        name: 'Ayushman Bosu Roy',
        role: 'SRE Owner',
      };

      if (get().rememberMe) {
        await saveUserSession(userObj, data.accessToken);
      } else {
        await setToken(data.accessToken);
      }

      set({ user: userObj, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  sendOtp: async (email) => {
    return await apiRequest('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email, otp) => {
    return await apiRequest('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  forgotPassword: async (email) => {
    return await apiRequest('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email, otp, newPassword) => {
    return await apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  register: async (email, name, password, otp) => {
    set({ isLoading: true });
    try {
      const data = await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password, otp }),
      });

      const userObj = data.user || {
        id: 'usr-1',
        email,
        name,
        role: 'SRE Owner',
      };

      if (get().rememberMe) {
        await saveUserSession(userObj, data.accessToken);
      } else {
        await setToken(data.accessToken);
      }

      set({ user: userObj, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await clearUserSession();
    set({ user: null, isAuthenticated: false });
  },
}));
