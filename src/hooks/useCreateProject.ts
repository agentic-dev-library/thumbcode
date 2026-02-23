/**
 * useCreateProject
 *
 * Manages all form state and side effects for the create-project page.
 * Delegates data operations to repository-service and validation to validation module.
 */

import { useProjectStore } from '@thumbcode/state';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RepoListItem } from '@/components/onboarding';
import { useAppRouter } from '@/hooks/useAppRouter';
import {
  canCreateProject,
  classifyError,
  createRepository,
  fetchRepositories,
  filterRepositories,
} from '@/services/repository';

export function useCreateProject() {
  const router = useAppRouter();
  const addProject = useProjectStore((s) => s.addProject);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<RepoListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [repos, setRepos] = useState<RepoListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New repo creation state
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  // Fetch repos on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoadingRepos(true);
      setErrorMessage(null);
      try {
        const items = await fetchRepositories();
        if (!cancelled) setRepos(items);
      } catch (error) {
        if (!cancelled) setErrorMessage(classifyError(error));
      } finally {
        if (!cancelled) setIsLoadingRepos(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRepos = useMemo(() => filterRepositories(repos, searchQuery), [repos, searchQuery]);

  const canCreate = canCreateProject(projectName, selectedRepo);

  const handleSelectRepo = useCallback(
    (repo: RepoListItem) => {
      setSelectedRepo(repo);
      if (!projectName.trim()) {
        setProjectName(repo.name);
      }
    },
    [projectName]
  );

  const handleSkip = useCallback(() => {
    router.push('/onboarding/complete');
  }, [router]);

  const handleCreateNewRepo = useCallback(async () => {
    const trimmedName = newRepoName.trim();
    if (!trimmedName || isCreatingRepo) return;

    setIsCreatingRepo(true);
    setErrorMessage(null);
    try {
      const repoItem = await createRepository({
        name: trimmedName,
        description: newRepoDescription.trim() || undefined,
        isPrivate: newRepoPrivate,
      });

      setRepos((prev) => [repoItem, ...prev]);
      setSelectedRepo(repoItem);
      if (!projectName.trim()) {
        setProjectName(trimmedName);
      }
      setMode('select');
      setNewRepoName('');
      setNewRepoDescription('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create repository');
    } finally {
      setIsCreatingRepo(false);
    }
  }, [newRepoName, newRepoDescription, newRepoPrivate, isCreatingRepo, projectName]);

  const handleCreate = useCallback(async () => {
    if (isLoading || !selectedRepo || !projectName) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      addProject({
        name: projectName.trim(),
        repoUrl: selectedRepo.cloneUrl,
        localPath: `/${selectedRepo.fullName}`,
        defaultBranch: selectedRepo.defaultBranch,
      });

      router.replace('/onboarding/complete');
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedRepo, projectName, addProject, router]);

  return {
    // Form state
    projectName,
    setProjectName,
    selectedRepo,
    searchQuery,
    setSearchQuery: (q: string) => setSearchQuery(q),
    isLoading,
    isLoadingRepos,
    repos,
    filteredRepos,
    errorMessage,
    canCreate,

    // Repo creation state
    mode,
    setMode,
    newRepoName,
    setNewRepoName,
    newRepoDescription,
    setNewRepoDescription,
    newRepoPrivate,
    setNewRepoPrivate,
    isCreatingRepo,

    // Actions
    handleSelectRepo,
    handleSkip,
    handleCreateNewRepo,
    handleCreate,
  };
}
