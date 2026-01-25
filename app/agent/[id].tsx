/**
 * Agent Detail Screen
 *
 * Production agent detail backed by @thumbcode/state.
 */

import { type Agent, useAgentStore } from '@thumbcode/state';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import { type IconColor, LightningIcon, ReviewIcon, StarIcon, TestIcon } from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

type AgentAvatarIcon = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

const ROLE_DESCRIPTION: Record<Agent['role'], string> = {
  architect:
    'Designs system architecture, creates task breakdowns, and coordinates agent workflows.',
  implementer:
    'Writes code, implements features, and resolves technical issues based on architectural plans.',
  reviewer:
    'Reviews code quality, identifies bugs, ensures best practices, and provides detailed feedback.',
  tester:
    'Creates and runs tests, validates functionality, and ensures high-quality releases with good coverage.',
};

function getStatusColor(status: Agent['status']): 'success' | 'pending' | 'error' | 'inactive' {
  switch (status) {
    case 'working':
    case 'needs_review':
    case 'complete':
      return 'success';
    case 'awaiting_approval':
    case 'blocked':
      return 'pending';
    case 'error':
      return 'error';
    default:
      return 'inactive';
  }
}

function getRoleColor(role: Agent['role']): string {
  switch (role) {
    case 'architect':
      return 'bg-gold-500/20';
    case 'implementer':
      return 'bg-teal-500/20';
    case 'reviewer':
      return 'bg-coral-500/20';
    case 'tester':
      return 'bg-teal-500/20';
  }
}

function getAvatarIcon(role: Agent['role']): AgentAvatarIcon {
  switch (role) {
    case 'architect':
      return StarIcon;
    case 'implementer':
      return LightningIcon;
    case 'reviewer':
      return ReviewIcon;
    case 'tester':
      return TestIcon;
  }
}

function getAvatarColor(role: Agent['role']): IconColor {
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

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AgentDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const agent = useAgentStore((s) => s.agents.find((a) => a.id === id));
  const tasks = useAgentStore((s) => s.tasks.filter((t) => t.agentId === id));
  const updateAgentStatus = useAgentStore((s) => s.updateAgentStatus);

  const currentTask = useMemo(() => {
    if (!agent?.currentTaskId) return null;
    return tasks.find((t) => t.id === agent.currentTaskId) ?? null;
  }, [agent?.currentTaskId, tasks]);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const failed = tasks.filter((t) => t.status === 'failed').length;
  const denom = completed + failed;
  const successRate = denom > 0 ? Math.round((completed / denom) * 100) : null;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (!id || !agent) {
    return (
      <View className="flex-1 bg-charcoal items-center justify-center px-6">
        <Text variant="display" size="xl" className="text-white text-center mb-2">
          Agent not found
        </Text>
        <Text className="text-neutral-500 text-center mb-6">
          This agent ID doesn’t exist in local state. Go back and select an agent from the list.
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

  const AvatarIcon = getAvatarIcon(agent.role);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: agent.name,
          headerBackTitle: 'Back',
        }}
      />

      <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <Container padding="lg" className="border-b border-neutral-800">
          <HStack spacing="lg" align="center">
            <View
              className={`w-20 h-20 items-center justify-center ${getRoleColor(agent.role)}`}
              style={organicBorderRadius.hero}
            >
              <AvatarIcon size={40} color={getAvatarColor(agent.role)} turbulence={0.25} />
            </View>

            <VStack spacing="xs" className="flex-1">
              <HStack spacing="sm" align="center">
                <Text size="xl" weight="bold" className="text-white">
                  {agent.name}
                </Text>
                <StatusBadge
                  status={getStatusColor(agent.status)}
                  label={agent.status.replaceAll('_', ' ')}
                />
              </HStack>
              <Text size="sm" className="text-neutral-400 capitalize">
                {agent.role}
              </Text>
              <Text size="sm" className="text-neutral-500" numberOfLines={2}>
                {ROLE_DESCRIPTION[agent.role]}
              </Text>
            </VStack>
          </HStack>
        </Container>

        {/* Current Task */}
        {currentTask && (
          <Container padding="md" className="border-b border-neutral-800">
            <View className="bg-surface p-4" style={organicBorderRadius.card}>
              <HStack justify="between" align="center" className="mb-2">
                <Text size="sm" className="text-neutral-400">
                  Current Task
                </Text>
                <Badge variant={currentTask.status === 'failed' ? 'error' : 'warning'}>
                  {currentTask.status.replaceAll('_', ' ')}
                </Badge>
              </HStack>
              <Text className="text-white mb-3">{currentTask.description}</Text>
              <HStack justify="between" align="center" className="mb-2">
                <Text size="sm" className="text-neutral-500">
                  Progress
                </Text>
                <Text size="sm" className="text-teal-400">
                  {progress}%
                </Text>
              </HStack>
              <ProgressBar value={progress} color="secondary" size="md" />
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

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Container padding="lg">
            {activeTab === 'overview' ? (
              <VStack spacing="md">
                {/* Metrics */}
                <View className="bg-surface p-4" style={organicBorderRadius.card}>
                  <Text weight="semibold" className="text-white mb-3">
                    Metrics
                  </Text>
                  <HStack justify="around">
                    <VStack align="center">
                      <Text weight="semibold" className="text-white">
                        {completed}
                      </Text>
                      <Text size="xs" className="text-neutral-500">
                        Completed
                      </Text>
                    </VStack>
                    <VStack align="center">
                      <Text weight="semibold" className="text-white">
                        {failed}
                      </Text>
                      <Text size="xs" className="text-neutral-500">
                        Failed
                      </Text>
                    </VStack>
                    <VStack align="center">
                      <Text weight="semibold" className="text-white">
                        {successRate !== null ? `${successRate}%` : '—'}
                      </Text>
                      <Text size="xs" className="text-neutral-500">
                        Success
                      </Text>
                    </VStack>
                  </HStack>
                </View>

                {/* Controls */}
                <View className="bg-surface p-4" style={organicBorderRadius.card}>
                  <Text weight="semibold" className="text-white mb-3">
                    Controls
                  </Text>
                  <HStack spacing="sm">
                    <Pressable
                      onPress={() => updateAgentStatus(agent.id, 'idle')}
                      className="flex-1 bg-surface-elevated py-3 active:bg-neutral-700"
                      style={organicBorderRadius.button}
                      accessibilityRole="button"
                      accessibilityLabel="Set agent to idle"
                    >
                      <Text className="text-center text-neutral-200">Idle</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => updateAgentStatus(agent.id, 'working')}
                      className="flex-1 bg-teal-600 py-3 active:bg-teal-700"
                      style={organicBorderRadius.button}
                      accessibilityRole="button"
                      accessibilityLabel="Set agent to working"
                    >
                      <Text className="text-center text-white font-semibold">Work</Text>
                    </Pressable>
                  </HStack>
                </View>
              </VStack>
            ) : (
              <VStack
                spacing="none"
                className="bg-surface"
                style={[organicBorderRadius.card, { overflow: 'hidden' }]}
              >
                <View className="px-4 py-3 border-b border-neutral-700">
                  <Text size="sm" weight="semibold" className="text-neutral-400">
                    TASK HISTORY
                  </Text>
                </View>
                <View className="px-4">
                  {tasks.length === 0 ? (
                    <View className="py-6">
                      <Text className="text-neutral-500">No tasks yet.</Text>
                    </View>
                  ) : (
                    tasks
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
                              {formatDateTime(t.createdAt)}
                              {t.completedAt ? ` → ${formatDateTime(t.completedAt)}` : ''}
                            </Text>
                          </View>
                          {idx < tasks.length - 1 && <Divider />}
                        </View>
                      ))
                  )}
                </View>
              </VStack>
            )}
          </Container>
        </ScrollView>
      </View>
    </>
  );
}
