/**
 * FileTree Component
 *
 * Displays a hierarchical file/folder structure.
 * Supports expandable folders and file type icons.
 * Uses paint daube icons for brand consistency.
 */

import type React from 'react';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
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
import { organicBorderRadius } from '@/lib/organic-styles';

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

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  onSelectFile?: (path: string) => void;
  selectedPath?: string;
  expandedPaths: Set<string>;
  toggleExpanded: (path: string) => void;
  showStatus?: boolean;
}

/** File icon component type */
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
  // Get the appropriate icon based on file type or folder state
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      className={`flex-row items-center py-1.5 px-2 ${rowClass}`}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <View className="w-4 mr-1 items-center justify-center">
        {isFolder && hasChildren ? (
          <View style={{ transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }] }}>
            <ChevronDownIcon size={12} color="warmGray" turbulence={0.12} />
          </View>
        ) : null}
      </View>
      <View className="mr-2">
        <iconInfo.Icon size={16} color={iconInfo.color} turbulence={0.15} />
      </View>
      <Text className={`font-mono text-sm flex-1 ${textClass} ${statusColor}`} numberOfLines={1}>
        {node.name}
      </Text>
    </Pressable>
  );
}

function FileTreeNode({
  node,
  depth,
  onSelectFile,
  selectedPath,
  expandedPaths,
  toggleExpanded,
  showStatus,
}: FileTreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder';
  const hasChildren = Boolean(node.children?.length);
  const statusColor = getStatusColor(node);

  const handlePress = () => {
    if (isFolder && hasChildren) {
      toggleExpanded(node.path);
    } else if (!isFolder) {
      onSelectFile?.(node.path);
    }
  };

  const shouldShowStatus = showStatus && Boolean(node.added || node.modified || node.deleted);

  // Accessibility labels for screen readers
  const accessibilityLabel = [node.name, isFolder ? 'folder' : 'file', getStatusText(node)]
    .filter(Boolean)
    .join(', ');

  return (
    <View>
      <View className="flex-row items-center">
        <View className="flex-1">
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
        </View>
        {shouldShowStatus && (
          <Text className={`text-xs ${statusColor} mr-2`}>{getStatusLabel(node)}</Text>
        )}
      </View>

      {isFolder && isExpanded && hasChildren && (
        <View>
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              toggleExpanded={toggleExpanded}
              showStatus={showStatus}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export function FileTree({
  data,
  onSelectFile,
  selectedPath,
  defaultExpanded = [],
  showStatus = true,
}: FileTreeProps) {
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
        .map((node) => ({
          ...node,
          children: node.children ? sortNodes(node.children) : undefined,
        }));
    };
    return sortNodes(data);
  }, [data]);

  return (
    <View
      accessibilityRole="list"
      accessibilityLabel="File tree"
      className="bg-surface overflow-hidden"
      style={organicBorderRadius.card}
    >
      {sortedData.map((node) => (
        <FileTreeNode
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
    </View>
  );
}
