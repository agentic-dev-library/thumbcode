/**
 * FileTree Component
 *
 * Displays a hierarchical file/folder structure.
 * Supports expandable folders and file type icons.
 * Uses paint daube icons for brand consistency.
 */

import { useMemo, useState } from 'react';
import { organicBorderRadius } from '@/lib/organic-styles';
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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(defaultExpanded));

  const toggleExpanded = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

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

  return (
    <ul
      aria-label="File tree"
      className="bg-surface overflow-hidden list-none p-0 m-0"
      style={organicBorderRadius.card}
    >
      {sortedData.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          toggleExpanded={toggleExpanded}
          showStatus={showStatus}
        />
      ))}
    </ul>
  );
}
