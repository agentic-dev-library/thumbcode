/**
 * useProjectCommits Hook
 *
 * Fetches recent commits for a GitHub repository.
 * Handles loading states and cancellation on unmount/dependency change.
 */

import { useEffect, useState } from 'react';
import type { GitHubCommit } from '@/core';
import { GitHubApiService } from '@/core';
import type { RepoInfo } from './use-project-files';

export interface UseProjectCommitsResult {
  commits: GitHubCommit[];
  isLoading: boolean;
  error: string | null;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Failed to load commits';
}

async function fetchCommits(repoInfo: RepoInfo, branch: string): Promise<GitHubCommit[]> {
  return GitHubApiService.listCommits(repoInfo.owner, repoInfo.repo, {
    sha: branch,
    perPage: 30,
  });
}

export function useProjectCommits(
  repoInfo: RepoInfo | null,
  branch: string
): UseProjectCommitsResult {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoInfo) return;
    let cancelled = false;
    const info = repoInfo;

    setIsLoading(true);
    setError(null);

    fetchCommits(info, branch)
      .then((data) => {
        if (!cancelled) setCommits(data);
      })
      .catch((err) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repoInfo, branch]);

  return { commits, isLoading, error };
}
