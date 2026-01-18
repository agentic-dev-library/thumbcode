/**
 * FileTree Component
 *
 * Displays a hierarchical file/folder structure.
 * Supports expandable folders and file type icons.
 */

import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface FileNode {
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

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    ts: '📘',
    tsx: '⚛️',
    js: '📙',
    jsx: '⚛️',
    json: '📋',
    md: '📝',
    css: '🎨',
    scss: '🎨',
    html: '🌐',
    png: '🖼️',
    jpg: '🖼️',
    svg: '📐',
    git: '🔧',
    env: '⚙️',
    lock: '🔒',
  };
  return iconMap[ext || ''] || '📄';
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
  const icon = isFolder ? (isExpanded ? '📂' : '📁') : getFileIcon(node.name);
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
      {isFolder && hasChildren ? (
        <Text className="text-xs text-neutral-500 w-4 mr-1">{isExpanded ? '▼' : '▶'}</Text>
      ) : (
        <View className="w-4 mr-1" />
      )}
      <Text className="mr-2">{icon}</Text>
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
      style={{
        borderTopLeftRadius: 12,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 14,
        borderBottomLeftRadius: 8,
      }}
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
