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
import { AgentActions, AgentHistory, AgentMetrics } from '@/components/agents';
import { Badge, StatusBadge } from '@/components/display';
import { ProgressBar } from '@/components/feedback';
import { type IconColor, LightningIcon, ReviewIcon, StarIcon, TestIcon } from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
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
          This agent ID doesn't exist in local state. Go back and select an agent from the list.
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
                <AgentMetrics
                  completed={completed}
                  failed={failed}
                  successRate={successRate}
                />
                <AgentActions
                  agentId={agent.id}
                  onSetIdle={(id) => updateAgentStatus(id, 'idle')}
                  onSetWorking={(id) => updateAgentStatus(id, 'working')}
                />
              </VStack>
            ) : (
              <AgentHistory tasks={tasks} />
            )}
          </Container>
        </ScrollView>
      </View>
    </>
  );
}
