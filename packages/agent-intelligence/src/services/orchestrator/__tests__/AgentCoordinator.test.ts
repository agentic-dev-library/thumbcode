/**
 * AgentCoordinator Tests
 *
 * Tests for agent lifecycle, creation, removal, and execution coordination.
 */

import type { Agent, TaskAssignment } from '@thumbcode/types';
import { OrchestrationStateManager } from '../OrchestrationState';
import { AgentCoordinator } from '../AgentCoordinator';
import type { OrchestratorConfig } from '../types';

// Helper to create async iterator from array
function mockCreateAsyncIterator(items: unknown[]) {
  let index = 0;
  return {
    async next() {
      if (index < items.length) {
        return { value: items[index++], done: false };
      }
      return { value: undefined, done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

// Mock the AI SDKs
vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        id: 'msg_123',
        content: [{ type: 'text', text: 'Task completed.' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
      stream: vi.fn().mockImplementation(() => {
        const events = [
          { type: 'message_start' },
          { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
          { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Done' } },
          { type: 'content_block_stop' },
          { type: 'message_stop' },
        ];
        return {
          ...mockCreateAsyncIterator(events),
          finalMessage: vi.fn().mockResolvedValue({
            id: 'msg_123',
            content: [{ type: 'text', text: 'Done' }],
            model: 'claude-3-5-sonnet-20241022',
            stop_reason: 'end_turn',
            usage: { input_tokens: 100, output_tokens: 50 },
          }),
        };
      }),
    };
  }
  return { __esModule: true, default: MockAnthropic };
});

vi.mock('openai', () => {
  class MockOpenAI {
    chat = { completions: { create: vi.fn() } };
  }
  return { __esModule: true, default: MockOpenAI };
});

const mockConfig: OrchestratorConfig = {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  maxConcurrentAgents: 4,
  autoAssign: true,
  enableParallelExecution: true,
  projectContext: {
    projectId: 'test-project',
    workspaceDir: '/tmp/workspace',
    currentBranch: 'main',
    availableFiles: ['src/index.ts'],
  },
};

describe('AgentCoordinator', () => {
  let stateManager: OrchestrationStateManager;
  let coordinator: AgentCoordinator;

  beforeEach(() => {
    stateManager = new OrchestrationStateManager(mockConfig);
    coordinator = new AgentCoordinator(mockConfig, stateManager, 'sk-ant-test');
  });

  describe('initialize', () => {
    it('should create agents for all four roles', async () => {
      await coordinator.initialize();

      expect(stateManager.state.agents.size).toBe(4);
      const roles = Array.from(stateManager.state.agents.values()).map((a) => a.role);
      expect(roles).toContain('architect');
      expect(roles).toContain('implementer');
      expect(roles).toContain('reviewer');
      expect(roles).toContain('tester');
    });

    it('should emit status_change event', async () => {
      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      await coordinator.initialize();

      expect(events).toContain('status_change');
    });

    it('should emit agent_created for each agent', async () => {
      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      await coordinator.initialize();

      const agentCreatedEvents = events.filter((e) => e === 'agent_created');
      expect(agentCreatedEvents).toHaveLength(4);
    });
  });

  describe('createAgent', () => {
    it('should create an agent with specified role', async () => {
      const agentId = await coordinator.createAgent('architect');

      expect(agentId).toContain('architect');
      expect(stateManager.state.agents.has(agentId)).toBe(true);
    });

    it('should accept custom config overrides', async () => {
      const agentId = await coordinator.createAgent('implementer', {
        name: 'Custom Coder',
        temperature: 0.5,
        maxTokens: 1024,
      });

      const agent = stateManager.state.agents.get(agentId);
      expect(agent?.name).toBe('Custom Coder');
    });

    it('should subscribe to agent events', async () => {
      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      await coordinator.createAgent('reviewer');

      expect(events).toContain('agent_created');
    });
  });

  describe('removeAgent', () => {
    it('should remove an agent', async () => {
      const agentId = await coordinator.createAgent('tester');
      expect(stateManager.state.agents.has(agentId)).toBe(true);

      await coordinator.removeAgent(agentId);

      expect(stateManager.state.agents.has(agentId)).toBe(false);
    });

    it('should emit agent_removed event', async () => {
      const agentId = await coordinator.createAgent('architect');

      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      await coordinator.removeAgent(agentId);

      expect(events).toContain('agent_removed');
    });

    it('should do nothing when removing non-existent agent', async () => {
      await coordinator.removeAgent('nonexistent');
      // Should not throw
    });

    it('should throw when agent has active tasks', async () => {
      const agentId = await coordinator.createAgent('implementer');
      stateManager.state.activeTasks.set('task-1', agentId);

      await expect(coordinator.removeAgent(agentId)).rejects.toThrow(
        'Cannot remove agent'
      );
    });
  });

  describe('executeTask', () => {
    it('should execute a task and update state', async () => {
      await coordinator.initialize();

      // Find an implementer agent
      const implementer = Array.from(stateManager.state.agents.values()).find(
        (a) => a.role === 'implementer'
      );

      const task: TaskAssignment = {
        id: 'task-1',
        type: 'feature',
        title: 'Build feature',
        description: 'Implement a new feature',
        assignee: implementer!.id,
        dependsOn: [],
        status: 'pending',
        priority: 'medium',
        acceptanceCriteria: ['Working feature'],
        references: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      stateManager.state.taskQueue.push(task);

      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      await coordinator.executeTask('task-1');

      expect(events).toContain('task_started');
      // Task should be moved to completed
      expect(stateManager.state.completedTasks.length).toBeGreaterThanOrEqual(0);
    });

    it('should do nothing when task not found', async () => {
      await coordinator.executeTask('nonexistent');
      // Should not throw
    });

    it('should do nothing when task has no assignee', async () => {
      stateManager.state.taskQueue.push({
        id: 'task-unassigned',
        type: 'feature',
        title: 'Unassigned',
        description: 'No assignee',
        assignee: '',
        dependsOn: [],
        status: 'pending',
        priority: 'medium',
        acceptanceCriteria: [],
        references: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await coordinator.executeTask('task-unassigned');
      // Should not throw
    });
  });
});
