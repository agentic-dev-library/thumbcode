/**
 * Repository Service
 *
 * Handles GitHub repository listing, creation, and filtering.
 * Extracted from create-project.tsx to keep page components thin.
 */

import { GitHubApiService } from '@/core';
import type { Repository } from '@/types';
import type { RepoListItem } from '@/components/onboarding';

/** Maps a Repository from the API to a RepoListItem for the UI */
export function toRepoListItem(r: Repository): RepoListItem {
  return {
    key: r.fullName,
    provider: r.provider,
    owner: r.owner,
    name: r.name,
    fullName: r.fullName,
    description: r.description ?? undefined,
    cloneUrl: r.cloneUrl,
    defaultBranch: r.defaultBranch,
    isPrivate: r.isPrivate,
    stars: r.stars,
    forks: r.forks,
    updatedAt: r.updatedAt,
  };
}

/** Fetches the user's GitHub repositories and maps them to RepoListItems */
export async function fetchRepositories(): Promise<RepoListItem[]> {
  const repositories = await GitHubApiService.listRepositories();
  return repositories.map(toRepoListItem);
}

/** Creates a new GitHub repository and returns it as a RepoListItem */
export async function createRepository(options: {
  name: string;
  description?: string;
  isPrivate?: boolean;
}): Promise<RepoListItem> {
  const repo = await GitHubApiService.createRepository(options);
  return toRepoListItem(repo);
}

/** Filters repos by a search query matching name, fullName, or description */
export function filterRepositories(repos: RepoListItem[], query: string): RepoListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return repos;
  return repos.filter((repo) => {
    const hay = `${repo.name} ${repo.fullName} ${repo.description ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Classifies an error message as an auth error vs. a generic API error */
export function classifyError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Failed to load repositories';
  const isAuthError =
    message.includes('401') ||
    message.includes('Unauthorized') ||
    message.includes('authentication') ||
    message.includes('token');
  return isAuthError
    ? 'GitHub authentication failed. Please re-authenticate in Settings.'
    : message;
}
