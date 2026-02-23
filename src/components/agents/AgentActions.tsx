/**
 * AgentActions
 *
 * Agent control buttons (idle/working status toggles).
 */

import { HStack } from '@/components/layout';
import { Text } from '@/components/ui';

interface AgentActionsProps {
  agentId: string;
  onSetIdle: (id: string) => void;
  onSetWorking: (id: string) => void;
}

export function AgentActions({ agentId, onSetIdle, onSetWorking }: Readonly<AgentActionsProps>) {
  return (
    <div className="bg-surface p-4 rounded-organic-card">
      <Text weight="semibold" className="text-white mb-3">
        Controls
      </Text>
      <HStack spacing="sm">
        <button
          type="button"
          onClick={() => onSetIdle(agentId)}
          className="flex-1 bg-surface-elevated py-3 active:bg-neutral-700 rounded-organic-button"
          aria-label="Set agent to idle"
        >
          <Text className="text-center text-neutral-200">Idle</Text>
        </button>
        <button
          type="button"
          onClick={() => onSetWorking(agentId)}
          className="flex-1 bg-teal-600 py-3 active:bg-teal-700 rounded-organic-button"
          aria-label="Set agent to working"
        >
          <Text className="text-center text-white font-semibold">Work</Text>
        </button>
      </HStack>
    </div>
  );
}
