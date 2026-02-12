/**
 * Create Project Screen
 *
 * Helps user create their first project by connecting a repository.
 * Uses paint daube icons for brand consistency.
 */

import { CredentialService, GitHubApiService, GitService } from '@thumbcode/core';
import { useProjectStore } from '@thumbcode/state';
import type { Repository } from '@thumbcode/types';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { FolderIcon, SecurityIcon, StarIcon, SuccessIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface RepoListItem extends Repository {
  /** Stable key for list rendering */
  key: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function fetchRepoList(): Promise<RepoListItem[]> {
  const list = await GitHubApiService.listRepositories();
  return list.map((r) => ({
    ...r,
    key: r.fullName,
  }));
}

async function ensureSigningSecret(): Promise<void> {
  const existing = await CredentialService.retrieve('mcp_signing_secret');
  if (existing.secret) return;
  const secretBytes = Crypto.getRandomBytes(32);
  await CredentialService.store('mcp_signing_secret', bytesToHex(secretBytes));
}

async function getGitHubToken(): Promise<string | null> {
  const result = await CredentialService.retrieve('github');
  return result?.secret ?? null;
}

async function cloneRepository(repo: RepoListItem): Promise<{ dir: string }> {
  const dir = `${GitService.getRepoBaseDir()}/${repo.fullName.replace('/', '__')}`;
  const githubToken = await getGitHubToken();

  if (repo.isPrivate && !githubToken) {
    throw new Error('This repository is private. Please connect GitHub first.');
  }

  const result = await GitService.clone({
    url: repo.cloneUrl,
    dir,
    branch: repo.defaultBranch,
    depth: 1,
    credentials: githubToken
      ? {
          username: 'x-access-token',
          password: githubToken,
        }
      : undefined,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to clone repository');
  }

  return { dir };
}

export default function CreateProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addProject = useProjectStore((s) => s.addProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const initWorkspace = useProjectStore((s) => s.initWorkspace);

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

  useEffect(() => {
    let cancelled = false;
    setIsLoadingRepos(true);
    setErrorMessage(null);
    fetchRepoList()
      .then((list) => {
        if (cancelled) return;
        setRepos(list);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load repositories');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingRepos(false);
      });
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
    router.push('/(onboarding)/complete');
  };

  const handleCreateNewRepo = async () => {
    const trimmedName = newRepoName.trim();
    if (!trimmedName || isCreatingRepo) return;

    setIsCreatingRepo(true);
    setErrorMessage(null);
    try {
      const repo = await GitHubApiService.createRepository({
        name: trimmedName,
        description: newRepoDescription.trim(),
        isPrivate: newRepoPrivate,
      });

      const repoItem: RepoListItem = { ...repo, key: repo.fullName };
      setRepos((prev) => [repoItem, ...prev]);
      setSelectedRepo(repoItem);
      if (!projectName.trim()) {
        setProjectName(repo.name);
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
    // Guard against double-submit
    if (isLoading || !selectedRepo || !projectName) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await ensureSigningSecret();
      const { dir } = await cloneRepository(selectedRepo);

      // Create project in shared store
      const projectId = addProject({
        name: projectName.trim(),
        repoUrl: selectedRepo.cloneUrl,
        localPath: dir,
        defaultBranch: selectedRepo.defaultBranch,
        status: 'active',
      });
      setActiveProject(projectId);
      initWorkspace(projectId, selectedRepo.defaultBranch);

      router.replace(`/project/${projectId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = selectedRepo && projectName.trim().length > 0;

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Container padding="lg">
          {/* Progress */}
          <StepsProgress
            totalSteps={4}
            currentStep={3}
            labels={['GitHub', 'API Keys', 'Project', 'Done']}
          />

          {/* Header */}
          <VStack spacing="sm" className="mt-8 mb-8">
            <Text variant="display" size="3xl" weight="bold" className="text-white">
              Create Your First Project
            </Text>
            <Text className="text-neutral-400">
              Connect a repository to start building with AI agents.
            </Text>
          </VStack>

          {/* Project Name */}
          <VStack spacing="sm" className="mb-6">
            <Text weight="semibold" className="text-white">
              Project Name
            </Text>
            <Input
              placeholder="My Awesome Project"
              value={projectName}
              onChangeText={setProjectName}
            />
          </VStack>

          {/* Repository Selection */}
          <VStack spacing="sm" className="mb-4">
            <Text weight="semibold" className="text-white">
              Select Repository
            </Text>
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </VStack>

          {/* Repo List */}
          <VStack spacing="sm">
            {isLoadingRepos ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator color={getColor('neutral', '50')} />
                <Text size="sm" className="text-neutral-500 mt-3 text-center">
                  Loading repositories…
                </Text>
              </View>
            ) : filteredRepos.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <Text className="text-neutral-400 text-center">No repositories found.</Text>
                {errorMessage && (
                  <Text size="sm" className="text-coral-400 text-center mt-2">
                    {errorMessage}
                  </Text>
                )}
              </View>
            ) : (
              filteredRepos.map((repo) => (
                <Pressable
                  key={repo.key}
                  onPress={() => setSelectedRepo(repo)}
                  className={`p-4 ${selectedRepo?.key === repo.key ? 'bg-teal-600/20 border-teal-600' : 'bg-surface border-transparent'} border`}
                  style={organicBorderRadius.card}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="mr-2">
                      {repo.isPrivate ? (
                        <SecurityIcon size={18} color="warmGray" turbulence={0.15} />
                      ) : (
                        <FolderIcon size={18} color="gold" turbulence={0.15} />
                      )}
                    </View>
                    <Text weight="semibold" className="text-white flex-1">
                      {repo.name}
                    </Text>
                    {selectedRepo?.key === repo.key && (
                      <SuccessIcon size={18} color="teal" turbulence={0.15} />
                    )}
                  </View>
                  <Text size="sm" className="text-neutral-400" numberOfLines={1}>
                    {repo.description || 'No description'}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text size="xs" className="text-neutral-500">
                      {repo.fullName}
                    </Text>
                    {(repo.stars || 0) > 0 && (
                      <View className="flex-row items-center ml-2">
                        <StarIcon size={12} color="gold" turbulence={0.15} />
                        <Text size="xs" className="text-neutral-500 ml-1">
                          {repo.stars}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </VStack>

          {/* Create New Repository */}
          {mode === 'select' ? (
            <Pressable
              onPress={() => setMode('create')}
              className="mt-4 p-4 border border-dashed border-teal-600/50 active:bg-teal-600/10"
              style={organicBorderRadius.card}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-teal-400">+ Create new repository</Text>
              </View>
            </Pressable>
          ) : (
            <VStack
              spacing="sm"
              className="mt-4 p-4 bg-surface border border-teal-600/30"
              style={organicBorderRadius.card}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text weight="semibold" className="text-white">
                  New Repository
                </Text>
                <Pressable onPress={() => setMode('select')}>
                  <Text size="sm" className="text-neutral-400">
                    Cancel
                  </Text>
                </Pressable>
              </View>

              <Input
                placeholder="repository-name"
                value={newRepoName}
                onChangeText={setNewRepoName}
              />

              <Input
                placeholder="Description (optional)"
                value={newRepoDescription}
                onChangeText={setNewRepoDescription}
              />

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-neutral-300">Private repository</Text>
                <Switch
                  value={newRepoPrivate}
                  onValueChange={setNewRepoPrivate}
                  trackColor={{
                    false: getColor('neutral', '700'),
                    true: getColor('teal', '600'),
                  }}
                  thumbColor={getColor('neutral', '50')}
                />
              </View>

              {errorMessage && mode === 'create' && (
                <Text size="sm" className="text-coral-500">
                  {errorMessage}
                </Text>
              )}

              <Pressable
                onPress={handleCreateNewRepo}
                disabled={!newRepoName.trim() || isCreatingRepo}
                className={`py-3 ${newRepoName.trim() && !isCreatingRepo ? 'bg-teal-600 active:bg-teal-700' : 'bg-neutral-700'}`}
                style={organicBorderRadius.button}
              >
                {isCreatingRepo ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text
                    weight="semibold"
                    className={`text-center ${newRepoName.trim() ? 'text-white' : 'text-neutral-500'}`}
                  >
                    Create Repository
                  </Text>
                )}
              </Pressable>
            </VStack>
          )}
        </Container>
      </ScrollView>

      {/* Bottom Buttons */}
      <View
        className="border-t border-neutral-800 px-6 py-4 flex-row gap-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSkip}
          className="flex-1 bg-neutral-800 py-4 active:bg-neutral-700"
          style={organicBorderRadius.cta}
        >
          <Text className="text-neutral-300 text-center">Skip for Now</Text>
        </Pressable>

        <Pressable
          onPress={handleCreate}
          disabled={!canCreate || isLoading}
          className={`flex-1 py-4 ${canCreate && !isLoading ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          style={organicBorderRadius.cta}
        >
          {isLoading ? (
            <ActivityIndicator color={getColor('neutral', '50')} />
          ) : (
            <Text
              weight="semibold"
              className={canCreate ? 'text-white text-center' : 'text-neutral-500 text-center'}
            >
              Create Project
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
