/**
 * AgentHistory
 *
 * Displays the task history list for an agent.
 */

import type { AgentTask } from '@thumbcode/state';
import { Badge } from '@/components/display';
import { Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

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

interface AgentHistoryProps {
  tasks: AgentTask[];
}

export function AgentHistory({ tasks }: Readonly<AgentHistoryProps>) {
  const sortedTasks = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <VStack
      spacing="none"
      className="bg-surface"
      style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
    >
      <div className="px-4 py-3 border-b border-neutral-700">
        <Text size="sm" weight="semibold" className="text-neutral-400">
          TASK HISTORY
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
                  {formatDateTime(t.createdAt)}
                  {t.completedAt ? ` → ${formatDateTime(t.completedAt)}` : ''}
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
