/**
 * ProjectFileExplorer
 *
 * Renders a GitHub repository file browser with directory navigation.
 * Consumes data from the useProjectFiles hook.
 */

import type { GitHubContent } from '@thumbcode/core';
import { FileText, Folder, FolderOpen, Loader2 } from 'lucide-react';

interface ProjectFileExplorerProps {
  contents: GitHubContent[];
  currentPath: string;
  parentPath: string;
  isLoading: boolean;
  error: string | null;
  onNavigate: (path: string) => void;
}

export function ProjectFileExplorer({
  contents,
  currentPath,
  parentPath,
  isLoading,
  error,
  onNavigate,
}: Readonly<ProjectFileExplorerProps>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-400 font-body text-sm mb-4">
        <FolderOpen size={16} />
        <span>{currentPath || 'Root'}</span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-neutral-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
          <p className="text-coral-500 font-body text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-1">
          {currentPath && (
            <button
              type="button"
              onClick={() => onNavigate(parentPath)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-organic-card hover:bg-surface-elevated transition-colors text-left"
            >
              <Folder size={16} className="text-teal-400 shrink-0" />
              <span className="font-body text-sm text-neutral-300">..</span>
            </button>
          )}
          {contents.map((item) => (
            <button
              type="button"
              key={item.sha}
              onClick={() => {
                if (item.type === 'dir') onNavigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-organic-card transition-colors text-left ${
                item.type === 'dir' ? 'hover:bg-surface-elevated cursor-pointer' : 'cursor-default'
              }`}
            >
              {item.type === 'dir' ? (
                <Folder size={16} className="text-teal-400 shrink-0" />
              ) : (
                <FileText size={16} className="text-neutral-500 shrink-0" />
              )}
              <span className="font-body text-sm text-white truncate">{item.name}</span>
              {item.type === 'file' && item.size > 0 && (
                <span className="font-mono text-xs text-neutral-600 ml-auto shrink-0">
                  {item.size > 1024 ? `${(item.size / 1024).toFixed(1)}KB` : `${item.size}B`}
                </span>
              )}
            </button>
          ))}
          {contents.length === 0 && (
            <p className="text-neutral-500 font-body text-sm text-center py-4">Empty directory</p>
          )}
        </div>
      )}
    </div>
  );
}

/** No-repo fallback */
export function ProjectFileExplorerEmpty() {
  return (
    <div className="bg-surface rounded-organic-card shadow-organic-card p-6 text-center">
      <Folder size={32} className="text-neutral-600 mx-auto mb-3" />
      <p className="text-neutral-500 font-body text-sm">
        Could not parse repository info from URL.
      </p>
    </div>
  );
}
