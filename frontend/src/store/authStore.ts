// ============================================================
// store/authStore.ts - Global authentication state with Zustand
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  /** The currently authenticated user, or null if not logged in */
  user: User | null;
  /** JWT access token */
  token: string | null;
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  /** Authentication action handlers */
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

/**
 * Global auth store powered by Zustand with localStorage persistence.
 * The 'persist' middleware automatically saves/restores token and user
 * across page reloads.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      /** Authenticate with email + password, persist token and user */
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          if (res.success && res.data) {
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            set({ user, token, isLoading: false });
          }
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /** Register a new account, then log in automatically */
      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(email, password, name);
          if (res.success && res.data) {
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            set({ user, token, isLoading: false });
          }
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /** Clear all auth state and redirect to login */
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      /** Update the user object (e.g. after fetching fresh profile data) */
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
