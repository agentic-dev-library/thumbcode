/**
 * Agents Screen
 *
 * Dashboard showing all AI agents, their status, and metrics.
 * Uses paint daube icons for brand consistency.
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import {
  AgentIcon,
  SuccessIcon,
  StarIcon,
  LightningIcon,
  ReviewIcon,
  SearchIcon,
  type IconColor,
} from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

/** Agent avatar icon component */
type AgentAvatarIcon = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

// Mock data
const MOCK_AGENTS: Array<{
  id: string;
  name: string;
  role: 'architect' | 'implementer' | 'reviewer' | 'tester';
  status: 'idle' | 'coding' | 'reviewing' | 'error' | 'waiting_approval';
  AvatarIcon: AgentAvatarIcon;
  avatarColor: IconColor;
  currentTask: { title: string; progress: number } | null;
  metrics: { tasksCompleted: number; successRate: number; avgTaskTime: number };
}> = [
  {
    id: '1',
    name: 'Architect',
    role: 'architect' as const,
    status: 'idle' as const,
    AvatarIcon: StarIcon,
    avatarColor: 'gold',
    currentTask: null,
    metrics: {
      tasksCompleted: 47,
      successRate: 0.94,
      avgTaskTime: 12, // minutes
    },
  },
  {
    id: '2',
    name: 'Implementer',
    role: 'implementer' as const,
    status: 'coding' as const,
    AvatarIcon: LightningIcon,
    avatarColor: 'teal',
    currentTask: {
      title: 'Add user authentication',
      progress: 65,
    },
    metrics: {
      tasksCompleted: 156,
      successRate: 0.89,
      avgTaskTime: 25,
    },
  },
  {
    id: '3',
    name: 'Reviewer',
    role: 'reviewer' as const,
    status: 'reviewing' as const,
    AvatarIcon: ReviewIcon,
    avatarColor: 'coral',
    currentTask: {
      title: 'Review PR #42',
      progress: 30,
    },
    metrics: {
      tasksCompleted: 89,
      successRate: 0.98,
      avgTaskTime: 8,
    },
  },
  {
    id: '4',
    name: 'Tester',
    role: 'tester' as const,
    status: 'idle' as const,
    AvatarIcon: SearchIcon,
    avatarColor: 'teal',
    currentTask: null,
    metrics: {
      tasksCompleted: 72,
      successRate: 0.91,
      avgTaskTime: 15,
    },
  },
];

function getStatusColor(status: string): 'success' | 'pending' | 'error' | 'inactive' {
  switch (status) {
    case 'coding':
    case 'reviewing':
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

export default function AgentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const filteredAgents = selectedRole
    ? MOCK_AGENTS.filter((agent) => agent.role === selectedRole)
    : MOCK_AGENTS;

  const activeAgents = MOCK_AGENTS.filter((a) => a.status !== 'idle').length;
  const totalTasks = MOCK_AGENTS.reduce((acc, a) => acc + a.metrics.tasksCompleted, 0);

  return (
    <ScrollView
      className="flex-1 bg-charcoal"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Container padding="lg">
        {/* Overview */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="bg-surface p-4 flex-1"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="mb-2">
              <AgentIcon size={28} color="coral" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {activeAgents}/{MOCK_AGENTS.length}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Active Agents
            </Text>
          </View>

          <View
            className="bg-surface p-4 flex-1"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="mb-2">
              <SuccessIcon size={28} color="teal" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {totalTasks}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Tasks Completed
            </Text>
          </View>
        </View>

        {/* Role Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedRole(null)}
            className={`px-4 py-2 ${!selectedRole ? 'bg-coral-500' : 'bg-surface'}`}
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 12,
              borderBottomLeftRadius: 6,
            }}
          >
            <Text className={!selectedRole ? 'text-white' : 'text-neutral-400'}>All</Text>
          </Pressable>

          {['architect', 'implementer', 'reviewer', 'tester'].map((role) => (
            <Pressable
              key={role}
              onPress={() => setSelectedRole(role)}
              className={`px-4 py-2 ${selectedRole === role ? 'bg-coral-500' : 'bg-surface'}`}
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 6,
              }}
            >
              <Text
                className={`capitalize ${selectedRole === role ? 'text-white' : 'text-neutral-400'}`}
              >
                {role}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Agent Cards */}
        <VStack spacing="md">
          {filteredAgents.map((agent) => (
            <Pressable
              key={agent.id}
              onPress={() => router.push(`/agent/${agent.id}`)}
              className="bg-surface p-4 active:bg-neutral-700"
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 16,
                borderBottomLeftRadius: 10,
              }}
            >
              <HStack justify="between" align="start" className="mb-4">
                <HStack spacing="md" align="center">
                  <View
                    className={`w-14 h-14 items-center justify-center ${getRoleColor(agent.role)}`}
                    style={{
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 14,
                      borderBottomRightRadius: 18,
                      borderBottomLeftRadius: 12,
                    }}
                  >
                    <agent.AvatarIcon size={28} color={agent.avatarColor} turbulence={0.25} />
                  </View>
                  <VStack spacing="xs">
                    <Text weight="semibold" className="text-white text-lg">
                      {agent.name}
                    </Text>
                    <Text size="sm" className="text-neutral-400 capitalize">
                      {agent.role}
                    </Text>
                  </VStack>
                </HStack>
                <StatusBadge
                  status={getStatusColor(agent.status)}
                  label={agent.status.replace('_', ' ')}
                />
              </HStack>

              {agent.currentTask && (
                <View className="bg-charcoal p-3 mb-4 rounded-lg">
                  <HStack justify="between" align="center" className="mb-2">
                    <Text size="sm" className="text-neutral-300">
                      {agent.currentTask.title}
                    </Text>
                    <Text size="sm" className="text-teal-400">
                      {agent.currentTask.progress}%
                    </Text>
                  </HStack>
                  <ProgressBar value={agent.currentTask.progress} color="secondary" size="sm" />
                </View>
              )}

              <HStack justify="around">
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {agent.metrics.tasksCompleted}
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Tasks
                  </Text>
                </VStack>
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {Math.round(agent.metrics.successRate * 100)}%
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Success
                  </Text>
                </VStack>
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {agent.metrics.avgTaskTime}m
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Avg Time
                  </Text>
                </VStack>
              </HStack>
            </Pressable>
          ))}
        </VStack>
      </Container>
    </ScrollView>
  );
}
