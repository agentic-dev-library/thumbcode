/**
 * Project Detail Screen
 *
 * Shows project details, file browser, commit history, and agent activity.
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileTree } from '@/components/code';
import { Avatar, Badge, StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

// Mock data
const MOCK_PROJECT = {
  id: '1',
  name: 'My Awesome App',
  description: 'A React Native app built with ThumbCode',
  repository: {
    provider: 'github',
    owner: 'user',
    name: 'my-awesome-app',
    defaultBranch: 'main',
  },
  currentBranch: 'feature/auth',
  pendingTasks: 3,
  completedTasks: 12,
  activeAgents: 2,
};

const MOCK_FILES = [
  {
    name: 'src',
    type: 'folder' as const,
    path: 'src',
    children: [
      {
        name: 'components',
        type: 'folder' as const,
        path: 'src/components',
        children: [
          { name: 'Button.tsx', type: 'file' as const, path: 'src/components/Button.tsx' },
          {
            name: 'Input.tsx',
            type: 'file' as const,
            path: 'src/components/Input.tsx',
            modified: true,
          },
        ],
      },
      {
        name: 'services',
        type: 'folder' as const,
        path: 'src/services',
        children: [
          { name: 'auth.ts', type: 'file' as const, path: 'src/services/auth.ts', added: true },
          { name: 'api.ts', type: 'file' as const, path: 'src/services/api.ts' },
        ],
      },
      { name: 'App.tsx', type: 'file' as const, path: 'src/App.tsx', modified: true },
    ],
  },
  { name: 'package.json', type: 'file' as const, path: 'package.json' },
  { name: 'README.md', type: 'file' as const, path: 'README.md' },
];

const MOCK_COMMITS = [
  {
    sha: 'abc1234',
    message: 'Add user authentication module',
    author: 'Implementer',
    date: '2 hours ago',
  },
  {
    sha: 'def5678',
    message: 'Create API service layer',
    author: 'Implementer',
    date: '4 hours ago',
  },
  {
    sha: 'ghi9012',
    message: 'Initial project setup',
    author: 'Architect',
    date: '1 day ago',
  },
];

type Tab = 'files' | 'commits' | 'tasks' | 'agents';

export default function ProjectDetailScreen() {
  const { id: _id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const progress =
    (MOCK_PROJECT.completedTasks / (MOCK_PROJECT.completedTasks + MOCK_PROJECT.pendingTasks)) * 100;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: MOCK_PROJECT.name,
        }}
      />

      <View className="flex-1 bg-charcoal">
        {/* Header Info */}
        <Container padding="md" className="border-b border-neutral-800">
          <VStack spacing="sm">
            <Text size="sm" className="text-neutral-400">
              {MOCK_PROJECT.repository.owner}/{MOCK_PROJECT.repository.name}
            </Text>

            <HStack spacing="md">
              <Badge variant="secondary">{MOCK_PROJECT.currentBranch}</Badge>
              <Badge variant="success">{`${MOCK_PROJECT.activeAgents} agents`}</Badge>
              <Badge variant="warning">{`${MOCK_PROJECT.pendingTasks} tasks`}</Badge>
            </HStack>

            <View>
              <HStack justify="between" className="mb-1">
                <Text size="sm" className="text-neutral-400">
                  Progress
                </Text>
                <Text size="sm" className="text-teal-400">
                  {Math.round(progress)}%
                </Text>
              </HStack>
              <ProgressBar value={progress} color="secondary" size="sm" />
            </View>
          </VStack>
        </Container>

        {/* Tabs */}
        <View className="flex-row border-b border-neutral-800">
          {(['files', 'commits', 'tasks', 'agents'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 ${activeTab === tab ? 'border-b-2 border-coral-500' : ''}`}
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'files' && (
            <Container padding="md">
              <FileTree
                data={MOCK_FILES}
                selectedPath={selectedFile || undefined}
                onSelectFile={setSelectedFile}
                defaultExpanded={['src', 'src/components', 'src/services']}
              />
            </Container>
          )}

          {activeTab === 'commits' && (
            <Container padding="md">
              <VStack spacing="sm">
                {MOCK_COMMITS.map((commit) => (
                  <View
                    key={commit.sha}
                    className="bg-surface p-4"
                    style={{
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 14,
                      borderBottomLeftRadius: 8,
                    }}
                  >
                    <Text className="text-white mb-2">{commit.message}</Text>
                    <HStack spacing="md">
                      <Text size="sm" className="text-teal-400">
                        {commit.author}
                      </Text>
                      <Text size="sm" className="text-neutral-500">
                        {commit.sha.slice(0, 7)}
                      </Text>
                      <Text size="sm" className="text-neutral-500">
                        {commit.date}
                      </Text>
                    </HStack>
                  </View>
                ))}
              </VStack>
            </Container>
          )}

          {activeTab === 'tasks' && (
            <Container padding="md">
              <VStack spacing="sm">
                {[
                  {
                    id: '1',
                    title: 'Implement OAuth flow',
                    status: 'in_progress',
                    assignee: 'Implementer',
                  },
                  {
                    id: '2',
                    title: 'Add error handling',
                    status: 'pending',
                    assignee: 'Implementer',
                  },
                  { id: '3', title: 'Write unit tests', status: 'pending', assignee: 'Tester' },
                ].map((task) => (
                  <View
                    key={task.id}
                    className="bg-surface p-4"
                    style={{
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 14,
                      borderBottomLeftRadius: 8,
                    }}
                  >
                    <HStack justify="between" align="center">
                      <VStack spacing="xs" className="flex-1">
                        <Text className="text-white">{task.title}</Text>
                        <Text size="sm" className="text-neutral-500">
                          Assigned to {task.assignee}
                        </Text>
                      </VStack>
                      <StatusBadge
                        status={task.status === 'in_progress' ? 'success' : 'inactive'}
                        label={task.status.replace('_', ' ')}
                      />
                    </HStack>
                  </View>
                ))}
              </VStack>
            </Container>
          )}

          {activeTab === 'agents' && (
            <Container padding="md">
              <VStack spacing="sm">
                {[
                  { id: '1', name: 'Implementer', status: 'coding', task: 'OAuth implementation' },
                  { id: '2', name: 'Reviewer', status: 'idle', task: null },
                ].map((agent) => (
                  <Pressable
                    key={agent.id}
                    onPress={() => router.push(`/agent/${agent.id}`)}
                    className="bg-surface p-4 active:bg-neutral-700"
                    style={{
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 14,
                      borderBottomLeftRadius: 8,
                    }}
                  >
                    <HStack justify="between" align="center">
                      <HStack spacing="md" align="center">
                        <Avatar name={agent.name} size="md" />
                        <VStack spacing="xs">
                          <Text weight="semibold" className="text-white">
                            {agent.name}
                          </Text>
                          {agent.task && (
                            <Text size="sm" className="text-neutral-400">
                              {agent.task}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <StatusBadge
                        status={agent.status === 'coding' ? 'success' : 'inactive'}
                        label={agent.status}
                      />
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </Container>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View
          className="border-t border-neutral-800 px-4 py-3 flex-row gap-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Pressable
            className="flex-1 bg-surface py-3 active:bg-neutral-700"
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 14,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text className="text-center text-white">Pull</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-teal-600 py-3 active:bg-teal-700"
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 14,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text className="text-center text-white font-semibold">Commit</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-coral-500 py-3 active:bg-coral-600"
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 14,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text className="text-center text-white font-semibold">Push</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
