/**
 * RepoSelector
 *
 * Displays a searchable list of GitHub repositories with the ability to create new ones.
 */

import type { Repository } from '@thumbcode/types';
import { FolderIcon, SecurityIcon, StarIcon, SuccessIcon } from '@/components/icons';
import { VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

export interface RepoListItem extends Repository {
  /** Stable key for list rendering */
  key: string;
}

interface RepoSelectorProps {
  repos: RepoListItem[];
  filteredRepos: RepoListItem[];
  selectedRepo: RepoListItem | null;
  searchQuery: string;
  isLoadingRepos: boolean;
  errorMessage: string | null;
  onSelectRepo: (repo: RepoListItem) => void;
  onSearchChange: (query: string) => void;
  // New repo creation
  mode: 'select' | 'create';
  onModeChange: (mode: 'select' | 'create') => void;
  newRepoName: string;
  newRepoDescription: string;
  newRepoPrivate: boolean;
  isCreatingRepo: boolean;
  onNewRepoNameChange: (name: string) => void;
  onNewRepoDescriptionChange: (desc: string) => void;
  onNewRepoPrivateChange: (isPrivate: boolean) => void;
  onCreateNewRepo: () => void;
}

export function RepoSelector({
  filteredRepos,
  selectedRepo,
  searchQuery,
  isLoadingRepos,
  errorMessage,
  onSelectRepo,
  onSearchChange,
  mode,
  onModeChange,
  newRepoName,
  newRepoDescription,
  newRepoPrivate,
  isCreatingRepo,
  onNewRepoNameChange,
  onNewRepoDescriptionChange,
  onNewRepoPrivateChange,
  onCreateNewRepo,
}: Readonly<RepoSelectorProps>) {
  return (
    <>
      {/* Repository Selection */}
      <VStack spacing="sm" className="mb-4">
        <Text weight="semibold" className="text-white">
          Select Repository
        </Text>
        <Input
          placeholder="Search repositories..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </VStack>

      {/* Repo List */}
      <VStack spacing="sm">
        {isLoadingRepos ? (
          <div className="py-8 items-center justify-center">
            <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
            <Text size="sm" className="text-neutral-500 mt-3 text-center">
              Loading repositories…
            </Text>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="py-8 items-center justify-center">
            <Text className="text-neutral-400 text-center">No repositories found.</Text>
            {errorMessage && (
              <Text size="sm" className="text-coral-400 text-center mt-2">
                {errorMessage}
              </Text>
            )}
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <button
              type="button"
              key={repo.key}
              onClick={() => onSelectRepo(repo)}
              className={`p-4 ${selectedRepo?.key === repo.key ? 'bg-teal-600/20 border-teal-600' : 'bg-surface border-transparent'} border`}
              style={organicBorderRadius.card}
            >
              <div className="flex-row items-center mb-2">
                <div className="mr-2">
                  {repo.isPrivate ? (
                    <SecurityIcon size={18} color="warmGray" turbulence={0.15} />
                  ) : (
                    <FolderIcon size={18} color="gold" turbulence={0.15} />
                  )}
                </div>
                <Text weight="semibold" className="text-white flex-1">
                  {repo.name}
                </Text>
                {selectedRepo?.key === repo.key && (
                  <SuccessIcon size={18} color="teal" turbulence={0.15} />
                )}
              </div>
              <Text size="sm" className="text-neutral-400" numberOfLines={1}>
                {repo.description || 'No description'}
              </Text>
              <div className="flex-row items-center mt-1">
                <Text size="xs" className="text-neutral-500">
                  {repo.fullName}
                </Text>
                {(repo.stars || 0) > 0 && (
                  <div className="flex-row items-center ml-2">
                    <StarIcon size={12} color="gold" turbulence={0.15} />
                    <Text size="xs" className="text-neutral-500 ml-1">
                      {repo.stars}
                    </Text>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </VStack>

      {/* Create New Repository */}
      {mode === 'select' ? (
        <button
          type="button"
          onClick={() => onModeChange('create')}
          className="mt-4 p-4 border border-dashed border-teal-600/50 active:bg-teal-600/10"
          style={organicBorderRadius.card}
        >
          <div className="flex-row items-center justify-center">
            <Text className="text-teal-400">+ Create new repository</Text>
          </div>
        </button>
      ) : (
        <VStack
          spacing="sm"
          className="mt-4 p-4 bg-surface border border-teal-600/30"
          style={organicBorderRadius.card}
        >
          <div className="flex-row items-center justify-between mb-2">
            <Text weight="semibold" className="text-white">
              New Repository
            </Text>
            <button type="button" onClick={() => onModeChange('select')}>
              <Text size="sm" className="text-neutral-400">
                Cancel
              </Text>
            </button>
          </div>

          <Input
            placeholder="repository-name"
            value={newRepoName}
            onChangeText={onNewRepoNameChange}
          />

          <Input
            placeholder="Description (optional)"
            value={newRepoDescription}
            onChangeText={onNewRepoDescriptionChange}
          />

          <div className="flex-row items-center justify-between py-2">
            <Text className="text-neutral-300">Private repository</Text>
            <input
              type="checkbox"
              checked={newRepoPrivate}
              onChange={(e) => onNewRepoPrivateChange(e.target.checked)}
            />
          </div>

          {errorMessage && mode === 'create' && (
            <Text size="sm" className="text-coral-500">
              {errorMessage}
            </Text>
          )}

          <button
            type="button"
            onClick={onCreateNewRepo}
            disabled={!newRepoName.trim() || isCreatingRepo}
            className={`py-3 ${newRepoName.trim() && !isCreatingRepo ? 'bg-teal-600 active:bg-teal-700' : 'bg-neutral-700'}`}
            style={organicBorderRadius.button}
          >
            {isCreatingRepo ? (
              <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Text
                weight="semibold"
                className={`text-center ${newRepoName.trim() ? 'text-white' : 'text-neutral-500'}`}
              >
                Create Repository
              </Text>
            )}
          </button>
        </VStack>
      )}
    </>
  );
}
