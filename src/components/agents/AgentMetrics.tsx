/**
 * AgentMetrics
 *
 * Displays task completion metrics for an agent.
 */

import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

interface AgentMetricsProps {
  completed: number;
  failed: number;
  successRate: number | null;
}

export function AgentMetrics({ completed, failed, successRate }: Readonly<AgentMetricsProps>) {
  return (
    <div className="bg-surface p-4" style={organicBorderRadius.card}>
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
    </div>
  );
}
