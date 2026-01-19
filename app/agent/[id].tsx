/**
 * Agent Detail Screen
 *
 * Shows detailed agent information, metrics, task history, and controls.
 * Uses paint daube icons for brand consistency.
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import {
  type IconColor,
  LightningIcon,
  ReviewIcon,
  StarIcon,
  SuccessIcon,
  TestIcon,
} from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

/** Agent avatar icon component type */
type AgentAvatarIcon = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

// Mock data
const MOCK_AGENTS: Record<
  string,
  {
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'coding' | 'reviewing' | 'testing' | 'waiting_approval' | 'error';
    AvatarIcon: AgentAvatarIcon;
    avatarColor: IconColor;
    description: string;
    currentTask: { id: string; title: string; progress: number } | null;
    metrics: {
      tasksCompleted: number;
      successRate: number;
      avgTaskTime: number;
      totalCodingTime: number;
    };
    taskHistory: Array<{
      id: string;
      title: string;
      status: 'completed' | 'failed' | 'cancelled';
      completedAt: string;
      duration: number;
    }>;
  }
> = {
  '1': {
    id: '1',
    name: 'Architect',
    role: 'architect',
    status: 'idle',
    AvatarIcon: StarIcon,
    avatarColor: 'gold',
    description:
      'Designs system architecture, creates task breakdowns, and coordinates agent workflows.',
    currentTask: null,
    metrics: {
      tasksCompleted: 47,
      successRate: 0.94,
      avgTaskTime: 12,
      totalCodingTime: 564,
    },
    taskHistory: [
      {
        id: 't1',
        title: 'Design authentication flow',
        status: 'completed',
        completedAt: '2 hours ago',
        duration: 15,
      },
      {
        id: 't2',
        title: 'Create API schema',
        status: 'completed',
        completedAt: '5 hours ago',
        duration: 22,
      },
      {
        id: 't3',
        title: 'Plan database structure',
        status: 'completed',
        completedAt: '1 day ago',
        duration: 18,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Implementer',
    role: 'implementer',
    status: 'coding',
    AvatarIcon: LightningIcon,
    avatarColor: 'teal',
    description:
      'Writes code, implements features, and resolves technical issues based on architectural plans.',
    currentTask: {
      id: 'ct1',
      title: 'Add user authentication',
      progress: 65,
    },
    metrics: {
      tasksCompleted: 156,
      successRate: 0.89,
      avgTaskTime: 25,
      totalCodingTime: 3900,
    },
    taskHistory: [
      {
        id: 't1',
        title: 'Create login form',
        status: 'completed',
        completedAt: '30 min ago',
        duration: 18,
      },
      {
        id: 't2',
        title: 'Implement API client',
        status: 'completed',
        completedAt: '2 hours ago',
        duration: 35,
      },
      {
        id: 't3',
        title: 'Add navigation',
        status: 'completed',
        completedAt: '4 hours ago',
        duration: 20,
      },
      {
        id: 't4',
        title: 'Setup TypeScript',
        status: 'failed',
        completedAt: '6 hours ago',
        duration: 45,
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Reviewer',
    role: 'reviewer',
    status: 'reviewing',
    AvatarIcon: ReviewIcon,
    avatarColor: 'coral',
    description:
      'Reviews code changes, ensures quality standards, and provides feedback to implementers.',
    currentTask: {
      id: 'ct1',
      title: 'Review PR #42',
      progress: 30,
    },
    metrics: {
      tasksCompleted: 89,
      successRate: 0.98,
      avgTaskTime: 8,
      totalCodingTime: 712,
    },
    taskHistory: [
      {
        id: 't1',
        title: 'Review auth module',
        status: 'completed',
        completedAt: '1 hour ago',
        duration: 12,
      },
      {
        id: 't2',
        title: 'Review API changes',
        status: 'completed',
        completedAt: '3 hours ago',
        duration: 8,
      },
    ],
  },
  '4': {
    id: '4',
    name: 'Tester',
    role: 'tester',
    status: 'idle',
    AvatarIcon: TestIcon,
    avatarColor: 'teal',
    description: 'Writes and runs tests, validates functionality, and reports bugs to the team.',
    currentTask: null,
    metrics: {
      tasksCompleted: 72,
      successRate: 0.91,
      avgTaskTime: 15,
      totalCodingTime: 1080,
    },
    taskHistory: [
      {
        id: 't1',
        title: 'Test login flow',
        status: 'completed',
        completedAt: '1 day ago',
        duration: 20,
      },
      {
        id: 't2',
        title: 'Write unit tests',
        status: 'completed',
        completedAt: '2 days ago',
        duration: 35,
      },
    ],
  },
};

function getStatusColor(status: string): 'success' | 'pending' | 'error' | 'inactive' {
  switch (status) {
    case 'coding':
    case 'reviewing':
    case 'testing':
      return 'success';
    case 'idle':
      return 'inactive';
    case 'error':
      return 'error';
    case 'waiting_approval':
      return 'pending';
    default:
      return 'inactive';
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-500/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-purple-500/20';
    default:
      return 'bg-neutral-500/20';
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const _router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const agent = MOCK_AGENTS[id || '1'];

  if (!agent) {
    return (
      <View className="flex-1 bg-charcoal items-center justify-center">
        <Text className="text-white">Agent not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: agent.name,
          headerBackTitle: 'Back',
        }}
      />

      <View className="flex-1 bg-charcoal">
        {/* Header */}
        <Container padding="lg" className="border-b border-neutral-800">
          <HStack spacing="lg" align="center">
            <View
              className={`w-20 h-20 items-center justify-center ${getRoleColor(agent.role)}`}
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 18,
                borderBottomRightRadius: 22,
                borderBottomLeftRadius: 16,
              }}
            >
              <agent.AvatarIcon size={40} color={agent.avatarColor} turbulence={0.25} />
            </View>

            <VStack spacing="xs" className="flex-1">
              <HStack spacing="sm" align="center">
                <Text size="xl" weight="bold" className="text-white">
                  {agent.name}
                </Text>
                <StatusBadge
                  status={getStatusColor(agent.status)}
                  label={agent.status.replace('_', ' ')}
                />
              </HStack>
              <Text size="sm" className="text-neutral-400 capitalize">
                {agent.role}
              </Text>
              <Text size="sm" className="text-neutral-500" numberOfLines={2}>
                {agent.description}
              </Text>
            </VStack>
          </HStack>
        </Container>

        {/* Current Task */}
        {agent.currentTask && (
          <Container padding="md" className="border-b border-neutral-800">
            <View
              className="bg-surface p-4"
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 16,
                borderBottomLeftRadius: 10,
              }}
            >
              <HStack justify="between" align="center" className="mb-2">
                <Text size="sm" className="text-neutral-400">
                  Current Task
                </Text>
                <Badge variant="success">In Progress</Badge>
              </HStack>
              <Text className="text-white mb-3">{agent.currentTask.title}</Text>
              <HStack justify="between" align="center" className="mb-2">
                <Text size="sm" className="text-neutral-500">
                  Progress
                </Text>
                <Text size="sm" className="text-teal-400">
                  {agent.currentTask.progress}%
                </Text>
              </HStack>
              <ProgressBar value={agent.currentTask.progress} color="secondary" size="md" />
            </View>
          </Container>
        )}

        {/* Tabs */}
        <View className="flex-row border-b border-neutral-800">
          {(['overview', 'history'] as const).map((tab) => (
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
          {activeTab === 'overview' && (
            <Container padding="md">
              {/* Metrics Grid */}
              <Text size="sm" weight="semibold" className="text-neutral-400 mb-3">
                PERFORMANCE METRICS
              </Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                <View
                  className="bg-surface p-4 flex-1"
                  style={{
                    minWidth: '45%',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Text size="2xl" weight="bold" className="text-white">
                    {agent.metrics.tasksCompleted}
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    Tasks Completed
                  </Text>
                </View>

                <View
                  className="bg-surface p-4 flex-1"
                  style={{
                    minWidth: '45%',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Text size="2xl" weight="bold" className="text-teal-400">
                    {Math.round(agent.metrics.successRate * 100)}%
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    Success Rate
                  </Text>
                </View>

                <View
                  className="bg-surface p-4 flex-1"
                  style={{
                    minWidth: '45%',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Text size="2xl" weight="bold" className="text-white">
                    {agent.metrics.avgTaskTime}m
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    Avg Task Time
                  </Text>
                </View>

                <View
                  className="bg-surface p-4 flex-1"
                  style={{
                    minWidth: '45%',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Text size="2xl" weight="bold" className="text-gold-400">
                    {formatMinutes(agent.metrics.totalCodingTime)}
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    Total Time
                  </Text>
                </View>
              </View>

              {/* Capabilities */}
              <Text size="sm" weight="semibold" className="text-neutral-400 mb-3">
                CAPABILITIES
              </Text>
              <View
                className="bg-surface p-4 mb-6"
                style={{
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 16,
                  borderBottomLeftRadius: 10,
                }}
              >
                <VStack spacing="sm">
                  {getCapabilities(agent.role).map((capability) => (
                    <HStack key={capability} spacing="sm" align="center">
                      <SuccessIcon size={16} color="teal" turbulence={0.2} />
                      <Text className="text-neutral-300">{capability}</Text>
                    </HStack>
                  ))}
                </VStack>
              </View>

              {/* Recent Activity */}
              {agent.taskHistory.length > 0 && (
                <>
                  <Text size="sm" weight="semibold" className="text-neutral-400 mb-3">
                    RECENT ACTIVITY
                  </Text>
                  <VStack spacing="sm">
                    {agent.taskHistory.slice(0, 3).map((task) => (
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
                        <HStack justify="between" align="start">
                          <VStack spacing="xs" className="flex-1">
                            <Text className="text-white">{task.title}</Text>
                            <HStack spacing="md">
                              <Text size="sm" className="text-neutral-500">
                                {task.completedAt}
                              </Text>
                              <Text size="sm" className="text-neutral-500">
                                {task.duration}m
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge
                            variant={
                              task.status === 'completed'
                                ? 'success'
                                : task.status === 'failed'
                                  ? 'error'
                                  : 'secondary'
                            }
                          >
                            {task.status}
                          </Badge>
                        </HStack>
                      </View>
                    ))}
                  </VStack>
                </>
              )}
            </Container>
          )}

          {activeTab === 'history' && (
            <Container padding="md">
              <VStack spacing="sm">
                {agent.taskHistory.length === 0 ? (
                  <View className="py-12 items-center">
                    <Text className="text-neutral-500">No task history yet</Text>
                  </View>
                ) : (
                  agent.taskHistory.map((task) => (
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
                      <HStack justify="between" align="start">
                        <VStack spacing="xs" className="flex-1">
                          <Text className="text-white">{task.title}</Text>
                          <HStack spacing="md">
                            <Text size="sm" className="text-neutral-500">
                              {task.completedAt}
                            </Text>
                            <Text size="sm" className="text-neutral-500">
                              Duration: {task.duration}m
                            </Text>
                          </HStack>
                        </VStack>
                        <Badge
                          variant={
                            task.status === 'completed'
                              ? 'success'
                              : task.status === 'failed'
                                ? 'error'
                                : 'secondary'
                          }
                        >
                          {task.status}
                        </Badge>
                      </HStack>
                    </View>
                  ))
                )}
              </VStack>
            </Container>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View
          className="border-t border-neutral-800 px-4 py-3 flex-row gap-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {agent.status === 'idle' ? (
            <Pressable
              className="flex-1 bg-teal-600 py-3 active:bg-teal-700"
              style={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 14,
                borderBottomLeftRadius: 8,
              }}
            >
              <Text className="text-center text-white font-semibold">Assign Task</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                className="flex-1 bg-surface py-3 active:bg-neutral-700"
                style={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 14,
                  borderBottomLeftRadius: 8,
                }}
              >
                <Text className="text-center text-white">Pause</Text>
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
                <Text className="text-center text-white font-semibold">View Output</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </>
  );
}

function getCapabilities(role: string): string[] {
  switch (role) {
    case 'architect':
      return [
        'System design and architecture',
        'Task breakdown and planning',
        'Technology selection',
        'Workflow coordination',
        'Documentation generation',
      ];
    case 'implementer':
      return [
        'Feature implementation',
        'Bug fixes and debugging',
        'Code optimization',
        'API integration',
        'UI component development',
      ];
    case 'reviewer':
      return [
        'Code review and feedback',
        'Quality assurance',
        'Security analysis',
        'Best practices enforcement',
        'Performance review',
      ];
    case 'tester':
      return [
        'Unit test creation',
        'Integration testing',
        'End-to-end testing',
        'Bug reporting',
        'Test coverage analysis',
      ];
    default:
      return [];
  }
}
