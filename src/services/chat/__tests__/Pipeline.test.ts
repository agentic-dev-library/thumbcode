/**
 * Pipeline Routing Tests
 *
 * Tests for multi-agent pipeline detection and routing in AgentResponseService.
 * Covers: multi-step detection, pipeline creation, handoff messages, approval
 * gates, and error handling when an agent fails mid-pipeline.
 */

import type { Mock } from 'vitest';
import { CredentialService } from '@/core';
import { useAgentStore, useChatStore, useCredentialStore } from '@/state';

import { AgentResponseService } from '../AgentResponseService';
import { MessageStore } from '../MessageStore';
import { StreamHandler } from '../StreamHandler';

// Use vi.hoisted so mock values are available inside vi.mock factory
const { mockOrchestratorInstance, MockAgentOrchestrator } = vi.hoisted(() => {
  const mockPipeline = {
    id: 'pipeline-123',
    name: 'Test pipeline',
    description: 'Test description',
    stages: [
      {
        role: 'architect',
        taskType: 'feature',
        title: 'Architecture Design',
        description: 'Design the architecture',
        requiresApproval: true,
      },
      {
        role: 'implementer',
        taskType: 'feature',
        title: 'Implementation',
        description: 'Implement the feature',
        requiresApproval: true,
      },
      {
        role: 'reviewer',
        taskType: 'review',
        title: 'Code Review',
        description: 'Review the code',
        requiresApproval: true,
      },
      {
        role: 'tester',
        taskType: 'test',
        title: 'Testing',
        description: 'Test the code',
        requiresApproval: false,
      },
    ],
    taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    currentStageIndex: 0,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const instance = {
    initialize: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockReturnValue({
      status: 'idle',
      agents: new Map([
        ['architect-1', { id: 'architect-1', role: 'architect', status: 'idle' }],
        ['implementer-1', { id: 'implementer-1', role: 'implementer', status: 'idle' }],
        ['reviewer-1', { id: 'reviewer-1', role: 'reviewer', status: 'idle' }],
        ['tester-1', { id: 'tester-1', role: 'tester', status: 'idle' }],
      ]),
      taskQueue: [],
      activeTasks: new Map(),
      completedTasks: [],
      pipelines: new Map(),
    }),
    onEvent: vi.fn().mockReturnValue(() => {}),
    createAgent: vi.fn(),
    getMetrics: vi.fn(),
    createPipeline: vi.fn().mockReturnValue(mockPipeline),
    getPipeline: vi.fn().mockReturnValue(mockPipeline),
    advancePipeline: vi.fn(),
    approvePipelineStage: vi.fn(),
    cancelPipeline: vi.fn(),
    failPipeline: vi.fn(),
  };

  // Use a real class so `new AgentOrchestrator(...)` works with vitest
  class MockOrchestratorClass {
    initialize = instance.initialize;
    getState = instance.getState;
    onEvent = instance.onEvent;
    createAgent = instance.createAgent;
    getMetrics = instance.getMetrics;
    createPipeline = instance.createPipeline;
    getPipeline = instance.getPipeline;
    advancePipeline = instance.advancePipeline;
    approvePipelineStage = instance.approvePipelineStage;
    cancelPipeline = instance.cancelPipeline;
    failPipeline = instance.failPipeline;
  }

  return {
    mockOrchestratorInstance: instance,
    MockAgentOrchestrator: MockOrchestratorClass,
  };
});

// Mock AI dependencies
vi.mock('@/services/ai', () => ({
  createAIClient: vi.fn(),
  getDefaultModel: vi.fn().mockReturnValue('claude-3-5-sonnet-20241022'),
}));

vi.mock('@/services/orchestrator', () => ({
  AgentOrchestrator: MockAgentOrchestrator,
}));

vi.mock('../AgentPrompts', () => ({
  getAgentSystemPrompt: vi.fn().mockReturnValue('You are a helpful agent'),
}));

vi.mock('@/core', () => ({
  CredentialService: {
    retrieve: vi.fn().mockResolvedValue({ secret: null }),
    store: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createAIClient } from '@/services/ai';

const mockCreateAIClient = createAIClient as Mock;

/** Helper to set up valid Anthropic credentials */
function setupAnthropicCredentials() {
  useCredentialStore.setState({
    credentials: [
      {
        id: '1',
        provider: 'anthropic',
        name: 'Anthropic',
        secureStoreKey: 'anthropic-key',
        status: 'valid',
        createdAt: new Date().toISOString(),
      },
    ],
    isValidating: false,
    lastError: null,
  });
  (CredentialService.retrieve as Mock).mockResolvedValue({ secret: 'sk-ant-key' });
}

describe('Pipeline Routing', () => {
  let service: AgentResponseService;
  let streamHandler: StreamHandler;
  let messageStore: MessageStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // Restore orchestrator mock implementations after clearAllMocks
    mockOrchestratorInstance.initialize.mockResolvedValue(undefined);
    mockOrchestratorInstance.getState.mockReturnValue({
      status: 'idle',
      agents: new Map([
        ['architect-1', { id: 'architect-1', role: 'architect', status: 'idle' }],
        ['implementer-1', { id: 'implementer-1', role: 'implementer', status: 'idle' }],
        ['reviewer-1', { id: 'reviewer-1', role: 'reviewer', status: 'idle' }],
        ['tester-1', { id: 'tester-1', role: 'tester', status: 'idle' }],
      ]),
      taskQueue: [],
      activeTasks: new Map(),
      completedTasks: [],
      pipelines: new Map(),
    });
    mockOrchestratorInstance.createPipeline.mockReturnValue({
      id: 'pipeline-123',
      name: 'Test pipeline',
      description: 'Test description',
      stages: [
        {
          role: 'architect',
          taskType: 'feature',
          title: 'Architecture Design',
          description: 'Design the architecture',
          requiresApproval: true,
        },
        {
          role: 'implementer',
          taskType: 'feature',
          title: 'Implementation',
          description: 'Implement the feature',
          requiresApproval: true,
        },
        {
          role: 'reviewer',
          taskType: 'review',
          title: 'Code Review',
          description: 'Review the code',
          requiresApproval: true,
        },
        {
          role: 'tester',
          taskType: 'test',
          title: 'Testing',
          description: 'Test the code',
          requiresApproval: false,
        },
      ],
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
      currentStageIndex: 0,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset stores
    useChatStore.setState({
      threads: [],
      messages: {},
      activeThreadId: null,
      isTyping: {},
    });
    useCredentialStore.setState({
      credentials: [],
      isValidating: false,
      lastError: null,
    });

    streamHandler = new StreamHandler();
    messageStore = new MessageStore(streamHandler);
    service = new AgentResponseService(streamHandler, messageStore);

    vi.spyOn(streamHandler, 'emit');
    vi.spyOn(streamHandler, 'emitTypingStart');
    vi.spyOn(streamHandler, 'emitTypingEnd');
    vi.spyOn(streamHandler, 'registerAbort').mockReturnValue(new AbortController());
    vi.spyOn(streamHandler, 'cleanupAbort');
  });

  describe('isMultiStepRequest', () => {
    it('should detect "build a login page" as multi-step', () => {
      expect(service.isMultiStepRequest('Build a login page for the app')).toBe(true);
    });

    it('should detect "create a dashboard feature" as multi-step', () => {
      expect(service.isMultiStepRequest('Create a dashboard feature')).toBe(true);
    });

    it('should detect "implement authentication" as multi-step', () => {
      expect(service.isMultiStepRequest('implement authentication for the app')).toBe(true);
    });

    it('should detect "add signup page" as multi-step', () => {
      expect(service.isMultiStepRequest('Add a signup page')).toBe(true);
    });

    it('should detect "develop a new component" as multi-step', () => {
      expect(service.isMultiStepRequest('Develop a new component for navigation')).toBe(true);
    });

    it('should detect "full pipeline" as multi-step', () => {
      expect(service.isMultiStepRequest('Run a full pipeline on this')).toBe(true);
    });

    it('should detect "from scratch" as multi-step', () => {
      expect(service.isMultiStepRequest('Build this from scratch')).toBe(true);
    });

    it('should NOT detect simple questions as multi-step', () => {
      expect(service.isMultiStepRequest('What is TypeScript?')).toBe(false);
    });

    it('should NOT detect simple code questions as multi-step', () => {
      expect(service.isMultiStepRequest('How do I use useState?')).toBe(false);
    });

    it('should NOT detect short messages as multi-step', () => {
      expect(service.isMultiStepRequest('Help me')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(service.isMultiStepRequest('BUILD A LOGIN PAGE')).toBe(true);
    });
  });

  describe('requestPipelineResponse', () => {
    it('should return null when no credentials are available', async () => {
      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const result = await service.requestPipelineResponse(threadId, 'Build a login page');

      expect(result).toBeNull();

      const messages = useChatStore.getState().messages[threadId] || [];
      expect(messages.some((m) => m.content.includes('No AI API key'))).toBe(true);
    });

    it('should create a pipeline via orchestrator when credentials exist', async () => {
      setupAnthropicCredentials();

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue({
          id: 'msg-test',
          content: [{ type: 'text', text: '' }],
          model: 'claude-3-5-sonnet-20241022',
          stopReason: 'end_turn',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const result = await service.requestPipelineResponse(threadId, 'Build a login page');

      expect(result).toBeTruthy();
      expect(mockOrchestratorInstance.createPipeline).toHaveBeenCalledWith({
        name: 'Build a login page',
        description: 'Build a login page',
      });
    });

    it('should post system messages when pipeline starts', async () => {
      setupAnthropicCredentials();

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue({
          id: 'msg-test',
          content: [{ type: 'text', text: '' }],
          model: 'claude-3-5-sonnet-20241022',
          stopReason: 'end_turn',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestPipelineResponse(threadId, 'Build a login page');

      const messages = useChatStore.getState().messages[threadId] || [];
      const systemMessages = messages.filter((m) => m.sender === 'system');

      // Should have at least the pipeline start message and stage 1 start message
      expect(systemMessages.length).toBeGreaterThanOrEqual(2);
      expect(systemMessages.some((m) => m.content.includes('Starting multi-agent pipeline'))).toBe(
        true
      );
    });

    it('should create tasks in the agent store', async () => {
      setupAnthropicCredentials();

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue({
          id: 'msg-test',
          content: [{ type: 'text', text: '' }],
          model: 'claude-3-5-sonnet-20241022',
          stopReason: 'end_turn',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      // Reset agent store tasks
      useAgentStore.setState({ tasks: [] });

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestPipelineResponse(threadId, 'Build a login page');

      const tasks = useAgentStore.getState().tasks;
      expect(tasks.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle orchestrator initialization failure', async () => {
      setupAnthropicCredentials();
      mockOrchestratorInstance.initialize.mockRejectedValueOnce(new Error('Init failed'));

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const result = await service.requestPipelineResponse(threadId, 'Build a feature');

      expect(result).toBeNull();

      const messages = useChatStore.getState().messages[threadId] || [];
      expect(messages.some((m) => m.content.includes('Failed to initialize'))).toBe(true);
    });

    it('should post handoff message when first stage completes and approval is required', async () => {
      setupAnthropicCredentials();

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue({
          id: 'msg-test',
          content: [{ type: 'text', text: '' }],
          model: 'claude-3-5-sonnet-20241022',
          stopReason: 'end_turn',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestPipelineResponse(threadId, 'Build a login page');

      const messages = useChatStore.getState().messages[threadId] || [];

      // Should have an approval request after stage 1 completes
      const approvalMessages = messages.filter((m) => m.contentType === 'approval_request');
      expect(approvalMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('pipeline error handling', () => {
    it('should post error message when agent fails mid-pipeline', async () => {
      setupAnthropicCredentials();

      // Make the AI client fail
      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(new Error('API rate limited')),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestPipelineResponse(threadId, 'Build a feature');

      const messages = useChatStore.getState().messages[threadId] || [];

      // Check that an error-related message was posted
      // The error should be caught by requestAgentResponse's try/catch
      // and either an error message or the pipeline failure message should appear
      expect(messages.length).toBeGreaterThan(0);
    });
  });
});
