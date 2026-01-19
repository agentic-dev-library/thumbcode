/**
 * Home Screen (Dashboard)
 *
 * Main dashboard showing overview of projects, agents, and recent activity.
 * Uses paint daube icons for brand consistency.
 */

import { useRouter } from 'expo-router';
import type React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import {
  AgentIcon,
  BellIcon,
  EditIcon,
  FolderIcon,
  SuccessIcon,
  TasksIcon,
} from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

// Mock data - in production, would come from stores
const MOCK_STATS = {
  activeProjects: 3,
  runningAgents: 2,
  pendingTasks: 7,
  completedToday: 12,
};

const MOCK_ACTIVITY = [
  {
    id: '1',
    type: 'commit',
    agent: 'Implementer',
    message: 'Added user authentication module',
    project: 'my-awesome-app',
    time: '5 min ago',
  },
  {
    id: '2',
    type: 'review',
    agent: 'Reviewer',
    message: 'Approved PR #42: API endpoints',
    project: 'api-service',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'task',
    agent: 'Architect',
    message: 'Created task breakdown for feature X',
    project: 'my-awesome-app',
    time: '1 hour ago',
  },
];

const MOCK_AGENTS = [
  { id: '1', name: 'Architect', role: 'architect', status: 'idle' as const },
  { id: '2', name: 'Implementer', role: 'implementer', status: 'coding' as const },
  { id: '3', name: 'Reviewer', role: 'reviewer', status: 'reviewing' as const },
  { id: '4', name: 'Tester', role: 'tester', status: 'idle' as const },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'coding':
    case 'reviewing':
      return 'bg-teal-500';
    case 'idle':
      return 'bg-neutral-500';
    case 'error':
      return 'bg-coral-500';
    default:
      return 'bg-gold-500';
  }
}

/** Returns the appropriate icon component for activity type */
function ActivityIcon({ type, size = 20 }: { type: string; size?: number }): React.ReactElement {
  const iconProps = { size, turbulence: 0.2 };
  switch (type) {
    case 'commit':
      return <EditIcon {...iconProps} color="teal" />;
    case 'review':
      return <SuccessIcon {...iconProps} color="teal" />;
    case 'task':
      return <TasksIcon {...iconProps} color="gold" />;
    default:
      return <BellIcon {...iconProps} color="coral" />;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-charcoal"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Container padding="lg">
        {/* Welcome */}
        <VStack spacing="xs" className="mb-6">
          <Text size="sm" className="text-neutral-400">
            Welcome back
          </Text>
          <Text variant="display" size="2xl" weight="bold" className="text-white">
            Dashboard
          </Text>
        </VStack>

        {/* Quick Stats */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View
            className="bg-surface p-4 flex-1 min-w-[140px]"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="mb-2">
              <FolderIcon size={32} color="teal" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {MOCK_STATS.activeProjects}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Active Projects
            </Text>
          </View>

          <View
            className="bg-surface p-4 flex-1 min-w-[140px]"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="mb-2">
              <AgentIcon size={32} color="coral" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {MOCK_STATS.runningAgents}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Running Agents
            </Text>
          </View>

          <View
            className="bg-surface p-4 flex-1 min-w-[140px]"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="mb-2">
              <TasksIcon size={32} color="gold" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {MOCK_STATS.pendingTasks}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Pending Tasks
            </Text>
          </View>
        </View>

        {/* Agent Status */}
        <VStack spacing="md" className="mb-6">
          <HStack justify="between" align="center">
            <Text weight="semibold" className="text-white text-lg">
              Agent Team
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/agents')}>
              <Text size="sm" className="text-coral-500">
                View All →
              </Text>
            </Pressable>
          </HStack>

          <View className="flex-row flex-wrap gap-3">
            {MOCK_AGENTS.map((agent) => (
              <Pressable
                key={agent.id}
                onPress={() => router.push(`/agent/${agent.id}`)}
                className="bg-surface p-3 flex-row items-center"
                style={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 14,
                  borderBottomLeftRadius: 8,
                }}
              >
                <Avatar name={agent.name} size="sm" />
                <VStack spacing="none" className="ml-3">
                  <Text size="sm" weight="semibold" className="text-white">
                    {agent.name}
                  </Text>
                  <HStack spacing="xs" align="center">
                    <View className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <Text size="xs" className="text-neutral-400 capitalize">
                      {agent.status}
                    </Text>
                  </HStack>
                </VStack>
              </Pressable>
            ))}
          </View>
        </VStack>

        {/* Today's Progress */}
        <View
          className="bg-surface p-4 mb-6"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 10,
          }}
        >
          <HStack justify="between" align="center" className="mb-3">
            <Text weight="semibold" className="text-white">
              Today's Progress
            </Text>
            <Badge variant="success">{`${MOCK_STATS.completedToday} done`}</Badge>
          </HStack>
          <ProgressBar
            value={
              MOCK_STATS.completedToday + MOCK_STATS.pendingTasks > 0
                ? (MOCK_STATS.completedToday /
                    (MOCK_STATS.completedToday + MOCK_STATS.pendingTasks)) *
                  100
                : 0
            }
            color="secondary"
          />
        </View>

        {/* Recent Activity */}
        <VStack spacing="md">
          <HStack justify="between" align="center">
            <Text weight="semibold" className="text-white text-lg">
              Recent Activity
            </Text>
            <Pressable>
              <Text size="sm" className="text-coral-500">
                See All →
              </Text>
            </Pressable>
          </HStack>

          <VStack spacing="sm">
            {MOCK_ACTIVITY.map((activity) => (
              <View
                key={activity.id}
                className="bg-surface p-4 flex-row"
                style={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 14,
                  borderBottomLeftRadius: 8,
                }}
              >
                <View
                  className="w-10 h-10 bg-charcoal items-center justify-center mr-3"
                  style={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 14,
                    borderBottomLeftRadius: 8,
                  }}
                >
                  <ActivityIcon type={activity.type} />
                </View>
                <VStack spacing="xs" className="flex-1">
                  <Text size="sm" className="text-white">
                    {activity.message}
                  </Text>
                  <HStack spacing="sm">
                    <Text size="xs" className="text-teal-400">
                      {activity.agent}
                    </Text>
                    <Text size="xs" className="text-neutral-500">
                      •
                    </Text>
                    <Text size="xs" className="text-neutral-500">
                      {activity.project}
                    </Text>
                    <Text size="xs" className="text-neutral-500">
                      •
                    </Text>
                    <Text size="xs" className="text-neutral-500">
                      {activity.time}
                    </Text>
                  </HStack>
                </VStack>
              </View>
            ))}
          </VStack>
        </VStack>
      </Container>
    </ScrollView>
  );
}
