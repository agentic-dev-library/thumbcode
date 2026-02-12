/**
 * Home Screen (Dashboard)
 *
 * Main dashboard showing overview of projects, agents, and recent activity.
 * Uses paint daube icons for brand consistency.
 */

import { selectAgents, selectProjects, useAgentStore, useProjectStore } from '@thumbcode/state';
import { useRouter } from 'expo-router';
import type React from 'react';
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
import { organicBorderRadius } from '@/lib/organic-styles';

function statusToActivityType(status: string): string {
  switch (status) {
    case 'completed':
      return 'commit';
    case 'failed':
      return 'review';
    default:
      return 'task';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'working':
    case 'needs_review':
      return 'bg-teal-500';
    case 'idle':
    case 'complete':
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
  const projects = useProjectStore(selectProjects);
  const agents = useAgentStore(selectAgents);
  const tasks = useAgentStore((s) => s.tasks);

  const runningAgents = agents.filter((a) => a.status !== 'idle').length;
  const pendingTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const d = new Date(t.completedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const recentActivity = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((t) => {
      const agent = agents.find((a) => a.id === t.agentId);
      return {
        id: t.id,
        type: statusToActivityType(t.status),
        agent: agent?.name || 'Agent',
        message: t.description,
        project: 'workspace',
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });

  return (
    <div
      className="flex-1 bg-charcoal"
}
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
        <div className="flex-row flex-wrap gap-3 mb-6">
          <div className="bg-surface p-4 flex-1 min-w-[140px]" style={organicBorderRadius.card}>
            <div className="mb-2">
              <FolderIcon size={32} color="teal" turbulence={0.2} />
            </div>
            <Text size="2xl" weight="bold" className="text-white">
              {projects.length}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Projects
            </Text>
          </div>

          <div className="bg-surface p-4 flex-1 min-w-[140px]" style={organicBorderRadius.card}>
            <div className="mb-2">
              <AgentIcon size={32} color="coral" turbulence={0.2} />
            </div>
            <Text size="2xl" weight="bold" className="text-white">
              {runningAgents}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Running Agents
            </Text>
          </div>

          <div className="bg-surface p-4 flex-1 min-w-[140px]" style={organicBorderRadius.card}>
            <div className="mb-2">
              <TasksIcon size={32} color="gold" turbulence={0.2} />
            </div>
            <Text size="2xl" weight="bold" className="text-white">
              {pendingTasks}
            </Text>
            <Text size="sm" className="text-neutral-400">
              Pending Tasks
            </Text>
          </div>
        </div>

        {/* Agent Status */}
        <VStack spacing="md" className="mb-6">
          <HStack justify="between" align="center">
            <Text weight="semibold" className="text-white text-lg">
              Agent Team
            </Text>
            <button type="button" onClick={() => router.push('/(tabs)/agents')}>
              <Text size="sm" className="text-coral-500">
                View All →
              </Text>
            </button>
          </HStack>

          <div className="flex-row flex-wrap gap-3">
            {agents.map((agent) => (
              <button type="button"
                key={agent.id}
                onClick={() => router.push(`/agent/${agent.id}`)}
                className="bg-surface p-3 flex-row items-center"
                style={organicBorderRadius.card}
              >
                <Avatar name={agent.name} size="sm" />
                <VStack spacing="none" className="ml-3">
                  <Text size="sm" weight="semibold" className="text-white">
                    {agent.name}
                  </Text>
                  <HStack spacing="xs" align="center">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <Text size="xs" className="text-neutral-400 capitalize">
                      {agent.status}
                    </Text>
                  </HStack>
                </VStack>
              </button>
            ))}
          </div>
        </VStack>

        {/* Today's Progress */}
        <div className="bg-surface p-4 mb-6" style={organicBorderRadius.card}>
          <HStack justify="between" align="center" className="mb-3">
            <Text weight="semibold" className="text-white">
              Today's Progress
            </Text>
            <Badge variant="success">{`${completedToday} done`}</Badge>
          </HStack>
          <ProgressBar
            value={
              completedToday + pendingTasks > 0
                ? (completedToday / (completedToday + pendingTasks)) * 100
                : 0
            }
            color="secondary"
          />
        </div>

        {/* Recent Activity */}
        <VStack spacing="md">
          <HStack justify="between" align="center">
            <Text weight="semibold" className="text-white text-lg">
              Recent Activity
            </Text>
            <button type="button">
              <Text size="sm" className="text-coral-500">
                See All →
              </Text>
            </button>
          </HStack>

          <VStack spacing="sm">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-surface p-4 flex-row"
                style={organicBorderRadius.card}
              >
                <div
                  className="w-10 h-10 bg-charcoal items-center justify-center mr-3"
                  style={organicBorderRadius.button}
                >
                  <ActivityIcon type={activity.type} />
                </div>
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
              </div>
            ))}
          </VStack>
        </VStack>
      </Container>
    </div>
  );
}
