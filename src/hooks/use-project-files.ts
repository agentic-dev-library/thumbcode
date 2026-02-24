/**
 * useProjectFiles Hook
 *
 * Manages file explorer state and fetching for GitHub repository browsing.
 * Handles directory navigation, loading states, race condition protection,
 * and content sorting (directories first, then alphabetical).
 */

import type { GitHubContent } from '@/core';
import { GitHubApiService } from '@/core';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface UseProjectFilesResult {
  contents: GitHubContent[];
  currentPath: string;
  parentPath: string;
  isLoading: boolean;
  error: string | null;
  navigateTo: (path: string) => void;
}

/**
 * Parse owner/repo from a GitHub URL (e.g. "https://github.com/owner/repo.git")
 */
export function parseRepoInfo(repoUrl: string): RepoInfo | null {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  return null;
}

function sortDirsFirst(items: GitHubContent[]): GitHubContent[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Failed to load files';
}

/**
 * Hook for browsing GitHub repository file contents.
 * Sorts results with directories first, then files, alphabetically.
 */
export function useProjectFiles(repoInfo: RepoInfo | null, branch: string): UseProjectFilesResult {
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchContents = useCallback(
    async (path: string) => {
      if (!repoInfo) return;
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await GitHubApiService.getContents(
          repoInfo.owner,
          repoInfo.repo,
          path || undefined,
          branch
        );
        if (requestId !== requestIdRef.current) return;
        setContents(sortDirsFirst(data));
        setCurrentPath(path);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(toErrorMessage(err));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [repoInfo, branch]
  );

  useEffect(() => {
    fetchContents('');
  }, [fetchContents]);

  const parentPath = currentPath.includes('/')
    ? currentPath.substring(0, currentPath.lastIndexOf('/'))
    : '';

  return {
    contents,
    currentPath,
    parentPath,
    isLoading,
    error,
    navigateTo: fetchContents,
  };
}
