/**
 * AgentResponseService Tests
 *
 * Tests for credential resolution, streaming with mocked AI client,
 * abort/cancel, and approval request/response workflows.
 */

import { useChatStore, useCredentialStore } from '@thumbcode/state';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { AgentResponseService } from '../AgentResponseService';
import { MessageStore } from '../MessageStore';
import { StreamHandler } from '../StreamHandler';

// Mock AI dependencies
jest.mock('../../ai/AIClientFactory', () => ({
  createAIClient: jest.fn(),
}));

jest.mock('../../ai/AgentPrompts', () => ({
  getAgentSystemPrompt: jest.fn().mockReturnValue('You are a helpful agent'),
}));

const { createAIClient } = require('../../ai/AIClientFactory');

describe('AgentResponseService', () => {
  let service: AgentResponseService;
  let streamHandler: StreamHandler;
  let messageStore: MessageStore;

  beforeEach(() => {
    jest.clearAllMocks();

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
    jest.spyOn(streamHandler, 'emit');
    jest.spyOn(streamHandler, 'emitTypingStart');
    jest.spyOn(streamHandler, 'emitTypingEnd');
    jest.spyOn(streamHandler, 'registerAbort').mockReturnValue(new AbortController());
    jest.spyOn(streamHandler, 'cleanupAbort');
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

      (SecureStoragePlugin.get as jest.Mock).mockResolvedValue({ value: 'sk-ant-test-key' });

      const mockClient = {
        streamMessage: jest.fn().mockResolvedValue(undefined),
      };
      createAIClient.mockReturnValue(mockClient);

      // Create thread and message
      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      expect(createAIClient).toHaveBeenCalledWith('anthropic', 'sk-ant-test-key');
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

      (SecureStoragePlugin.get as jest.Mock).mockResolvedValue({ value: 'sk-test-openai-key' });

      const mockClient = {
        streamMessage: jest.fn().mockResolvedValue(undefined),
      };
      createAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test Thread',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'implementer');

      expect(createAIClient).toHaveBeenCalledWith('openai', 'sk-test-openai-key');
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
      expect(createAIClient).not.toHaveBeenCalled();
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

  describe('streaming', () => {
    beforeEach(() => {
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
      (SecureStoragePlugin.get as jest.Mock).mockResolvedValue({ value: 'sk-ant-key' });
    });

    it('should stream response and emit events', async () => {
      const mockClient = {
        streamMessage: jest
          .fn()
          .mockImplementation(async (_msgs: any, _prompt: any, onChunk: any) => {
            onChunk({ text: 'Hello', done: false });
            onChunk({ text: ' world', done: true });
          }),
      };
      createAIClient.mockReturnValue(mockClient);

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
        streamMessage: jest.fn().mockResolvedValue(undefined),
      };
      createAIClient.mockReturnValue(mockClient);

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
      (SecureStoragePlugin.get as jest.Mock).mockResolvedValue({ value: 'sk-ant-key' });
    });

    it('should not emit error event on AbortError', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const mockClient = {
        streamMessage: jest.fn().mockRejectedValue(abortError),
      };
      createAIClient.mockReturnValue(mockClient);

      const threadId = useChatStore.getState().createThread({
        title: 'Test',
        participants: ['user'],
        isPinned: false,
      });

      await service.requestAgentResponse(threadId, 'msg-1', 'architect');

      // Should not emit error event for abort
      const errorCalls = (streamHandler.emit as jest.Mock).mock.calls.filter(
        (call: any) => call[0].type === 'error'
      );
      expect(errorCalls).toHaveLength(0);
    });

    it('should emit error event for non-abort errors', async () => {
      const error = new Error('API rate limited');
      const mockClient = {
        streamMessage: jest.fn().mockRejectedValue(error),
      };
      createAIClient.mockReturnValue(mockClient);

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
        streamMessage: jest.fn().mockRejectedValue(new Error('Failure')),
      };
      createAIClient.mockReturnValue(mockClient);

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
      expect(approvalMsg!.contentType).toBe('approval_request');
      expect(approvalMsg!.content).toContain('Commit changes to main branch');
      expect(approvalMsg!.sender).toBe('implementer');
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
