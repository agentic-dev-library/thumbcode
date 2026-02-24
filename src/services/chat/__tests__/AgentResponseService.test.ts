/**
 * AgentResponseService Tests
 *
 * Tests for credential resolution, orchestrator routing, streaming with
 * mocked AI client, abort/cancel, and approval request/response workflows.
 */

import { useChatStore, useCredentialStore } from '@/state';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import type { Mock } from 'vitest';

import { AgentResponseService } from '../AgentResponseService';
import { MessageStore } from '../MessageStore';
import { StreamHandler } from '../StreamHandler';

// Use vi.hoisted so mock values are available inside vi.mock factory (which is hoisted)
const { mockOrchestratorInstance, MockAgentOrchestrator } = vi.hoisted(() => {
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
    }),
    onEvent: vi.fn().mockReturnValue(() => {}),
    createAgent: vi.fn(),
    getMetrics: vi.fn(),
  };
  return {
    mockOrchestratorInstance: instance,
    MockAgentOrchestrator: vi.fn().mockImplementation(() => instance),
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

import { createAIClient } from '@/services/ai';

const mockCreateAIClient = createAIClient as Mock;

/** Helper to create a mock CompletionResponse */
function mockCompletionResponse(text = '') {
  return {
    id: 'msg-test',
    content: [{ type: 'text' as const, text }],
    model: 'claude-3-5-sonnet-20241022',
    stopReason: 'end_turn' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
  };
}

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
  (SecureStoragePlugin.get as Mock).mockResolvedValue({ value: 'sk-ant-key' });
}

describe('AgentResponseService', () => {
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
    });
    MockAgentOrchestrator.mockImplementation(() => mockOrchestratorInstance);

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

    // Spy on streamHandler methods
    vi.spyOn(streamHandler, 'emit');
    vi.spyOn(streamHandler, 'emitTypingStart');
    vi.spyOn(streamHandler, 'emitTypingEnd');
    vi.spyOn(streamHandler, 'registerAbort').mockReturnValue(new AbortController());
    vi.spyOn(streamHandler, 'cleanupAbort');
  });

  describe('credential resolution', () => {
    it('should prefer Anthropic credentials when both are available', async () => {
      // Set up both Anthropic and OpenAI credentials
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
          {
            id: '2',
            provider: 'openai',
            name: 'OpenAI',
            secureStoreKey: 'openai-key',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      (SecureStoragePlugin.get as Mock).mockResolvedValue({ value: 'sk-ant-test-key' });

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse()),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      // Create thread and message
      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      expect(mockCreateAIClient).toHaveBeenCalledWith('anthropic', 'sk-ant-test-key');
    });

    it('should fallback to OpenAI when Anthropic is unavailable', async () => {
      useCredentialStore.setState({
        credentials: [
          {
            id: '1',
            provider: 'openai',
            name: 'OpenAI',
            secureStoreKey: 'openai-key',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      (SecureStoragePlugin.get as Mock).mockResolvedValue({ value: 'sk-test-openai-key' });

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse()),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'implementer');

      expect(mockCreateAIClient).toHaveBeenCalledWith('openai', 'sk-test-openai-key');
    });

    it('should add error message when no AI key is configured', async () => {
      useCredentialStore.setState({
        credentials: [],
        isValidating: false,
        lastError: null,
      });

      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      const messages = useChatStore.getState().messages[threadId] || [];
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toContain('No AI API key configured');
      expect(messages[0].sender).toBe('architect');
      expect(mockCreateAIClient).not.toHaveBeenCalled();
    });

    it('should skip credentials with invalid status', async () => {
      useCredentialStore.setState({
        credentials: [
          {
            id: '1',
            provider: 'anthropic',
            name: 'Anthropic',
            secureStoreKey: 'anthropic-key',
            status: 'invalid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      const messages = useChatStore.getState().messages[threadId] || [];
      expect(messages[0].content).toContain('No AI API key configured');
    });
  });

  describe('orchestrator routing', () => {
    beforeEach(() => {
      setupAnthropicCredentials();
    });

    it('should successfully route agent messages with orchestrator available', async () => {
      const mockClient = {
        completeStream: vi.fn().mockImplementation(async (_msgs: any, _opts: any, onEvent: any) => {
          onEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text', text: 'Architect response' },
          });
          return mockCompletionResponse('Architect response');
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      // Verify the complete message lifecycle
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_start', sender: 'architect' })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_complete', sender: 'architect' })
      );

      // Verify message was stored
      const messages = useChatStore.getState().messages[threadId] || [];
      const agentMsg = messages.find((m) => m.sender === 'architect');
      expect(agentMsg).toBeDefined();
      expect(agentMsg?.content).toBe('Architect response');
    });

    it('should handle multiple sequential requests to different agents', async () => {
      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse('response')),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');
      await service.requestAgentResponse(threadId, 'msg-2', 'implementer');

      // Both should complete without errors
      const emitCalls = (streamHandler.emit as Mock).mock.calls;
      const completeCalls = emitCalls.filter((call: any) => call[0].type === 'message_complete');
      expect(completeCalls).toHaveLength(2);
      expect(completeCalls[0][0].sender).toBe('architect');
      expect(completeCalls[1][0].sender).toBe('implementer');
    });

    it.each([
      'architect',
      'implementer',
      'reviewer',
      'tester',
    ] as const)('should route %s messages through the orchestrator', async (agentRole) => {
      const mockClient = {
        completeStream: vi.fn().mockImplementation(async (_msgs: any, _opts: any, onEvent: any) => {
          onEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text', text: `Response from ${agentRole}` },
          });
          return mockCompletionResponse(`Response from ${agentRole}`);
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', agentRole);

      // Should emit message events for this agent
      expect(streamHandler.emitTypingStart).toHaveBeenCalledWith(threadId, agentRole);
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_start', sender: agentRole })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message_delta',
          delta: `Response from ${agentRole}`,
          sender: agentRole,
        })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_complete', sender: agentRole })
      );
      expect(streamHandler.emitTypingEnd).toHaveBeenCalledWith(threadId, agentRole);
    });

    it('should not initialize orchestrator for non-agent senders', async () => {
      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse()),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      // 'system' is not an agent role
      await service.requestAgentResponse(threadId, 'msg-1', 'system');

      expect(MockAgentOrchestrator).not.toHaveBeenCalled();
    });
  });

  describe('orchestrator error handling', () => {
    beforeEach(() => {
      setupAnthropicCredentials();
    });

    it('should fall back to direct AI client when orchestrator initialization fails', async () => {
      // Make orchestrator initialization fail
      mockOrchestratorInstance.initialize.mockRejectedValueOnce(
        new Error('Orchestrator init failed')
      );

      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse('fallback response')),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      // Should NOT throw — should fall back gracefully
      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      // Should still have called the AI client (fallback path)
      expect(mockClient.completeStream).toHaveBeenCalled();

      // Should have completed the message lifecycle
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_complete' })
      );
    });

    it('should emit error event when AI client streaming fails', async () => {
      const error = new Error('API rate limited');
      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(error),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          threadId,
          error,
        })
      );
    });

    it('should clear typing state even when orchestrator and AI both fail', async () => {
      mockOrchestratorInstance.initialize.mockRejectedValueOnce(new Error('Init failed'));

      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(new Error('Stream failed')),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'reviewer');

      expect(streamHandler.emitTypingEnd).toHaveBeenCalledWith(threadId, 'reviewer');
      expect(streamHandler.cleanupAbort).toHaveBeenCalledWith(threadId);
    });

    it('should re-initialize orchestrator if provider changes', async () => {
      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse()),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      // First request with Anthropic
      await service.requestAgentResponse(threadId, 'msg-1', 'architect');
      expect(MockAgentOrchestrator).toHaveBeenCalledTimes(1);

      // Switch to OpenAI credentials
      useCredentialStore.setState({
        credentials: [
          {
            id: '2',
            provider: 'openai',
            name: 'OpenAI',
            secureStoreKey: 'openai-key',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });
      (SecureStoragePlugin.get as Mock).mockResolvedValue({ value: 'sk-openai-key' });

      // Second request should re-initialize with new provider
      await service.requestAgentResponse(threadId, 'msg-2', 'implementer');
      expect(MockAgentOrchestrator).toHaveBeenCalledTimes(2);
    });
  });

  describe('streaming', () => {
    beforeEach(() => {
      setupAnthropicCredentials();
    });

    it('should stream response and emit events', async () => {
      const mockClient = {
        completeStream: vi.fn().mockImplementation(async (_msgs: any, _opts: any, onEvent: any) => {
          // Simulate streaming content_block_delta events
          onEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text', text: 'Hello' },
          });
          onEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text', text: ' world' },
          });
          return mockCompletionResponse('Hello world');
        }),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      // Should have emitted typing_start, message_start, message_delta (x2), message_complete, typing_end
      expect(streamHandler.emitTypingStart).toHaveBeenCalledWith(threadId, 'architect');
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_start' })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_delta', delta: 'Hello' })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_delta', delta: ' world' })
      );
      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'message_complete' })
      );
      expect(streamHandler.emitTypingEnd).toHaveBeenCalledWith(threadId, 'architect');
    });

    it('should clean up abort controller after completion', async () => {
      const mockClient = {
        completeStream: vi.fn().mockResolvedValue(mockCompletionResponse()),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      expect(streamHandler.cleanupAbort).toHaveBeenCalledWith(threadId);
    });
  });

  describe('abort/cancel', () => {
    beforeEach(() => {
      setupAnthropicCredentials();
    });

    it('should not emit error event on AbortError', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(abortError),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      // Should not emit error event for abort
      const errorCalls = (streamHandler.emit as Mock).mock.calls.filter(
        (call: any) => call[0].type === 'error'
      );
      expect(errorCalls).toHaveLength(0);
    });

    it('should emit error event for non-abort errors', async () => {
      const error = new Error('API rate limited');
      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(error),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          threadId,
          error,
        })
      );
    });

    it('should always clear typing state after error', async () => {
      const mockClient = {
        completeStream: vi.fn().mockRejectedValue(new Error('Failure')),
      };
      mockCreateAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'implementer');

      expect(streamHandler.emitTypingEnd).toHaveBeenCalledWith(threadId, 'implementer');
      expect(streamHandler.cleanupAbort).toHaveBeenCalledWith(threadId);
    });
  });

  describe('approval request', () => {
    it('should create an approval request message', () => {
      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const messageId = service.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'commit',
        actionDescription: 'Commit changes to main branch',
      });

      expect(messageId).toBeDefined();

      const messages = useChatStore.getState().messages[threadId] || [];
      const approvalMsg = messages.find((m) => m.id === messageId);
      expect(approvalMsg).toBeDefined();
      expect(approvalMsg?.contentType).toBe('approval_request');
      expect(approvalMsg?.content).toContain('Commit changes to main branch');
      expect(approvalMsg?.sender).toBe('implementer');
    });

    it('should emit approval_request event', () => {
      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      service.requestApproval({
        threadId,
        sender: 'architect',
        actionType: 'push',
        actionDescription: 'Push to origin/main',
      });

      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approval_request',
          threadId,
          sender: 'architect',
        })
      );
    });
  });

  describe('approval response', () => {
    it('should respond to an approval and emit event', () => {
      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const messageId = service.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'deploy',
        actionDescription: 'Deploy to production',
      });

      service.respondToApproval(threadId, messageId, true);

      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approval_response',
          threadId,
          messageId,
        })
      );
    });

    it('should handle rejection', () => {
      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      const messageId = service.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'merge',
        actionDescription: 'Merge PR #42',
      });

      service.respondToApproval(threadId, messageId, false);

      expect(streamHandler.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approval_response',
          threadId,
          messageId,
        })
      );
    });
  });
});
