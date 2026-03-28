import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  savedRecipes: string[];
  role: 'user' | 'admin';
  preferences: {
    dietType: string;
    cuisines: string[];
    darkMode: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      updateUser: (data) => set(state => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'quickmake-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
