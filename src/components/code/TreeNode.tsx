/**
 * TreeNode Component
 *
 * Renders a single node (file or folder) in the FileTree,
 * including the icon, label, status indicator, and recursive children.
 */

import type React from 'react';
import { memo, useContext } from 'react';
import { useStore } from 'zustand';
import {
  ChevronDownIcon,
  FileCodeIcon,
  FileConfigIcon,
  FileDataIcon,
  FileDocIcon,
  FileIcon,
  FileMediaIcon,
  FileStyleIcon,
  FileWebIcon,
  FolderIcon,
  FolderOpenIcon,
  type IconColor,
} from '@/components/icons';
import { Text } from '@/components/ui';
import type { FileNode } from './FileTree';
import { FileTreeContext } from './FileTreeContext';

type FileIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface FileIconInfo {
  Icon: FileIconComponent;
  color: IconColor;
}

function getFileIconInfo(name: string): FileIconInfo {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, FileIconInfo> = {
    ts: { Icon: FileCodeIcon, color: 'teal' },
    tsx: { Icon: FileCodeIcon, color: 'teal' },
    js: { Icon: FileCodeIcon, color: 'gold' },
    jsx: { Icon: FileCodeIcon, color: 'gold' },
    json: { Icon: FileDataIcon, color: 'gold' },
    md: { Icon: FileDocIcon, color: 'warmGray' },
    css: { Icon: FileStyleIcon, color: 'coral' },
    scss: { Icon: FileStyleIcon, color: 'coral' },
    html: { Icon: FileWebIcon, color: 'teal' },
    png: { Icon: FileMediaIcon, color: 'coral' },
    jpg: { Icon: FileMediaIcon, color: 'coral' },
    jpeg: { Icon: FileMediaIcon, color: 'coral' },
    svg: { Icon: FileMediaIcon, color: 'coral' },
    gif: { Icon: FileMediaIcon, color: 'coral' },
    git: { Icon: FileConfigIcon, color: 'warmGray' },
    env: { Icon: FileConfigIcon, color: 'warmGray' },
    lock: { Icon: FileConfigIcon, color: 'warmGray' },
    yaml: { Icon: FileConfigIcon, color: 'warmGray' },
    yml: { Icon: FileConfigIcon, color: 'warmGray' },
  };
  return iconMap[ext || ''] || { Icon: FileIcon, color: 'warmGray' };
}

function getStatusColor(node: FileNode): string {
  if (node.added) return 'text-teal-400';
  if (node.modified) return 'text-gold-400';
  if (node.deleted) return 'text-coral-400';
  return '';
}

function getStatusText(node: FileNode): string {
  if (node.added) return 'added';
  if (node.modified) return 'modified';
  if (node.deleted) return 'deleted';
  return '';
}

function getStatusLabel(node: FileNode): string {
  if (node.added) return 'A';
  if (node.modified) return 'M';
  if (node.deleted) return 'D';
  return '';
}

function getAccessibilityHint(
  isFolder: boolean,
  hasChildren: boolean,
  isExpanded: boolean
): string {
  if (!isFolder) return 'Open file';
  if (!hasChildren) return 'Empty folder';
  return isExpanded ? 'Collapse folder' : 'Expand folder';
}

function FileTreeNodeRow({
  node,
  depth,
  isSelected,
  isExpanded,
  isFolder,
  hasChildren,
  statusColor,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  node: FileNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  isFolder: boolean;
  hasChildren: boolean;
  statusColor: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}) {
  let iconInfo: FileIconInfo;
  if (isFolder) {
    const Icon = isExpanded ? FolderOpenIcon : FolderIcon;
    iconInfo = { Icon, color: 'gold' };
  } else {
    iconInfo = getFileIconInfo(node.name);
  }

  const rowClass = isSelected ? 'bg-teal-600/20' : 'active:bg-neutral-700';
  const textClass = isSelected ? 'text-teal-300' : 'text-neutral-200';

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={accessibilityLabel}
      aria-description={accessibilityHint}
      className={`flex flex-row items-center py-1.5 px-2 ${rowClass}`}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <div className="w-4 mr-1 flex items-center justify-center">
        {isFolder && hasChildren ? (
          <div style={{ transform: `rotate(${isExpanded ? '0deg' : '-90deg'})` }}>
            <ChevronDownIcon size={12} color="warmGray" turbulence={0.12} />
          </div>
        ) : null}
      </div>
      <div className="mr-2">
        <iconInfo.Icon size={16} color={iconInfo.color} turbulence={0.15} />
      </div>
      <Text className={`font-mono text-sm flex-1 ${textClass} ${statusColor}`} numberOfLines={1}>
        {node.name}
      </Text>
    </button>
  );
}

export interface TreeNodeProps {
  node: FileNode;
  depth: number;
}

export const TreeNode = memo(function TreeNode({ node, depth }: Readonly<TreeNodeProps>) {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('TreeNode must be used within a FileTreeContext.Provider');
  }
  const { store, onSelectFile, showStatus } = context;

  const isExpanded = useStore(store, (s) => s.expandedPaths.has(node.path));
  const isSelected = useStore(store, (s) => s.selectedPath === node.path);
  const isFolder = node.type === 'folder';
  const hasChildren = Boolean(node.children?.length);
  const statusColor = getStatusColor(node);

  const handlePress = () => {
    if (isFolder && hasChildren) {
      store.getState().toggleExpanded(node.path);
    } else if (!isFolder) {
      onSelectFile?.(node.path);
    }
  };

  const shouldShowStatus = showStatus && Boolean(node.added || node.modified || node.deleted);

  const accessibilityLabel = [node.name, isFolder ? 'folder' : 'file', getStatusText(node)]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="flex-1">
          <FileTreeNodeRow
            node={node}
            depth={depth}
            isSelected={isSelected}
            isExpanded={isExpanded}
            isFolder={isFolder}
            hasChildren={hasChildren}
            statusColor={statusColor}
            onPress={handlePress}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={getAccessibilityHint(isFolder, hasChildren, isExpanded)}
          />
        </div>
        {shouldShowStatus && (
          <Text className={`text-xs ${statusColor} mr-2`}>{getStatusLabel(node)}</Text>
        )}
      </div>

      {isFolder && isExpanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
});
