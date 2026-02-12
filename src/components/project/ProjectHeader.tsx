/**
 * ProjectHeader
 *
 * Displays project repo URL, branch badge, active agents, and pending tasks.
 */

import { Badge } from '@/components/display';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

interface ProjectHeaderProps {
  repoUrl: string;
  currentBranch: string;
  defaultBranch: string;
  activeAgents: number;
  pendingTasks: number;
  errorMessage: string | null;
}

export function ProjectHeader({
  repoUrl,
  currentBranch,
  defaultBranch,
  activeAgents,
  pendingTasks,
  errorMessage,
}: Readonly<ProjectHeaderProps>) {
  return (
    <Container padding="md" className="border-b border-neutral-800">
      <VStack spacing="sm">
        <Text size="sm" className="text-neutral-400" numberOfLines={1}>
          {repoUrl}
        </Text>

        <HStack spacing="sm" align="center">
          <Badge variant="secondary">{currentBranch || defaultBranch}</Badge>
          <Badge variant="success">{`${activeAgents} agents`}</Badge>
          <Badge variant="warning">{`${pendingTasks} tasks`}</Badge>
        </HStack>

        {errorMessage && (
          <Text size="sm" className="text-coral-400">
            {errorMessage}
          </Text>
        )}
      </VStack>
    </Container>
  );
}
