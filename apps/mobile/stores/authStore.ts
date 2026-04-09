import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, AuthTokens, Role } from '@/utils/shared';
import { authService } from '@/services/auth.service';
import { api } from '@/services/api';

// Fallback storage for web/unsupported platforms
let memoryStorage: Record<string, string> = {};

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return memoryStorage[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      // SecureStore not available, fall back to memory
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        memoryStorage[key] = value;
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // SecureStore not available, fall back to memory
      memoryStorage[key] = value;
    }
  },
  deleteItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        delete memoryStorage[key];
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // SecureStore not available, fall back to memory
      delete memoryStorage[key];
    }
  },
};

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (data: {
    email: string;
    password: string;
    fullName: string;
    studentId: string;
    institutionCode: string;
  }) => Promise<void>;
  registerExternal: (data: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const tokensJson = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);

      if (tokensJson && userJson) {
        const tokens = JSON.parse(tokensJson) as AuthTokens;
        const user = JSON.parse(userJson) as User;

        // Set tokens for API
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

        set({
          tokens,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Try to refresh tokens in background
        get().refreshTokens().catch(() => {
          // If refresh fails, logout
          get().logout();
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      // Auth initialization failed, user will need to log in again
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(response.tokens));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

    api.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.accessToken}`;

    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  registerStudent: async (data) => {
    const response = await authService.registerStudent(data);
    
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(response.tokens));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

    api.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.accessToken}`;

    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  registerExternal: async (data) => {
    const response = await authService.registerExternal(data);
    
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(response.tokens));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

    api.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.accessToken}`;

    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    const { tokens } = get();
    
    try {
      if (tokens?.refreshToken) {
        await authService.logout(tokens.refreshToken);
      }
    } catch (error) {
      // Ignore logout errors
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    delete api.defaults.headers.common['Authorization'];

    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  },

  refreshTokens: async () => {
    const { tokens } = get();
    
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await authService.refresh(tokens.refreshToken);
    
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(response.tokens));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

    api.defaults.headers.common['Authorization'] = `Bearer ${response.tokens.accessToken}`;

    set({
      user: response.user,
      tokens: response.tokens,
    });
  },
}));
