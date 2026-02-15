import { createContext, useContext } from 'react';
import { useStore, type StoreApi } from 'zustand';

interface FileTreeState {
  expandedPaths: Set<string>;
  selectedPath?: string;
  onSelectFile?: (path: string) => void;
}

interface FileTreeActions {
  toggleExpanded: (path: string) => void;
  selectFile: (path: string) => void;
}

export type FileTreeStore = FileTreeState & FileTreeActions;

export const FileTreeContext = createContext<StoreApi<FileTreeStore> | null>(null);

export function useFileTreeStore<T>(selector: (state: FileTreeStore) => T): T {
  const store = useContext(FileTreeContext);
  if (!store) {
    throw new Error('useFileTreeStore must be used within a FileTreeContext.Provider');
  }
  return useStore(store, selector);
}
