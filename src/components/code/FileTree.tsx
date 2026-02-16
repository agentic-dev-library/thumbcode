/**
 * FileTree Component
 *
 * Displays a hierarchical file/folder structure.
 * Supports expandable folders and file type icons.
 * Uses paint daube icons for brand consistency.
 */

import { useEffect, useMemo } from 'react';
import { organicBorderRadius } from '@/lib/organic-styles';
import { createFileTreeStore, FileTreeContext } from './FileTreeContext';
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
  // Create a singleton store instance for this component.
  // We intentionally ignore dependency updates because:
  // 1. defaultExpanded is only used for initialization
  // 2. selectedPath updates are synced via useEffect
  // biome-ignore lint/correctness/useExhaustiveDependencies: Store should be stable
  const store = useMemo(
    () =>
      createFileTreeStore({
        expandedPaths: new Set(defaultExpanded),
        selectedPath,
      }),
    []
  );

  useEffect(() => {
    store.getState().setSelectedPath(selectedPath);
  }, [selectedPath, store]);

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
        .map((node) => {
          if (node.children?.length) {
            return {
              ...node,
              children: sortNodes(node.children),
            };
          }
          return node;
        });
    };
    return sortNodes(data);
  }, [data]);

  const contextValue = useMemo(
    () => ({ store, onSelectFile, showStatus }),
    [onSelectFile, showStatus]
  );

  return (
    <FileTreeContext.Provider value={contextValue}>
      <ul
        aria-label="File tree"
        className="bg-surface overflow-hidden list-none p-0 m-0"
        style={organicBorderRadius.card}
      >
        {sortedData.map((node) => (
          <TreeNode key={node.path} node={node} depth={0} />
        ))}
      </ul>
    </FileTreeContext.Provider>
  );
}
