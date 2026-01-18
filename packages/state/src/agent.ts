import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types for your agent's state
interface Agent {
  id: string;
  role: 'architect' | 'implementer' | 'reviewer' | 'tester';
  status: 'idle' | 'working' | 'blocked' | 'needs_review' | 'complete';
  // Add any other properties your agents might have
}

interface AgentState {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    immer((set) => ({
      agents: [],
      addAgent: (agent) =>
        set((state) => {
          state.agents.push(agent);
        }),
      updateAgentStatus: (agentId, status) =>
        set((state) => {
          const agent = state.agents.find((a) => a.id === agentId);
          if (agent) {
            agent.status = status;
          }
        }),
    })),
    {
      name: 'agent-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
