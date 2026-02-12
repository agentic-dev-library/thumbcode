/**
 * TaskAssigner Tests
 *
 * Tests for task creation, assignment, and query operations.
 */

import type { Agent, TaskAssignment } from '@thumbcode/types';
import { OrchestrationStateManager } from '../OrchestrationState';
import { TaskAssigner } from '../TaskAssigner';
import type { OrchestratorConfig } from '../types';

// Mock AI SDKs to prevent import errors
jest.mock('@anthropic-ai/sdk', () => jest.fn());
jest.mock('openai', () => jest.fn());

const mockConfig: OrchestratorConfig = {
  provider: 'anthropic',
  maxConcurrentAgents: 4,
  autoAssign: false,
  enableParallelExecution: false,
  projectContext: {
    projectId: 'test-project',
    workspaceDir: '/tmp/workspace',
    currentBranch: 'main',
    availableFiles: [],
  },
};

function createMockAgent(id: string, role: string, status = 'idle'): Agent {
  return {
    id,
    role: role as any,
    name: `${role} agent`,
    status: status as any,
    capabilities: [],
    systemPrompt: '',
    metrics: {
      tasksCompleted: 0,
      tokensUsed: 0,
      averageTaskTime: 0,
      successRate: 1,
    },
  };
}

describe('TaskAssigner', () => {
  let stateManager: OrchestrationStateManager;
  let assigner: TaskAssigner;

  beforeEach(() => {
    stateManager = new OrchestrationStateManager(mockConfig);
    assigner = new TaskAssigner(stateManager, false);
  });

  describe('createTask', () => {
    it('should create a task with generated ID', () => {
      const taskId = assigner.createTask({
        title: 'Implement feature',
        description: 'Create a new feature',
        type: 'feature',
        acceptanceCriteria: ['Must work'],
      });

      expect(taskId).toContain('task');
      const task = assigner.getTask(taskId);
      expect(task).toBeDefined();
      expect(task!.title).toBe('Implement feature');
      expect(task!.status).toBe('pending');
      expect(task!.priority).toBe('medium');
    });

    it('should set custom priority', () => {
      const taskId = assigner.createTask({
        title: 'Critical fix',
        description: 'Fix critical bug',
        type: 'bugfix',
        priority: 'high',
        acceptanceCriteria: ['Bug fixed'],
      });

      const task = assigner.getTask(taskId);
      expect(task!.priority).toBe('high');
    });

    it('should set dependencies', () => {
      const taskId = assigner.createTask({
        title: 'Dependent task',
        description: 'Depends on another',
        type: 'feature',
        dependsOn: ['task-1', 'task-2'],
        acceptanceCriteria: ['Done'],
      });

      const task = assigner.getTask(taskId);
      expect(task!.dependsOn).toEqual(['task-1', 'task-2']);
    });

    it('should emit task_created event', () => {
      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      assigner.createTask({
        title: 'Test task',
        description: 'Testing',
        type: 'test',
        acceptanceCriteria: ['Pass'],
      });

      expect(events).toContain('task_created');
    });

    it('should auto-assign when enabled and role specified', () => {
      const autoAssigner = new TaskAssigner(stateManager, true);
      stateManager.state.agents.set('agent-1', createMockAgent('agent-1', 'implementer'));

      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      const taskId = autoAssigner.createTask({
        title: 'Auto-assign test',
        description: 'Should auto-assign',
        type: 'feature',
        assigneeRole: 'implementer',
        acceptanceCriteria: ['Done'],
      });

      expect(events).toContain('task_assigned');
      const task = autoAssigner.getTask(taskId);
      expect(task!.assignee).toBe('agent-1');
    });

    it('should not auto-assign when autoAssign is false', () => {
      stateManager.state.agents.set('agent-1', createMockAgent('agent-1', 'implementer'));

      const taskId = assigner.createTask({
        title: 'No auto-assign',
        description: 'Should not auto-assign',
        type: 'feature',
        assigneeRole: 'implementer',
        acceptanceCriteria: ['Done'],
      });

      const task = assigner.getTask(taskId);
      expect(task!.assignee).toBe('');
    });
  });

  describe('assignTask', () => {
    it('should assign task to an idle agent with matching role', () => {
      stateManager.state.agents.set('agent-1', createMockAgent('agent-1', 'reviewer'));

      const taskId = assigner.createTask({
        title: 'Review PR',
        description: 'Review code',
        type: 'review',
        acceptanceCriteria: ['Reviewed'],
      });

      assigner.assignTask(taskId, 'reviewer');

      const task = assigner.getTask(taskId);
      expect(task!.assignee).toBe('agent-1');
    });

    it('should throw when task not found', () => {
      expect(() => assigner.assignTask('nonexistent', 'architect')).toThrow('not found');
    });

    it('should throw when no idle agent available', () => {
      stateManager.state.agents.set(
        'agent-1',
        createMockAgent('agent-1', 'implementer', 'thinking')
      );

      const taskId = assigner.createTask({
        title: 'No agent',
        description: 'No idle agent',
        type: 'feature',
        acceptanceCriteria: ['Done'],
      });

      expect(() => assigner.assignTask(taskId, 'implementer')).toThrow('No idle agent');
    });

    it('should emit task_assigned event', () => {
      stateManager.state.agents.set('agent-1', createMockAgent('agent-1', 'tester'));

      const events: string[] = [];
      stateManager.onEvent((e) => events.push(e.type));

      const taskId = assigner.createTask({
        title: 'Test',
        description: 'Test',
        type: 'test',
        acceptanceCriteria: ['Pass'],
      });

      assigner.assignTask(taskId, 'tester');

      expect(events).toContain('task_assigned');
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', () => {
      assigner.createTask({
        title: 'Task 1',
        description: 'First',
        type: 'feature',
        acceptanceCriteria: ['Done'],
      });
      assigner.createTask({
        title: 'Task 2',
        description: 'Second',
        type: 'bugfix',
        acceptanceCriteria: ['Fixed'],
      });

      expect(assigner.getTasks()).toHaveLength(2);
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', () => {
      assigner.createTask({
        title: 'Pending',
        description: 'Pending task',
        type: 'feature',
        acceptanceCriteria: ['Done'],
      });

      expect(assigner.getTasksByStatus('pending')).toHaveLength(1);
      expect(assigner.getTasksByStatus('complete')).toHaveLength(0);
    });
  });
});
