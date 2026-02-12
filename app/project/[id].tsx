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
import { type FileNode as FileTreeNode } from '@/components/code';
import { Container } from '@/components/layout';
import {
  ProjectAgents,
  ProjectCommits,
  ProjectFileExplorer,
  ProjectHeader,
  ProjectTasks,
} from '@/components/project';
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
    return tasks;
  }, [tasks]);

  const activeAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = scopedTasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;

  useEffect(() => {
    if (!project) return;
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
        setCurrentBranch(
          branchResult.success && branchResult.data ? branchResult.data : project.defaultBranch
        );
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
          This project ID doesn't exist locally. Go back and create or select a project.
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
        <ProjectHeader
          repoUrl={project.repoUrl}
          currentBranch={currentBranch || project.defaultBranch}
          defaultBranch={project.defaultBranch}
          activeAgents={activeAgents}
          pendingTasks={pendingTasks}
          errorMessage={errorMessage}
        />

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
              <ProjectFileExplorer
                fileNodes={fileNodes}
                isLoading={isLoadingFiles}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            )}

            {activeTab === 'commits' && (
              <ProjectCommits commits={commits} isLoading={isLoadingCommits} />
            )}

            {activeTab === 'tasks' && <ProjectTasks tasks={scopedTasks} />}

            {activeTab === 'agents' && (
              <ProjectAgents
                agents={agents}
                onAgentPress={(agentId) => router.push(`/agent/${agentId}`)}
              />
            )}
          </Container>
        </ScrollView>
      </View>
    </>
  );
}
