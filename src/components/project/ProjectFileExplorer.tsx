/**
 * ProjectFileExplorer
 *
 * Displays a file tree for the project's local working directory.
 */

import { FileTree, type FileNode as FileTreeNode } from '@/components/code';
import { Badge } from '@/components/display';
import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

interface ProjectFileExplorerProps {
  fileNodes: FileTreeNode[];
  isLoading: boolean;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

export function ProjectFileExplorer({
  fileNodes,
  isLoading,
  selectedFile,
  onSelectFile,
}: Readonly<ProjectFileExplorerProps>) {
  return (
    <VStack spacing="md">
      <div className="bg-surface p-4" style={organicBorderRadius.card}>
        <HStack justify="between" align="center" className="mb-3">
          <Text weight="semibold" className="text-white">
            Files
          </Text>
          {selectedFile && <Badge variant="secondary">Selected</Badge>}
        </HStack>

        {isLoading ? (
          <Text className="text-neutral-500">Loading files…</Text>
        ) : (
          <FileTree
            data={fileNodes}
            selectedPath={selectedFile || undefined}
            onSelectFile={(path) => onSelectFile(path)}
            showStatus={false}
          />
        )}
      </div>
    </VStack>
  );
}
