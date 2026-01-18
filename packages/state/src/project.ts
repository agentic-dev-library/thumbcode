import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ProjectState {
  repo: string | null;
  branch: string | null;
  fileTree: any[] | null; // Replace 'any' with a proper type for your file tree
  setRepo: (repo: string) => void;
  setBranch: (branch: string) => void;
  setFileTree: (fileTree: any[]) => void; // Replace 'any' with a proper type for your file tree
}

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set) => ({
      repo: null,
      branch: null,
      fileTree: null,
      setRepo: (repo) =>
        set((state) => {
          state.repo = repo;
        }),
      setBranch: (branch) =>
        set((state) => {
          state.branch = branch;
        }),
      setFileTree: (fileTree) =>
        set((state) => {
          state.fileTree = fileTree;
        }),
    })),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
