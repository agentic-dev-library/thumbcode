/**
 * ProjectActions
 *
 * Renders the commits, tasks, and agents tab content for the project detail screen.
 */

import type { Agent, AgentTask } from '@thumbcode/state';
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
      style={{ ...organicBorderRadius.card, overflow: 'hidden' }}
    >
      <div className="px-4 py-3 border-b border-neutral-700">
        <Text size="sm" weight="semibold" className="text-neutral-400">
          COMMIT HISTORY
        </Text>
      </div>
      <div className="px-4">
        {isLoading ? (
          <div className="py-6">
            <Text className="text-neutral-500">Loading commits…</Text>
          </div>
        ) : commits.length === 0 ? (
          <div className="py-6">
            <Text className="text-neutral-500">No commits found.</Text>
          </div>
        ) : (
          commits.map((c, idx) => (
            <div key={`${c.sha}-${idx}`}>
              <div className="py-4">
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
              </div>
              {idx < commits.length - 1 && <Divider />}
            </div>
          ))
        )}
      </div>
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
      style={{ ...organicBorderRadius.card, overflow: 'hidden' }}
    >
      <div className="px-4 py-3 border-b border-neutral-700">
        <Text size="sm" weight="semibold" className="text-neutral-400">
          TASKS
        </Text>
      </div>
      <div className="px-4">
        {sortedTasks.length === 0 ? (
          <div className="py-6">
            <Text className="text-neutral-500">No tasks yet.</Text>
          </div>
        ) : (
          sortedTasks.map((t, idx) => (
            <div key={t.id}>
              <div className="py-4">
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
              </div>
              {idx < sortedTasks.length - 1 && <Divider />}
            </div>
          ))
        )}
      </div>
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
        <button
          type="button"
          key={a.id}
          onClick={() => onAgentPress(a.id)}
          className="bg-surface p-4 active:bg-neutral-700"
          style={organicBorderRadius.card}
          aria-label={`Open agent ${a.name}`}
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
              status={a.status === 'error' ? 'error' : a.status === 'idle' ? 'inactive' : 'pending'}
              label={a.status.replaceAll('_', ' ')}
            />
          </HStack>
        </button>
      ))}
    </VStack>
  );
}
