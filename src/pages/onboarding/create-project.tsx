/**
 * Create Project Screen
 *
 * Helps user create their first project by connecting a repository.
 * Uses paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/create-project.tsx
 */

import { GitHubApiService } from '@thumbcode/core';
import { useProjectStore } from '@thumbcode/state';
import { useEffect, useMemo, useState } from 'react';
import { StepsProgress } from '@/components/feedback/Progress';
import { FolderIcon, SecurityIcon, StarIcon, SuccessIcon } from '@/components/icons';
import { useAppRouter } from '@/hooks/useAppRouter';

/** Spinner component for loading states */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

interface RepoListItem {
  key: string;
  name: string;
  fullName: string;
  description: string | null;
  cloneUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  stars?: number;
}

export default function CreateProjectPage() {
  const router = useAppRouter();
  const addProject = useProjectStore((s) => s.addProject);

  const [projectName, setProjectName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<RepoListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [repos, setRepos] = useState<RepoListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRepos = async () => {
      setIsLoadingRepos(true);
      setErrorMessage(null);
      try {
        const repositories = await GitHubApiService.listRepositories();
        if (!cancelled) {
          setRepos(
            repositories.map((r) => ({
              key: r.fullName,
              name: r.name,
              fullName: r.fullName,
              description: r.description ?? null,
              cloneUrl: r.cloneUrl,
              defaultBranch: r.defaultBranch,
              isPrivate: r.isPrivate,
              stars: r.stars,
            }))
          );
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load repositories';
          const isAuthError =
            message.includes('401') ||
            message.includes('Unauthorized') ||
            message.includes('authentication') ||
            message.includes('token');
          setErrorMessage(
            isAuthError
              ? 'GitHub authentication failed. Please re-authenticate in Settings.'
              : message
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRepos(false);
        }
      }
    };

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((repo) => {
      const hay = `${repo.name} ${repo.fullName} ${repo.description ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [repos, searchQuery]);

  const handleSkip = () => {
    router.push('/onboarding/complete');
  };

  const handleCreateNewRepo = async () => {
    const trimmedName = newRepoName.trim();
    if (!trimmedName || isCreatingRepo) return;

    setIsCreatingRepo(true);
    setErrorMessage(null);
    try {
      const repo = await GitHubApiService.createRepository({
        name: trimmedName,
        description: newRepoDescription.trim() || undefined,
        isPrivate: newRepoPrivate,
      });

      const repoItem: RepoListItem = {
        key: repo.fullName,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description ?? null,
        cloneUrl: repo.cloneUrl,
        defaultBranch: repo.defaultBranch,
        isPrivate: repo.isPrivate,
        stars: repo.stars,
      };

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
  };

  const handleCreate = async () => {
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
  };

  const canCreate = selectedRepo && projectName.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="create-project-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32">
        {/* Progress */}
        <StepsProgress
          totalSteps={4}
          currentStep={3}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Create Your First Project</h1>
          <p className="font-body text-neutral-400">
            Connect a repository to start building with AI agents.
          </p>
        </div>

        {/* Project Name */}
        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor="project-name" className="font-body font-semibold text-white">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            placeholder="My Awesome Project"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-white border-2 border-neutral-200 px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40"
            data-testid="project-name-input"
          />
        </div>

        {/* Repository Selection */}
        <div className="flex flex-col gap-2 mb-4">
          <span className="font-body font-semibold text-white">Select Repository</span>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-neutral-200 px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40"
            data-testid="repo-search-input"
          />
        </div>

        {/* Repo List */}
        <div className="flex flex-col gap-2">
          {isLoadingRepos ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Spinner />
              <span className="font-body text-sm text-neutral-500 mt-3 text-center">
                Loading repositories...
              </span>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <span className="font-body text-neutral-400 text-center">No repositories found.</span>
              {errorMessage && (
                <span className="font-body text-sm text-coral-400 text-center mt-2">
                  {errorMessage}
                </span>
              )}
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <button
                key={repo.key}
                type="button"
                onClick={() => {
                  setSelectedRepo(repo);
                  if (!projectName.trim()) {
                    setProjectName(repo.name);
                  }
                }}
                className={`p-4 text-left border rounded-organic-card transition-colors ${
                  selectedRepo?.key === repo.key
                    ? 'bg-teal-600/20 border-teal-600'
                    : 'bg-surface border-transparent hover:bg-surface-elevated'
                }`}
                data-testid={`repo-item-${repo.key}`}
              >
                <div className="flex flex-row items-center mb-2">
                  <span className="mr-2">
                    {repo.isPrivate ? (
                      <SecurityIcon size={18} color="warmGray" turbulence={0.15} />
                    ) : (
                      <FolderIcon size={18} color="gold" turbulence={0.15} />
                    )}
                  </span>
                  <span className="font-body font-semibold text-white flex-1">{repo.name}</span>
                  {selectedRepo?.key === repo.key && (
                    <SuccessIcon size={18} color="teal" turbulence={0.15} />
                  )}
                </div>
                <span className="font-body text-sm text-neutral-400 block truncate">
                  {repo.description || 'No description'}
                </span>
                <div className="flex flex-row items-center mt-1">
                  <span className="font-body text-xs text-neutral-500">{repo.fullName}</span>
                  {(repo.stars || 0) > 0 && (
                    <span className="flex flex-row items-center ml-2">
                      <StarIcon size={12} color="gold" turbulence={0.15} />
                      <span className="font-body text-xs text-neutral-500 ml-1">{repo.stars}</span>
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Create New Repository */}
        {mode === 'select' ? (
          <button
            type="button"
            onClick={() => setMode('create')}
            className="mt-4 p-4 w-full border border-dashed border-teal-600/50 rounded-organic-card hover:bg-teal-600/10 active:bg-teal-600/20 transition-colors"
            data-testid="create-repo-toggle"
          >
            <span className="flex items-center justify-center">
              <span className="font-body text-teal-400">+ Create new repository</span>
            </span>
          </button>
        ) : (
          <div className="mt-4 p-4 bg-surface border border-teal-600/30 rounded-organic-card flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between mb-2">
              <span className="font-body font-semibold text-white">New Repository</span>
              <button
                type="button"
                onClick={() => setMode('select')}
                className="font-body text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              placeholder="repository-name"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              className="w-full bg-white border-2 border-neutral-200 px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40"
              data-testid="new-repo-name-input"
            />

            <input
              type="text"
              placeholder="Description (optional)"
              value={newRepoDescription}
              onChange={(e) => setNewRepoDescription(e.target.value)}
              className="w-full bg-white border-2 border-neutral-200 px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40"
              data-testid="new-repo-desc-input"
            />

            <div className="flex flex-row items-center justify-between py-2">
              <span className="font-body text-neutral-300">Private repository</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  className="sr-only peer"
                  data-testid="new-repo-private-toggle"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-checked:bg-teal-600 rounded-full peer-focus:ring-2 peer-focus:ring-teal-500/40 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-50 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {errorMessage && mode === 'create' && (
              <span className="font-body text-sm text-coral-500">{errorMessage}</span>
            )}

            <button
              type="button"
              onClick={handleCreateNewRepo}
              disabled={!newRepoName.trim() || isCreatingRepo}
              className={`py-3 rounded-organic-button font-body font-semibold text-center transition-colors ${
                newRepoName.trim() && !isCreatingRepo
                  ? 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800'
                  : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              }`}
              data-testid="create-repo-button"
            >
              {isCreatingRepo ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                </span>
              ) : (
                'Create Repository'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-charcoal px-6 py-4 pb-8 flex flex-row gap-4">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate || isLoading}
          className={`flex-1 py-4 rounded-organic-button font-body font-semibold text-center transition-colors ${
            canCreate && !isLoading
              ? 'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700'
              : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
          }`}
          data-testid="create-project-button"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Spinner />
            </span>
          ) : (
            'Create Project'
          )}
        </button>
      </div>
    </div>
  );
}
