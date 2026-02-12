/**
 * Create Project Screen
 *
 * Helps user create their first project by connecting a repository.
 * Uses paint daube icons for brand consistency.
 */

import { CredentialService, GitCloneService, GitHubApiService } from '@thumbcode/core';
import { useProjectStore } from '@thumbcode/state';
import type { Repository } from '@thumbcode/types';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { Container, VStack } from '@/components/layout';
import {
  ProjectFormActions,
  ProjectFormHeader,
  type RepoListItem,
  RepoSelector,
} from '@/components/onboarding';
import { Text } from '@/components/ui';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function fetchRepoList(): Promise<RepoListItem[]> {
  const list = await GitHubApiService.listRepositories();
  return list.map((r: Repository) => ({
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
  const dir = `${GitCloneService.getRepoBaseDir()}/${repo.fullName.replace('/', '__')}`;
  const githubToken = await getGitHubToken();

  if (repo.isPrivate && !githubToken) {
    throw new Error('This repository is private. Please connect GitHub first.');
  }

  const result = await GitCloneService.clone({
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
    if (isLoading || !selectedRepo || !projectName) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await ensureSigningSecret();
      const { dir } = await cloneRepository(selectedRepo);

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
          <StepsProgress
            totalSteps={4}
            currentStep={3}
            labels={['GitHub', 'API Keys', 'Project', 'Done']}
          />

          <VStack spacing="sm" className="mt-8 mb-8">
            <Text variant="display" size="3xl" weight="bold" className="text-white">
              Create Your First Project
            </Text>
            <Text className="text-neutral-400">
              Connect a repository to start building with AI agents.
            </Text>
          </VStack>

          <ProjectFormHeader projectName={projectName} onProjectNameChange={setProjectName} />

          <RepoSelector
            repos={repos}
            filteredRepos={filteredRepos}
            selectedRepo={selectedRepo}
            searchQuery={searchQuery}
            isLoadingRepos={isLoadingRepos}
            errorMessage={errorMessage}
            onSelectRepo={setSelectedRepo}
            onSearchChange={setSearchQuery}
            mode={mode}
            onModeChange={setMode}
            newRepoName={newRepoName}
            newRepoDescription={newRepoDescription}
            newRepoPrivate={newRepoPrivate}
            isCreatingRepo={isCreatingRepo}
            onNewRepoNameChange={setNewRepoName}
            onNewRepoDescriptionChange={setNewRepoDescription}
            onNewRepoPrivateChange={setNewRepoPrivate}
            onCreateNewRepo={handleCreateNewRepo}
          />
        </Container>
      </ScrollView>

      <ProjectFormActions
        canCreate={!!canCreate}
        isLoading={isLoading}
        bottomInset={insets.bottom}
        onSkip={handleSkip}
        onCreate={handleCreate}
      />
    </View>
  );
}
