/**
 * Agent Store
 *
 * Manages AI agent state for the multi-agent orchestration system.
 * Agents include: Architect, Implementer, Reviewer, Tester
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Agent role types matching ThumbCode's multi-agent system
export type AgentRole = 'architect' | 'implementer' | 'reviewer' | 'tester';

// Agent status for workflow tracking
export type AgentStatus =
  | 'idle'
  | 'working'
  | 'blocked'
  | 'needs_review'
  | 'awaiting_approval'
  | 'complete'
  | 'error';

// Agent configuration for API providers
export interface AgentConfig {
  provider: 'anthropic' | 'openai';
  model: string;
  maxTokens?: number;
}

// Core agent interface
export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  status: AgentStatus;
  config: AgentConfig;
  currentTaskId?: string;
  lastActiveAt?: string;
  errorMessage?: string;
}

// Task assigned to an agent
export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: string;
}

interface AgentState {
  // State
  agents: Agent[];
  tasks: AgentTask[];
  activeAgentId: string | null;

  // Actions
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus, errorMessage?: string) => void;
  setActiveAgent: (agentId: string | null) => void;

  // Task actions
  addTask: (task: Omit<AgentTask, 'id' | 'createdAt'>) => string;
  updateTask: (taskId: string, updates: Partial<AgentTask>) => void;
  completeTask: (taskId: string, result?: string) => void;

  // Bulk operations
  resetAllAgents: () => void;
  clearTasks: () => void;
}

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      immer((set) => ({
        agents: [],
        tasks: [],
        activeAgentId: null,

        addAgent: (agent) =>
          set((state) => {
            state.agents.push(agent);
          }),

        removeAgent: (agentId) =>
          set((state) => {
            state.agents = state.agents.filter((a) => a.id !== agentId);
            if (state.activeAgentId === agentId) {
              state.activeAgentId = null;
            }
          }),

        updateAgent: (agentId, updates) =>
          set((state) => {
            const agent = state.agents.find((a) => a.id === agentId);
            if (agent) {
              Object.assign(agent, updates, { lastActiveAt: new Date().toISOString() });
            }
          }),

        updateAgentStatus: (agentId, status, errorMessage) =>
          set((state) => {
            const agent = state.agents.find((a) => a.id === agentId);
            if (agent) {
              agent.status = status;
              agent.lastActiveAt = new Date().toISOString();
              if (errorMessage) {
                agent.errorMessage = errorMessage;
              } else if (status !== 'error') {
                agent.errorMessage = undefined;
              }
            }
          }),

        setActiveAgent: (agentId) =>
          set((state) => {
            state.activeAgentId = agentId;
          }),

        addTask: (task) => {
          const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          set((state) => {
            state.tasks.push({
              ...task,
              id: taskId,
              createdAt: new Date().toISOString(),
            });
            // Update agent with current task
            const agent = state.agents.find((a) => a.id === task.agentId);
            if (agent) {
              agent.currentTaskId = taskId;
            }
          });
          return taskId;
        },

        updateTask: (taskId, updates) =>
          set((state) => {
            const task = state.tasks.find((t) => t.id === taskId);
            if (task) {
              Object.assign(task, updates);
            }
          }),

        completeTask: (taskId, result) =>
          set((state) => {
            const task = state.tasks.find((t) => t.id === taskId);
            if (task) {
              task.status = 'completed';
              task.completedAt = new Date().toISOString();
              task.result = result;
              // Clear agent's current task
              const agent = state.agents.find((a) => a.currentTaskId === taskId);
              if (agent) {
                agent.currentTaskId = undefined;
                agent.status = 'idle';
              }
            }
          }),

        resetAllAgents: () =>
          set((state) => {
            state.agents.forEach((agent) => {
              agent.status = 'idle';
              agent.currentTaskId = undefined;
              agent.errorMessage = undefined;
            });
          }),

        clearTasks: () =>
          set((state) => {
            state.tasks = [];
          }),
      })),
      {
        name: 'thumbcode-agent-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'AgentStore' }
  )
);

// Selectors for optimal re-renders
export const selectAgents = (state: AgentState) => state.agents;
export const selectActiveAgent = (state: AgentState) =>
  state.agents.find((a) => a.id === state.activeAgentId) ?? null;
export const selectAgentsByRole = (role: AgentRole) => (state: AgentState) =>
  state.agents.filter((a) => a.role === role);
export const selectAgentsByStatus = (status: AgentStatus) => (state: AgentState) =>
  state.agents.filter((a) => a.status === status);
export const selectWorkingAgents = (state: AgentState) =>
  state.agents.filter((a) => a.status === 'working');
export const selectPendingTasks = (state: AgentState) =>
  state.tasks.filter((t) => t.status === 'pending');
export const selectAgentTasks = (agentId: string) => (state: AgentState) =>
  state.tasks.filter((t) => t.agentId === agentId);
