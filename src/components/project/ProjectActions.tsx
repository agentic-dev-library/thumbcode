/**
 * ProjectActions
 *
 * Renders the commits, tasks, and agents tab content for the project detail screen.
 */

import type { Agent, AgentTask } from '@thumbcode/state';
import { Pressable, View } from 'react-native';
import { Avatar, Badge, StatusBadge } from '@/components/display';
import { Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

interface CommitEntry {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface ProjectCommitsProps {
  commits: CommitEntry[];
  isLoading: boolean;
}

export function ProjectCommits({ commits, isLoading }: Readonly<ProjectCommitsProps>) {
  return (
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
        {isLoading ? (
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
  );
}

interface ProjectTasksProps {
  tasks: AgentTask[];
}

export function ProjectTasks({ tasks }: Readonly<ProjectTasksProps>) {
  const sortedTasks = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
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
        {sortedTasks.length === 0 ? (
          <View className="py-6">
            <Text className="text-neutral-500">No tasks yet.</Text>
          </View>
        ) : (
          sortedTasks.map((t, idx) => (
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
              {idx < sortedTasks.length - 1 && <Divider />}
            </View>
          ))
        )}
      </View>
    </VStack>
  );
}

interface ProjectAgentsProps {
  agents: Agent[];
  onAgentPress: (agentId: string) => void;
}

export function ProjectAgents({ agents, onAgentPress }: Readonly<ProjectAgentsProps>) {
  return (
    <VStack spacing="md">
      {agents.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => onAgentPress(a.id)}
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
  );
}
