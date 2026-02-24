/**
 * Agent Store Tests
 */

import { act, renderHook } from '@testing-library/react';
import type { Agent } from '../agentStore';
import {
  selectActiveAgent,
  selectAgents,
  selectAgentsByRole,
  selectAgentsByStatus,
  selectWorkingAgents,
  useAgentStore,
} from '../agentStore';

// Clear store before each test
beforeEach(() => {
  const { result } = renderHook(() => useAgentStore());
  act(() => {
    result.current.resetAllAgents();
    result.current.clearTasks();
    // Reset agents array directly
    useAgentStore.setState({ agents: [], tasks: [], activeAgentId: null });
  });
});

describe('AgentStore', () => {
  describe('addAgent', () => {
    it('should add an agent to the store', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'architect',
        name: 'Test Architect',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3-opus' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      expect(result.current.agents).toHaveLength(1);
      expect(result.current.agents[0]).toEqual(agent);
    });
  });

  describe('removeAgent', () => {
    it('should remove an agent from the store', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'architect',
        name: 'Test Architect',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3-opus' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      expect(result.current.agents).toHaveLength(1);

      act(() => {
        result.current.removeAgent('test-agent-1');
      });

      expect(result.current.agents).toHaveLength(0);
    });

    it('should clear activeAgentId when removing the active agent', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'architect',
        name: 'Test Architect',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3-opus' },
      };

      act(() => {
        result.current.addAgent(agent);
        result.current.setActiveAgent('test-agent-1');
      });

      expect(result.current.activeAgentId).toBe('test-agent-1');

      act(() => {
        result.current.removeAgent('test-agent-1');
      });

      expect(result.current.activeAgentId).toBeNull();
    });
  });

  describe('updateAgentStatus', () => {
    it('should update the status of an agent', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'implementer',
        name: 'Test Implementer',
        status: 'idle',
        config: { provider: 'openai', model: 'gpt-4' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      act(() => {
        result.current.updateAgentStatus('test-agent-1', 'working');
      });

      expect(result.current.agents[0].status).toBe('working');
      expect(result.current.agents[0].lastActiveAt).toBeDefined();
    });

    it('should set error message when status is error', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'tester',
        name: 'Test Tester',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3-haiku' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      act(() => {
        result.current.updateAgentStatus('test-agent-1', 'error', 'API rate limit exceeded');
      });

      expect(result.current.agents[0].status).toBe('error');
      expect(result.current.agents[0].errorMessage).toBe('API rate limit exceeded');
    });
  });

  describe('tasks', () => {
    it('should add a task and assign it to an agent', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'implementer',
        name: 'Test Implementer',
        status: 'idle',
        config: { provider: 'anthropic', model: 'claude-3-opus' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      let taskId = '';
      act(() => {
        taskId = result.current.addTask({
          agentId: 'test-agent-1',
          description: 'Implement feature X',
          status: 'pending',
        });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].description).toBe('Implement feature X');
      expect(result.current.agents[0].currentTaskId).toBe(taskId);
    });

    it('should complete a task and reset agent status', () => {
      const { result } = renderHook(() => useAgentStore());

      const agent: Agent = {
        id: 'test-agent-1',
        role: 'implementer',
        name: 'Test Implementer',
        status: 'working',
        config: { provider: 'anthropic', model: 'claude-3-opus' },
      };

      act(() => {
        result.current.addAgent(agent);
      });

      let taskId = '';
      act(() => {
        taskId = result.current.addTask({
          agentId: 'test-agent-1',
          description: 'Implement feature X',
          status: 'in_progress',
        });
      });

      act(() => {
        result.current.completeTask(taskId, 'Feature implemented successfully');
      });

      expect(result.current.tasks[0].status).toBe('completed');
      expect(result.current.tasks[0].result).toBe('Feature implemented successfully');
      expect(result.current.agents[0].currentTaskId).toBeUndefined();
      expect(result.current.agents[0].status).toBe('idle');
    });
  });

  describe('selectors', () => {
    it('selectAgents should return all agents', () => {
      const _state = useAgentStore.getState();
      useAgentStore.setState({
        agents: [
          {
            id: '1',
            role: 'architect',
            name: 'Arch',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
          {
            id: '2',
            role: 'tester',
            name: 'Test',
            status: 'working',
            config: { provider: 'openai', model: 'test' },
          },
        ],
      });

      const agents = selectAgents(useAgentStore.getState());
      expect(agents).toHaveLength(2);
    });

    it('selectActiveAgent should return the active agent', () => {
      useAgentStore.setState({
        agents: [
          {
            id: '1',
            role: 'architect',
            name: 'Arch',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
        ],
        activeAgentId: '1',
      });

      const activeAgent = selectActiveAgent(useAgentStore.getState());
      expect(activeAgent?.id).toBe('1');
    });

    it('selectAgentsByRole should filter by role', () => {
      useAgentStore.setState({
        agents: [
          {
            id: '1',
            role: 'architect',
            name: 'Arch',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
          {
            id: '2',
            role: 'tester',
            name: 'Test',
            status: 'working',
            config: { provider: 'openai', model: 'test' },
          },
          {
            id: '3',
            role: 'architect',
            name: 'Arch2',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
        ],
      });

      const architects = selectAgentsByRole('architect')(useAgentStore.getState());
      expect(architects).toHaveLength(2);
    });

    it('selectAgentsByStatus should filter by status', () => {
      useAgentStore.setState({
        agents: [
          {
            id: '1',
            role: 'architect',
            name: 'Arch',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
          {
            id: '2',
            role: 'tester',
            name: 'Test',
            status: 'working',
            config: { provider: 'openai', model: 'test' },
          },
        ],
      });

      const idleAgents = selectAgentsByStatus('idle')(useAgentStore.getState());
      expect(idleAgents).toHaveLength(1);
      expect(idleAgents[0].id).toBe('1');
    });

    it('selectWorkingAgents should return agents with status working', () => {
      useAgentStore.setState({
        agents: [
          {
            id: '1',
            role: 'architect',
            name: 'Arch',
            status: 'idle',
            config: { provider: 'anthropic', model: 'test' },
          },
          {
            id: '2',
            role: 'tester',
            name: 'Test',
            status: 'working',
            config: { provider: 'openai', model: 'test' },
          },
        ],
      });

      const workingAgents = selectWorkingAgents(useAgentStore.getState());
      expect(workingAgents).toHaveLength(1);
      expect(workingAgents[0].id).toBe('2');
    });
  });
});
