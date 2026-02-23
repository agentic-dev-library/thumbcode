/**
 * Pipeline Tests
 *
 * Tests for multi-agent pipeline creation, stage progression,
 * approval gates, and failure handling in the AgentOrchestrator.
 */

import type { AgentContext } from '../../agents/base-agent';
import { AgentOrchestrator } from '../orchestrator';
import type { OrchestratorEvent, PipelineStage } from '../types';

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

describe('Pipeline', () => {
  const mockContext: AgentContext = {
    projectId: 'test-project',
    workspaceDir: '/tmp/workspace',
    currentBranch: 'main',
    availableFiles: ['src/index.ts'],
  };

  let orchestrator: AgentOrchestrator;

  beforeEach(async () => {
    orchestrator = new AgentOrchestrator(
      {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        maxConcurrentAgents: 4,
        autoAssign: true,
        enableParallelExecution: false,
        projectContext: mockContext,
      },
      'sk-ant-test'
    );
    await orchestrator.initialize();
  });

  describe('createPipeline', () => {
    it('should create a pipeline with default stages', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build login page',
        description: 'Create a login page with email/password authentication',
      });

      expect(pipeline.id).toContain('pipeline');
      expect(pipeline.name).toBe('Build login page');
      expect(pipeline.stages).toHaveLength(4);
      expect(pipeline.taskIds).toHaveLength(4);
      expect(pipeline.currentStageIndex).toBe(0);
      expect(pipeline.status).toBe('pending');
    });

    it('should create tasks for each stage in the correct order', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const tasks = orchestrator.getTasks();
      expect(tasks).toHaveLength(4);

      // Verify stage roles in order
      const stageRoles = pipeline.stages.map((s) => s.role);
      expect(stageRoles).toEqual(['architect', 'implementer', 'reviewer', 'tester']);
    });

    it('should set up task dependencies forming a chain', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const tasks = orchestrator.getTasks();

      // First task has no dependencies
      const firstTask = tasks.find((t) => t.id === pipeline.taskIds[0]);
      expect(firstTask?.dependsOn).toEqual([]);

      // Each subsequent task depends on the previous one
      for (let i = 1; i < pipeline.taskIds.length; i++) {
        const task = tasks.find((t) => t.id === pipeline.taskIds[i]);
        expect(task?.dependsOn).toEqual([pipeline.taskIds[i - 1]]);
      }
    });

    it('should emit pipeline_created event', () => {
      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const pipelineEvents = events.filter((e) => e.type === 'pipeline_created');
      expect(pipelineEvents).toHaveLength(1);
      expect(pipelineEvents[0].data?.pipeline).toBeDefined();
    });

    it('should accept custom stages', () => {
      const customStages: PipelineStage[] = [
        {
          role: 'architect',
          taskType: 'feature',
          title: 'Design',
          description: 'Design the feature',
          requiresApproval: false,
        },
        {
          role: 'implementer',
          taskType: 'feature',
          title: 'Code',
          description: 'Write the code',
          requiresApproval: false,
        },
      ];

      const pipeline = orchestrator.createPipeline({
        name: 'Quick feature',
        description: 'A quick two-step pipeline',
        stages: customStages,
      });

      expect(pipeline.stages).toHaveLength(2);
      expect(pipeline.taskIds).toHaveLength(2);
      expect(pipeline.stages[0].role).toBe('architect');
      expect(pipeline.stages[1].role).toBe('implementer');
    });

    it('should store pipeline in state', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const retrieved = orchestrator.getPipeline(pipeline.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(pipeline.id);
    });
  });

  describe('getPipelines', () => {
    it('should return all pipelines', () => {
      orchestrator.createPipeline({ name: 'Pipeline 1', description: 'First' });
      orchestrator.createPipeline({ name: 'Pipeline 2', description: 'Second' });

      const pipelines = orchestrator.getPipelines();
      expect(pipelines).toHaveLength(2);
    });

    it('should return empty array when no pipelines exist', () => {
      expect(orchestrator.getPipelines()).toHaveLength(0);
    });
  });

  describe('advancePipeline', () => {
    it('should advance to the next stage', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      orchestrator.advancePipeline(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.currentStageIndex).toBe(1);
    });

    it('should emit pipeline_stage_completed event', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.advancePipeline(pipeline.id);

      const completedEvents = events.filter((e) => e.type === 'pipeline_stage_completed');
      expect(completedEvents).toHaveLength(1);
      expect(completedEvents[0].data?.stageIndex).toBe(0);
    });

    it('should set status to awaiting_approval when next stage requires it', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      // Default stage 1 (implementer) requiresApproval: true
      orchestrator.advancePipeline(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('awaiting_approval');
    });

    it('should set status to running when next stage does not require approval', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Quick build',
        description: 'Build quickly',
        stages: [
          {
            role: 'architect',
            taskType: 'feature',
            title: 'Design',
            description: 'Design',
            requiresApproval: false,
          },
          {
            role: 'implementer',
            taskType: 'feature',
            title: 'Code',
            description: 'Code',
            requiresApproval: false,
          },
        ],
      });

      orchestrator.advancePipeline(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('running');
    });

    it('should complete pipeline when last stage finishes', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Single stage',
        description: 'One stage pipeline',
        stages: [
          {
            role: 'architect',
            taskType: 'feature',
            title: 'Design',
            description: 'Design',
            requiresApproval: false,
          },
        ],
      });

      orchestrator.advancePipeline(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();
    });

    it('should emit pipeline_completed event when done', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Single stage',
        description: 'One stage',
        stages: [
          {
            role: 'architect',
            taskType: 'feature',
            title: 'Design',
            description: 'Design',
            requiresApproval: false,
          },
        ],
      });

      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.advancePipeline(pipeline.id);

      const completedEvents = events.filter((e) => e.type === 'pipeline_completed');
      expect(completedEvents).toHaveLength(1);
    });

    it('should not advance a completed pipeline', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Single stage',
        description: 'One stage',
        stages: [
          {
            role: 'architect',
            taskType: 'feature',
            title: 'Design',
            description: 'Design',
            requiresApproval: false,
          },
        ],
      });

      orchestrator.advancePipeline(pipeline.id);
      const stageAfterComplete = orchestrator.getPipeline(pipeline.id)?.currentStageIndex;

      // Try to advance again
      orchestrator.advancePipeline(pipeline.id);

      expect(orchestrator.getPipeline(pipeline.id)?.currentStageIndex).toBe(stageAfterComplete);
    });

    it('should not advance a non-existent pipeline', () => {
      // Should not throw
      orchestrator.advancePipeline('nonexistent');
    });
  });

  describe('approvePipelineStage', () => {
    it('should approve a pipeline stage and set status to running', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      // Advance to stage that requires approval
      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('awaiting_approval');

      orchestrator.approvePipelineStage(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('running');
    });

    it('should emit pipeline_approval_received and pipeline_stage_started events', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      orchestrator.advancePipeline(pipeline.id);

      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.approvePipelineStage(pipeline.id);

      expect(events.some((e) => e.type === 'pipeline_approval_received')).toBe(true);
      expect(events.some((e) => e.type === 'pipeline_stage_started')).toBe(true);
    });

    it('should not approve a pipeline that is not awaiting approval', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      // Pipeline is still 'pending', not 'awaiting_approval'
      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.approvePipelineStage(pipeline.id);

      const approvalEvents = events.filter((e) => e.type === 'pipeline_approval_received');
      expect(approvalEvents).toHaveLength(0);
    });
  });

  describe('cancelPipeline', () => {
    it('should cancel a pipeline', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      orchestrator.cancelPipeline(pipeline.id);

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('cancelled');
    });

    it('should emit pipeline_cancelled event', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.cancelPipeline(pipeline.id);

      expect(events.some((e) => e.type === 'pipeline_cancelled')).toBe(true);
    });

    it('should not cancel an already completed pipeline', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Single stage',
        description: 'One stage',
        stages: [
          {
            role: 'architect',
            taskType: 'feature',
            title: 'Design',
            description: 'Design',
            requiresApproval: false,
          },
        ],
      });

      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('completed');

      orchestrator.cancelPipeline(pipeline.id);

      // Still completed, not cancelled
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('completed');
    });
  });

  describe('failPipeline', () => {
    it('should fail a pipeline with an error message', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      orchestrator.failPipeline(pipeline.id, 'Agent crashed');

      const updated = orchestrator.getPipeline(pipeline.id);
      expect(updated?.status).toBe('failed');
      expect(updated?.error).toBe('Agent crashed');
    });

    it('should emit pipeline_failed event', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Build feature',
        description: 'Build a feature',
      });

      const events: OrchestratorEvent[] = [];
      orchestrator.onEvent((e) => events.push(e));

      orchestrator.failPipeline(pipeline.id, 'Something went wrong');

      const failedEvents = events.filter((e) => e.type === 'pipeline_failed');
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].data?.error).toBe('Something went wrong');
    });

    it('should not fail a non-existent pipeline', () => {
      // Should not throw
      orchestrator.failPipeline('nonexistent', 'error');
    });
  });

  describe('DEFAULT_PIPELINE_STAGES', () => {
    it('should define 4 stages in correct order', () => {
      const stages = AgentOrchestrator.DEFAULT_PIPELINE_STAGES;
      expect(stages).toHaveLength(4);
      expect(stages[0].role).toBe('architect');
      expect(stages[1].role).toBe('implementer');
      expect(stages[2].role).toBe('reviewer');
      expect(stages[3].role).toBe('tester');
    });

    it('should have approval gates on first 3 stages', () => {
      const stages = AgentOrchestrator.DEFAULT_PIPELINE_STAGES;
      expect(stages[0].requiresApproval).toBe(true);
      expect(stages[1].requiresApproval).toBe(true);
      expect(stages[2].requiresApproval).toBe(true);
      expect(stages[3].requiresApproval).toBe(false);
    });
  });

  describe('full pipeline progression', () => {
    it('should progress through all stages with approvals', () => {
      const pipeline = orchestrator.createPipeline({
        name: 'Full build',
        description: 'Full pipeline test',
      });

      const events: string[] = [];
      orchestrator.onEvent((e) => events.push(e.type));

      // Stage 0 (architect) -> advance -> awaiting approval for stage 1
      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('awaiting_approval');
      expect(orchestrator.getPipeline(pipeline.id)?.currentStageIndex).toBe(1);

      // Approve stage 1 (implementer)
      orchestrator.approvePipelineStage(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('running');

      // Stage 1 (implementer) -> advance -> awaiting approval for stage 2
      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('awaiting_approval');
      expect(orchestrator.getPipeline(pipeline.id)?.currentStageIndex).toBe(2);

      // Approve stage 2 (reviewer)
      orchestrator.approvePipelineStage(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('running');

      // Stage 2 (reviewer) -> advance -> tester stage (no approval needed, auto-starts)
      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.currentStageIndex).toBe(3);

      // Stage 3 (tester) -> advance -> pipeline complete
      orchestrator.advancePipeline(pipeline.id);
      expect(orchestrator.getPipeline(pipeline.id)?.status).toBe('completed');

      // Verify event sequence
      expect(events).toContain('pipeline_stage_completed');
      expect(events).toContain('pipeline_awaiting_approval');
      expect(events).toContain('pipeline_approval_received');
      expect(events).toContain('pipeline_stage_started');
      expect(events).toContain('pipeline_completed');
    });
  });
});
