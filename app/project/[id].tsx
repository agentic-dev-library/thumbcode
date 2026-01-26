/**
 * Project Detail Screen
 *
 * Production project workspace view backed by @thumbcode/state + @thumbcode/core GitService.
 */

import { GitService } from '@thumbcode/core';
import { useAgentStore, useProjectStore } from '@thumbcode/state';
import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileTree, type FileNode as FileTreeNode } from '@/components/code';
import { Avatar, Badge, StatusBadge } from '@/components/display';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

type Tab = 'files' | 'commits' | 'tasks' | 'agents';

async function buildFileTree(
  dir: string,
  basePath = '',
  depth = 0,
  maxDepth = 6
): Promise<FileTreeNode[]> {
  if (depth > maxDepth) return [];
  const entries = await FileSystem.readDirectoryAsync(`${dir}/${basePath}`.replace(/\/+$/, ''));

  const nodes: FileTreeNode[] = [];
  for (const name of entries) {
    if (name.startsWith('.git')) continue;
    const relPath = basePath ? `${basePath}/${name}` : name;
    const info = await FileSystem.getInfoAsync(`${dir}/${relPath}`);
    if (!info.exists) continue;

    if (info.isDirectory) {
      nodes.push({
        name,
        type: 'folder',
        path: relPath,
        children: await buildFileTree(dir, relPath, depth + 1, maxDepth),
      });
    } else {
      nodes.push({ name, type: 'file', path: relPath });
    }
  }

  // Sort folders first, then files
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

async function fetchProjectFileNodes(localPath: string): Promise<FileTreeNode[]> {
  return await buildFileTree(localPath);
}

function formatCommitDate(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const workspace = useProjectStore((s) => s.workspace);
  const initWorkspace = useProjectStore((s) => s.initWorkspace);

  const agents = useAgentStore((s) => s.agents);
  const tasks = useAgentStore((s) => s.tasks);

  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileNodes, setFileNodes] = useState<FileTreeNode[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commits, setCommits] = useState<
    Array<{ sha: string; message: string; author: string; date: string }>
  >([]);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scopedTasks = useMemo(() => {
    // Until AgentTask has projectId, show all tasks (production wiring follows once orchestration emits project IDs).
    return tasks;
  }, [tasks]);

  const activeAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = scopedTasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;

  useEffect(() => {
    if (!project) return;
    // Ensure a workspace exists for this project
    if (!workspace || workspace.projectId !== project.id) {
      initWorkspace(project.id, project.defaultBranch);
    }
  }, [project, workspace, initWorkspace]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!project) return;
      setErrorMessage(null);
      const branchResult = await GitService.currentBranch(project.localPath);
      if (!cancelled) {
        setCurrentBranch(branchResult.success && branchResult.data ? branchResult.data : project.defaultBranch);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [project]);

  useEffect(() => {
    let cancelled = false;
    if (!project || activeTab !== 'files') return;
    setIsLoadingFiles(true);
    setErrorMessage(null);
    fetchProjectFileNodes(project.localPath)
      .then((nodes) => {
        if (cancelled) return;
        setFileNodes(nodes);
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : 'Failed to load files');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingFiles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project, activeTab]);

  useEffect(() => {
    let cancelled = false;
    const loadCommits = async () => {
      if (!project || activeTab !== 'commits') return;
      setIsLoadingCommits(true);
      setErrorMessage(null);
      const result = await GitService.log(project.localPath, 20);
      if (cancelled) return;

      if (!(result.success && Array.isArray(result.data))) {
        setErrorMessage(result.error || 'Failed to load commits');
        setIsLoadingCommits(false);
        return;
      }

      setCommits(
        result.data.map((c) => ({
          sha: c.oid.slice(0, 7),
          message: c.message?.split('\n')[0] ?? c.message ?? '',
          author: c.author?.name ?? 'Unknown',
          date: formatCommitDate(c.author?.timestamp ?? 0),
        }))
      );
      setIsLoadingCommits(false);
    };
    loadCommits();
    return () => {
      cancelled = true;
    };
  }, [project, activeTab]);

  if (!project) {
    return (
      <View className="flex-1 bg-charcoal items-center justify-center px-6">
        <Text variant="display" size="xl" className="text-white text-center mb-2">
          Project not found
        </Text>
        <Text className="text-neutral-500 text-center mb-6">
          This project ID doesn’t exist locally. Go back and create or select a project.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-surface px-4 py-3 active:bg-neutral-700"
          style={organicBorderRadius.button}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-white text-center font-semibold">Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: project.name }} />

      <View className="flex-1 bg-charcoal">
        {/* Header Info */}
        <Container padding="md" className="border-b border-neutral-800">
          <VStack spacing="sm">
            <Text size="sm" className="text-neutral-400" numberOfLines={1}>
              {project.repoUrl}
            </Text>

            <HStack spacing="sm" align="center">
              <Badge variant="secondary">{currentBranch || project.defaultBranch}</Badge>
              <Badge variant="success">{`${activeAgents} agents`}</Badge>
              <Badge variant="warning">{`${pendingTasks} tasks`}</Badge>
            </HStack>

            {errorMessage && (
              <Text size="sm" className="text-coral-400">
                {errorMessage}
              </Text>
            )}
          </VStack>
        </Container>

        {/* Tabs */}
        <View className="flex-row border-b border-neutral-800">
          {(['files', 'commits', 'tasks', 'agents'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 ${activeTab === tab ? 'border-b-2 border-coral-500' : ''}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${tab}`}
            >
              <Text
                className={`text-center capitalize ${activeTab === tab ? 'text-coral-500 font-semibold' : 'text-neutral-400'}`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Container padding="lg">
            {activeTab === 'files' && (
              <VStack spacing="md">
                <View className="bg-surface p-4" style={organicBorderRadius.card}>
                  <HStack justify="between" align="center" className="mb-3">
                    <Text weight="semibold" className="text-white">
                      Files
                    </Text>
                    {selectedFile && <Badge variant="secondary">Selected</Badge>}
                  </HStack>

                  {isLoadingFiles ? (
                    <Text className="text-neutral-500">Loading files…</Text>
                  ) : (
                    <FileTree
                      data={fileNodes}
                      selectedPath={selectedFile || undefined}
                      onSelectFile={(path) => setSelectedFile(path)}
                      showStatus={false}
                    />
                  )}
                </View>
              </VStack>
            )}

            {activeTab === 'commits' && (
              <VStack
                spacing="none"
                className="bg-surface"
                style={[organicBorderRadius.card, { overflow: 'hidden' }]}
              >
                <View className="px-4 py-3 border-b border-neutral-700">
                  <Text size="sm" weight="semibold" className="text-neutral-400">
                    COMMIT HISTORY
                  </Text>
                </View>
                <View className="px-4">
                  {isLoadingCommits ? (
                    <View className="py-6">
                      <Text className="text-neutral-500">Loading commits…</Text>
                    </View>
                  ) : commits.length === 0 ? (
                    <View className="py-6">
                      <Text className="text-neutral-500">No commits found.</Text>
                    </View>
                  ) : (
                    commits.map((c, idx) => (
                      <View key={`${c.sha}-${idx}`}>
                        <View className="py-4">
                          <HStack justify="between" align="center" className="mb-1">
                            <Text className="text-white flex-1" numberOfLines={1}>
                              {c.message}
                            </Text>
                            <Badge variant="secondary">{c.sha}</Badge>
                          </HStack>
                          <HStack spacing="sm" align="center">
                            <Text size="xs" className="text-neutral-500">
                              {c.author}
                            </Text>
                            <Text size="xs" className="text-neutral-600">
                              •
                            </Text>
                            <Text size="xs" className="text-neutral-500">
                              {c.date}
                            </Text>
                          </HStack>
                        </View>
                        {idx < commits.length - 1 && <Divider />}
                      </View>
                    ))
                  )}
                </View>
              </VStack>
            )}

            {activeTab === 'tasks' && (
              <VStack
                spacing="none"
                className="bg-surface"
                style={[organicBorderRadius.card, { overflow: 'hidden' }]}
              >
                <View className="px-4 py-3 border-b border-neutral-700">
                  <Text size="sm" weight="semibold" className="text-neutral-400">
                    TASKS
                  </Text>
                </View>
                <View className="px-4">
                  {scopedTasks.length === 0 ? (
                    <View className="py-6">
                      <Text className="text-neutral-500">No tasks yet.</Text>
                    </View>
                  ) : (
                    scopedTasks
                      .slice()
                      .sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .map((t, idx) => (
                        <View key={t.id}>
                          <View className="py-4">
                            <HStack justify="between" align="center" className="mb-1">
                              <Text className="text-white flex-1" numberOfLines={1}>
                                {t.description}
                              </Text>
                              <Badge
                                variant={
                                  t.status === 'completed'
                                    ? 'success'
                                    : t.status === 'failed'
                                      ? 'error'
                                      : 'warning'
                                }
                              >
                                {t.status.replaceAll('_', ' ')}
                              </Badge>
                            </HStack>
                            <Text size="xs" className="text-neutral-600">
                              {t.agentId}
                            </Text>
                          </View>
                          {idx < scopedTasks.length - 1 && <Divider />}
                        </View>
                      ))
                  )}
                </View>
              </VStack>
            )}

            {activeTab === 'agents' && (
              <VStack spacing="md">
                {agents.map((a) => (
                  <Pressable
                    key={a.id}
                    onPress={() => router.push(`/agent/${a.id}`)}
                    className="bg-surface p-4 active:bg-neutral-700"
                    style={organicBorderRadius.card}
                    accessibilityRole="button"
                    accessibilityLabel={`Open agent ${a.name}`}
                  >
                    <HStack justify="between" align="center">
                      <HStack spacing="md" align="center">
                        <Avatar name={a.name} size="sm" />
                        <VStack spacing="xs">
                          <Text weight="semibold" className="text-white">
                            {a.name}
                          </Text>
                          <Text size="xs" className="text-neutral-500 capitalize">
                            {a.role}
                          </Text>
                        </VStack>
                      </HStack>
                      <StatusBadge
                        status={
                          a.status === 'error'
                            ? 'error'
                            : a.status === 'idle'
                              ? 'inactive'
                              : 'pending'
                        }
                        label={a.status.replaceAll('_', ' ')}
                      />
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            )}
          </Container>
        </ScrollView>
      </View>
    </>
  );
}
