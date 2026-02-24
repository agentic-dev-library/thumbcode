import { OrchestrationStateManager } from '../OrchestrationState';

describe('OrchestrationStateManager', () => {
  let manager: OrchestrationStateManager;

  beforeEach(() => {
    manager = new OrchestrationStateManager({
      provider: 'anthropic',
      maxConcurrentAgents: 3,
      autoAssign: true,
      enableParallelExecution: true,
      projectContext: {
        projectId: 'test-project',
        workspaceDir: '/tmp/test',
        currentBranch: 'main',
        availableFiles: [],
      },
    });
  });

  describe('constructor', () => {
    it('initializes with idle status', () => {
      const state = manager.getState();
      expect(state.status).toBe('idle');
    });

    it('initializes with empty collections', () => {
      const state = manager.getState();
      expect(state.taskQueue).toHaveLength(0);
      expect(state.completedTasks).toHaveLength(0);
    });
  });

  describe('onEvent / emitEvent', () => {
    it('calls registered callbacks with timestamp', () => {
      const callback = vi.fn();
      manager.onEvent(callback);
      manager.emitEvent({ type: 'task_completed', data: { error: 'none' } });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task_completed',
          timestamp: expect.any(String),
        })
      );
    });

    it('supports multiple callbacks', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      manager.onEvent(cb1);
      manager.onEvent(cb2);
      manager.emitEvent({ type: 'task_started' });
      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });

    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsub = manager.onEvent(callback);
      unsub();
      manager.emitEvent({ type: 'task_started' });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('buildExecutionPlan', () => {
    it('returns empty plan with no tasks', () => {
      const plan = manager.buildExecutionPlan();
      expect(plan.ready).toHaveLength(0);
      expect(plan.blocked).toHaveLength(0);
      expect(plan.completed).toHaveLength(0);
    });

    it('marks assigned tasks as ready when no dependencies', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push({
        id: 'task-1',
        type: 'feature',
        title: 'Build feature',
        description: 'Build feature',
        assignee: 'implementer',
        status: 'pending',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      const plan = manager.buildExecutionPlan();
      expect(plan.ready).toContain('task-1');
    });

    it('marks tasks without assignee as not ready', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push({
        id: 'task-1',
        type: 'review',
        title: 'Review PR',
        description: 'Review PR',
        assignee: '',
        status: 'pending',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      const plan = manager.buildExecutionPlan();
      expect(plan.ready).not.toContain('task-1');
    });

    it('puts tasks with pending deps in waiting', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push(
        {
          id: 'task-1',
          type: 'feature',
          title: 'First',
          description: 'First',
          assignee: 'implementer',
          status: 'pending',
          priority: 'medium',
          dependsOn: [],
          acceptanceCriteria: [],
          references: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'task-2',
          type: 'review',
          title: 'Second',
          description: 'Second',
          assignee: 'reviewer',
          status: 'pending',
          priority: 'medium',
          dependsOn: ['task-1'],
          acceptanceCriteria: [],
          references: [],
          createdAt: now,
          updatedAt: now,
        }
      );
      const plan = manager.buildExecutionPlan();
      expect(plan.ready).toContain('task-1');
      expect(plan.waiting.has('task-2')).toBe(true);
    });

    it('marks tasks blocked when dependencies are cancelled', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push({
        id: 'task-2',
        type: 'review',
        title: 'Depends on cancelled',
        description: 'Depends on cancelled',
        assignee: 'reviewer',
        status: 'pending',
        priority: 'medium',
        dependsOn: ['task-1'],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      // task-1 is cancelled (in completedTasks)
      manager.state.completedTasks.push({
        id: 'task-1',
        type: 'feature',
        title: 'Cancelled task',
        description: 'Cancelled task',
        assignee: 'implementer',
        status: 'cancelled',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      const plan = manager.buildExecutionPlan();
      expect(plan.blocked).toContain('task-2');
    });

    it('includes completed task ids', () => {
      const now = new Date().toISOString();
      manager.state.completedTasks.push({
        id: 'task-done',
        type: 'feature',
        title: 'Done',
        description: 'Done',
        assignee: 'implementer',
        status: 'complete',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      const plan = manager.buildExecutionPlan();
      expect(plan.completed).toContain('task-done');
    });
  });

  describe('getMetrics', () => {
    it('returns zero metrics initially', () => {
      const metrics = manager.getMetrics();
      expect(metrics.totalTasksCreated).toBe(0);
      expect(metrics.totalTasksCompleted).toBe(0);
      expect(metrics.totalTasksFailed).toBe(0);
      expect(metrics.totalTokensUsed).toBe(0);
      expect(metrics.averageTaskDuration).toBe(0);
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
    });

    it('calculates metrics from task results', () => {
      const now = new Date().toISOString();
      manager.taskResults.push({
        taskId: 't1',
        agentId: 'agent-1',
        success: true,
        duration: 100,
        result: { summary: '', tokensUsed: 50, agentRole: 'implementer' } as any,
        startedAt: now,
        completedAt: now,
      });
      manager.taskResults.push({
        taskId: 't2',
        agentId: 'agent-2',
        success: false,
        duration: 50,
        result: { summary: 'timeout', tokensUsed: 20, agentRole: 'reviewer' } as any,
        startedAt: now,
        completedAt: now,
      });
      manager.taskIdCounter = 2;

      const metrics = manager.getMetrics();
      expect(metrics.totalTasksCreated).toBe(2);
      expect(metrics.totalTasksCompleted).toBe(1);
      expect(metrics.totalTasksFailed).toBe(1);
      expect(metrics.totalTokensUsed).toBe(70);
      expect(metrics.averageTaskDuration).toBe(100);
    });
  });

  describe('getTask / getTasks', () => {
    it('finds task in queue', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push({
        id: 'q-1',
        type: 'feature',
        title: 'Queue Task',
        description: 'In queue',
        assignee: 'implementer',
        status: 'pending',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      expect(manager.getTask('q-1')).toBeDefined();
      expect(manager.getTask('q-1')!.description).toBe('In queue');
    });

    it('finds task in completed', () => {
      const now = new Date().toISOString();
      manager.state.completedTasks.push({
        id: 'c-1',
        type: 'feature',
        title: 'Completed Task',
        description: 'Completed',
        assignee: 'implementer',
        status: 'complete',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      expect(manager.getTask('c-1')).toBeDefined();
    });

    it('returns undefined for unknown task', () => {
      expect(manager.getTask('unknown')).toBeUndefined();
    });

    it('getTasks returns all tasks', () => {
      const now = new Date().toISOString();
      manager.state.taskQueue.push({
        id: 'q-1',
        type: 'feature',
        title: 'Queue Task',
        description: 'Q',
        assignee: 'implementer',
        status: 'pending',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      manager.state.completedTasks.push({
        id: 'c-1',
        type: 'review',
        title: 'Completed Review',
        description: 'C',
        assignee: 'reviewer',
        status: 'complete',
        priority: 'medium',
        dependsOn: [],
        acceptanceCriteria: [],
        references: [],
        createdAt: now,
        updatedAt: now,
      });
      expect(manager.getTasks()).toHaveLength(2);
    });
  });
});
