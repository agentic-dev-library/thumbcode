/**
 * Orchestrator Tests
 */

import type { AgentContext } from '../services/agents/base-agent';
import { AgentOrchestrator } from '../services/orchestrator';

// Mock the AI SDKs
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        id: 'msg_123',
        content: [{ type: 'text', text: 'Task completed successfully.' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
      stream: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'message_start' };
          yield { type: 'content_block_start', index: 0, content_block: { type: 'text' } };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Done' } };
          yield { type: 'content_block_stop' };
          yield { type: 'message_stop' };
        },
        finalMessage: jest.fn().mockResolvedValue({
          id: 'msg_123',
          content: [{ type: 'text', text: 'Done' }],
          model: 'claude-3-5-sonnet-20241022',
          stop_reason: 'end_turn',
          usage: { input_tokens: 100, output_tokens: 50 },
        }),
      })),
    },
  }));
});

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  }));
});

describe('AgentOrchestrator', () => {
  const mockContext: AgentContext = {
    projectId: 'test-project',
    workspaceDir: '/tmp/workspace',
    currentBranch: 'main',
    availableFiles: ['src/index.ts', 'package.json'],
  };

  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator(
      {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        maxConcurrentAgents: 2,
        autoAssign: true,
        enableParallelExecution: true,
        projectContext: mockContext,
      },
      'sk-ant-test'
    );
  });

  describe('initialize', () => {
    it('should create default agents for all roles', async () => {
      await orchestrator.initialize();

      const state = orchestrator.getState();
      expect(state.agents.size).toBe(4);

      const roles = Array.from(state.agents.values()).map((a) => a.role);
      expect(roles).toContain('architect');
      expect(roles).toContain('implementer');
      expect(roles).toContain('reviewer');
      expect(roles).toContain('tester');
    });

    it('should emit events when creating agents', async () => {
      const events: string[] = [];
      orchestrator.onEvent((e) => events.push(e.type));

      await orchestrator.initialize();

      expect(events.filter((e) => e === 'agent_created')).toHaveLength(4);
    });
  });

  describe('createAgent', () => {
    it('should create an agent with specified role', async () => {
      const agentId = await orchestrator.createAgent('architect');

      expect(agentId).toContain('architect');
      const state = orchestrator.getState();
      expect(state.agents.has(agentId)).toBe(true);
    });

    it('should use custom configuration', async () => {
      const agentId = await orchestrator.createAgent('implementer', {
        name: 'Custom Implementer',
        temperature: 0.5,
        maxTokens: 2048,
      });

      const state = orchestrator.getState();
      const agent = state.agents.get(agentId);
      expect(agent?.name).toBe('Custom Implementer');
    });
  });

  describe('removeAgent', () => {
    it('should remove an agent', async () => {
      const agentId = await orchestrator.createAgent('tester');
      const stateBefore = orchestrator.getState();
      expect(stateBefore.agents.has(agentId)).toBe(true);

      await orchestrator.removeAgent(agentId);

      const stateAfter = orchestrator.getState();
      expect(stateAfter.agents.has(agentId)).toBe(false);
    });

    it('should emit agent_removed event', async () => {
      const events: string[] = [];
      orchestrator.onEvent((e) => events.push(e.type));

      const agentId = await orchestrator.createAgent('reviewer');
      await orchestrator.removeAgent(agentId);

      expect(events).toContain('agent_removed');
    });
  });

  describe('createTask', () => {
    it('should create a task and add it to the queue', () => {
      const taskId = orchestrator.createTask({
        title: 'Implement feature',
        description: 'Create a new feature',
        type: 'feature',
        acceptanceCriteria: ['Must work', 'Must have tests'],
      });

      expect(taskId).toContain('task');
      const task = orchestrator.getTask(taskId);
      expect(task?.title).toBe('Implement feature');
      expect(task?.status).toBe('pending');
    });

    it('should emit task_created event', () => {
      const events: string[] = [];
      orchestrator.onEvent((e) => events.push(e.type));

      orchestrator.createTask({
        title: 'Test task',
        description: 'A test task',
        type: 'test',
        acceptanceCriteria: ['Must pass'],
      });

      expect(events).toContain('task_created');
    });

    it('should auto-assign task when autoAssign is true and assigneeRole is provided', async () => {
      await orchestrator.createAgent('implementer');

      const events: string[] = [];
      orchestrator.onEvent((e) => events.push(e.type));

      const taskId = orchestrator.createTask({
        title: 'Auto-assigned task',
        description: 'Should be auto-assigned',
        type: 'feature',
        acceptanceCriteria: ['Done'],
        assigneeRole: 'implementer',
      });

      expect(events).toContain('task_assigned');
      const task = orchestrator.getTask(taskId);
      expect(task?.assignee).toBeTruthy();
    });
  });

  describe('assignTask', () => {
    it('should assign a task to an agent with the specified role', async () => {
      await orchestrator.createAgent('reviewer');

      const taskId = orchestrator.createTask({
        title: 'Review code',
        description: 'Review the pull request',
        type: 'review',
        acceptanceCriteria: ['Code reviewed'],
      });

      orchestrator.assignTask(taskId, 'reviewer');

      const task = orchestrator.getTask(taskId);
      expect(task?.assignee).toBeTruthy();
    });

    it('should throw when no idle agent is available', async () => {
      const taskId = orchestrator.createTask({
        title: 'No agent available',
        description: 'This should fail',
        type: 'feature',
        acceptanceCriteria: ['N/A'],
      });

      expect(() => orchestrator.assignTask(taskId, 'architect')).toThrow('No idle agent available');
    });
  });

  describe('getMetrics', () => {
    it('should return orchestrator metrics', async () => {
      await orchestrator.initialize();

      const metrics = orchestrator.getMetrics();

      expect(metrics.totalTasksCreated).toBe(0);
      expect(metrics.totalTasksCompleted).toBe(0);
      expect(metrics.agentMetrics).toHaveLength(4);
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', () => {
      orchestrator.createTask({
        title: 'Task 1',
        description: 'First task',
        type: 'feature',
        acceptanceCriteria: ['Done'],
      });
      orchestrator.createTask({
        title: 'Task 2',
        description: 'Second task',
        type: 'bugfix',
        acceptanceCriteria: ['Fixed'],
      });

      const tasks = orchestrator.getTasks();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', () => {
      orchestrator.createTask({
        title: 'Pending task',
        description: 'Should be pending',
        type: 'feature',
        acceptanceCriteria: ['Done'],
      });

      const pendingTasks = orchestrator.getTasksByStatus('pending');
      expect(pendingTasks).toHaveLength(1);

      const completedTasks = orchestrator.getTasksByStatus('complete');
      expect(completedTasks).toHaveLength(0);
    });
  });

  describe('start/pause/resume/stop', () => {
    it('should change orchestrator status', async () => {
      await orchestrator.initialize();

      expect(orchestrator.getState().status).toBe('idle');

      // Start with no tasks should complete immediately
      await orchestrator.start();
      expect(orchestrator.getState().status).toBe('idle');
    });

    it('should pause and resume', async () => {
      await orchestrator.initialize();

      orchestrator.pause();
      expect(orchestrator.getState().status).toBe('paused');

      await orchestrator.resume();
      expect(orchestrator.getState().status).toBe('idle'); // idle because no tasks
    });

    it('should stop execution', async () => {
      await orchestrator.initialize();

      orchestrator.stop();
      expect(orchestrator.getState().status).toBe('idle');
    });
  });

  describe('task dependencies', () => {
    it('should handle task dependencies in execution order', async () => {
      await orchestrator.initialize();

      const task1Id = orchestrator.createTask({
        title: 'First task',
        description: 'Must complete first',
        type: 'feature',
        acceptanceCriteria: ['Done'],
        assigneeRole: 'implementer',
      });

      orchestrator.createTask({
        title: 'Second task',
        description: 'Depends on first',
        type: 'feature',
        acceptanceCriteria: ['Done'],
        dependsOn: [task1Id],
        assigneeRole: 'implementer',
      });

      const state = orchestrator.getState();
      const tasks = orchestrator.getTasks();

      // Second task should have dependency
      const secondTask = tasks.find((t) => t.title === 'Second task');
      expect(secondTask?.dependsOn).toContain(task1Id);
    });
  });

  describe('event subscription', () => {
    it('should unsubscribe from events', async () => {
      const events: string[] = [];
      const unsubscribe = orchestrator.onEvent((e) => events.push(e.type));

      await orchestrator.createAgent('architect');
      expect(events).toContain('agent_created');

      unsubscribe();
      events.length = 0;

      await orchestrator.createAgent('tester');
      expect(events).toHaveLength(0);
    });
  });
});
