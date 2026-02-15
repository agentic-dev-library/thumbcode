import { createContext } from 'react';
import { createStore } from 'zustand/vanilla';

export interface FileTreeState {
  expandedPaths: Set<string>;
  selectedPath?: string;
}

export interface FileTreeActions {
  toggleExpanded: (path: string) => void;
  setSelectedPath: (path?: string) => void;
  setExpandedPaths: (paths: Set<string>) => void;
}

export type FileTreeStore = ReturnType<typeof createFileTreeStore>;

export const createFileTreeStore = (initialProps: Partial<FileTreeState> = {}) => {
  return createStore<FileTreeState & FileTreeActions>((set) => ({
    expandedPaths: initialProps.expandedPaths ?? new Set(),
    selectedPath: initialProps.selectedPath,
    toggleExpanded: (path) =>
      set((state) => {
        const next = new Set(state.expandedPaths);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return { expandedPaths: next };
      }),
    setSelectedPath: (path) => set({ selectedPath: path }),
    setExpandedPaths: (paths) => set({ expandedPaths: paths }),
  }));
};

export const FileTreeContext = createContext<{
  store: FileTreeStore;
  onSelectFile?: (path: string) => void;
  showStatus?: boolean;
} | null>(null);
