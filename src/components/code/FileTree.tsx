/**
 * FileTree Component
 *
 * Displays a hierarchical file/folder structure.
 * Supports expandable folders and file type icons.
 * Uses paint daube icons for brand consistency.
 */

import { useEffect, useMemo } from 'react';
import { createStore } from 'zustand/vanilla';
import { organicBorderRadius } from '@/lib/organic-styles';
import { FileTreeContext, type FileTreeStore } from './FileTreeContext';
import { TreeNode } from './TreeNode';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  modified?: boolean;
  added?: boolean;
  deleted?: boolean;
}

interface FileTreeProps {
  /** Root nodes of the tree */
  data: FileNode[];
  /** Callback when a file is selected */
  onSelectFile?: (path: string) => void;
  /** Currently selected file path */
  selectedPath?: string;
  /** Initially expanded folders */
  defaultExpanded?: string[];
  /** Show file status indicators */
  showStatus?: boolean;
}

export function FileTree({
  data,
  onSelectFile,
  selectedPath,
  defaultExpanded = [],
  showStatus = true,
}: Readonly<FileTreeProps>) {
  const store = useMemo(
    () =>
      createStore<FileTreeStore>((set, get) => ({
        expandedPaths: new Set(defaultExpanded),
        selectedPath,
        onSelectFile,
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
        selectFile: (path) => {
          set({ selectedPath: path });
          get().onSelectFile?.(path);
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Sync props to store
  useEffect(() => {
    store.setState({ selectedPath });
  }, [selectedPath, store]);

  useEffect(() => {
    store.setState({ onSelectFile });
  }, [onSelectFile, store]);

  // Sort nodes: folders first, then alphabetically
  const sortedData = useMemo(() => {
    const sortNodes = (nodes: FileNode[]): FileNode[] => {
      return [...nodes]
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
        .map((node) => ({
          ...node,
          children: node.children ? sortNodes(node.children) : undefined,
        }));
    };
    return sortNodes(data);
  }, [data]);

  return (
    <FileTreeContext.Provider value={store}>
      <ul
        aria-label="File tree"
        className="bg-surface overflow-hidden list-none p-0 m-0"
        style={organicBorderRadius.card}
      >
        {sortedData.map((node) => (
          <TreeNode key={node.path} node={node} depth={0} showStatus={showStatus} />
        ))}
      </ul>
    </FileTreeContext.Provider>
  );
}
