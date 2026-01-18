import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  githubToken: string | null;
  user: {
    login: string;
    avatar_url: string;
    name: string;
  } | null;
  setGithubToken: (token: string) => void;
  setUser: (user: UserState['user']) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      githubToken: null,
      user: null,
      setGithubToken: (token) =>
        set((state) => {
          state.githubToken = token;
        }),
      setUser: (user) =>
        set((state) => {
          state.user = user;
        }),
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
