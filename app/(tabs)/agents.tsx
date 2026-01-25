/**
 * Agents Screen
 *
 * Dashboard showing all AI agents, their status, and metrics.
 * Uses paint daube icons for brand consistency.
 */

import { type Agent as StoreAgent, selectAgents, useAgentStore } from '@thumbcode/state';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import {
  AgentIcon,
  type IconColor,
  LightningIcon,
  ReviewIcon,
  SearchIcon,
  StarIcon,
  SuccessIcon,
} from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

/** Agent avatar icon component */
type AgentAvatarIcon = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

function getStatusColor(
  status: StoreAgent['status']
): 'success' | 'pending' | 'error' | 'inactive' {
  switch (status) {
    case 'working':
    case 'needs_review':
      return 'success';
    case 'idle':
    case 'complete':
      return 'inactive';
    case 'error':
      return 'error';
    case 'awaiting_approval':
    case 'blocked':
      return 'pending';
    default:
      return 'inactive';
  }
}

function getRoleColor(role: StoreAgent['role']): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-500/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-teal-500/20';
    default:
      return 'bg-neutral-500/20';
  }
}

function getAvatarIcon(role: StoreAgent['role']): AgentAvatarIcon {
  switch (role) {
    case 'architect':
      return StarIcon;
    case 'implementer':
      return LightningIcon;
    case 'reviewer':
      return ReviewIcon;
    case 'tester':
      return SearchIcon;
  }
}

function getAvatarColor(role: StoreAgent['role']): IconColor {
  switch (role) {
    case 'architect':
      return 'gold';
    case 'implementer':
      return 'teal';
    case 'reviewer':
      return 'coral';
    case 'tester':
      return 'teal';
  }
}

export default function AgentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const agents = useAgentStore(selectAgents);
  const tasks = useAgentStore((s) => s.tasks);

  const filteredAgents = selectedRole
    ? agents.filter((agent) => agent.role === selectedRole)
    : agents;

  const activeAgents = agents.filter((a) => a.status !== 'idle').length;
  const totalTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <ScrollView
      className="flex-1 bg-charcoal"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Container padding="lg">
        {/* Overview */}
        <View className="flex-row gap-3 mb-6">
          <View className="bg-surface p-4 flex-1" style={organicBorderRadius.card}>
            <View className="mb-2">
              <AgentIcon size={28} color="coral" turbulence={0.2} />
            </View>
            <Text size="2xl" weight="bold" className="text-white">
              {activeAgents}/{agents.length}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Active Agents
            </Text>
          </View>

          <View className="bg-surface p-4 flex-1" style={organicBorderRadius.card}>
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
            style={organicBorderRadius.badge}
          >
            <Text className={!selectedRole ? 'text-white' : 'text-neutral-400'}>All</Text>
          </Pressable>

          {['architect', 'implementer', 'reviewer', 'tester'].map((role) => (
            <Pressable
              key={role}
              onPress={() => setSelectedRole(role)}
              className={`px-4 py-2 ${selectedRole === role ? 'bg-coral-500' : 'bg-surface'}`}
              style={organicBorderRadius.button}
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
              style={organicBorderRadius.card}
            >
              <HStack justify="between" align="start" className="mb-4">
                <HStack spacing="md" align="center">
                  <View
                    className={`w-14 h-14 items-center justify-center ${getRoleColor(agent.role)}`}
                    style={organicBorderRadius.card}
                  >
                    <View>
                      {(() => {
                        const AvatarIcon = getAvatarIcon(agent.role);
                        return (
                          <AvatarIcon
                            size={28}
                            color={getAvatarColor(agent.role)}
                            turbulence={0.25}
                          />
                        );
                      })()}
                    </View>
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
                  label={agent.status.replaceAll('_', ' ')}
                />
              </HStack>

              {(() => {
                if (!agent.currentTaskId) return null;
                const currentTask = tasks.find((t) => t.id === agent.currentTaskId);
                if (!currentTask) return null;
                const agentTasks = tasks.filter((t) => t.agentId === agent.id);
                const completed = agentTasks.filter((t) => t.status === 'completed').length;
                const total = agentTasks.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <View className="bg-charcoal p-3 mb-4" style={organicBorderRadius.card}>
                    <HStack justify="between" align="center" className="mb-2">
                      <Text size="sm" className="text-neutral-300 flex-1" numberOfLines={1}>
                        {currentTask.description}
                      </Text>
                      <Text size="sm" className="text-teal-400">
                        {progress}%
                      </Text>
                    </HStack>
                    <ProgressBar value={progress} color="secondary" size="sm" />
                  </View>
                );
              })()}

              <HStack justify="around">
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {tasks.filter((t) => t.agentId === agent.id && t.status === 'completed').length}
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Tasks
                  </Text>
                </VStack>
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {(() => {
                      const done = tasks.filter(
                        (t) => t.agentId === agent.id && t.status === 'completed'
                      ).length;
                      const failed = tasks.filter(
                        (t) => t.agentId === agent.id && t.status === 'failed'
                      ).length;
                      const denom = done + failed;
                      return denom > 0 ? `${Math.round((done / denom) * 100)}%` : '—';
                    })()}
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Success
                  </Text>
                </VStack>
                <VStack align="center">
                  <Text weight="semibold" className="text-white">
                    {
                      tasks.filter((t) => t.agentId === agent.id && t.status === 'in_progress')
                        .length
                    }
                  </Text>
                  <Text size="xs" className="text-neutral-500">
                    Active
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
