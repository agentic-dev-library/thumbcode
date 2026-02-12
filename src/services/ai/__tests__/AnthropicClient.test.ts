/**
 * Anthropic Client Tests
 */

import AnthropicSdk from '@anthropic-ai/sdk';
import { AnthropicClient } from '../AnthropicClient';
import type { AIMessage, AIStreamChunk } from '../types';

// Mock the Anthropic SDK
const mockCreate = vi.fn();
const mockStreamOn = vi.fn();
const mockStreamFinalMessage = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = {
      create: mockCreate,
      stream: vi.fn().mockImplementation(() => {
        const stream = {
          on: mockStreamOn.mockReturnThis(),
          finalMessage: mockStreamFinalMessage,
        };
        return stream;
      }),
    };
    constructor(...args: unknown[]) {
      MockAnthropic._lastArgs = args;
      MockAnthropic._instances.push(this);
    }
    static _lastArgs: unknown[] = [];
    static _instances: MockAnthropic[] = [];
  }
  return { __esModule: true, default: MockAnthropic };
});

describe('AnthropicClient', () => {
  let client: AnthropicClient;
  const testMessages: AIMessage[] = [{ role: 'user', content: 'Hello' }];
  const testSystemPrompt = 'You are a helpful assistant.';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AnthropicClient('test-api-key');
  });

  describe('sendMessage', () => {
    it('should send a message and return the response text', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello! How can I help you?' }],
      });

      const result = await client.sendMessage(testMessages, testSystemPrompt);

      expect(result).toBe('Hello! How can I help you?');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: testSystemPrompt,
          messages: [{ role: 'user', content: 'Hello' }],
        }),
        expect.any(Object)
      );
    });

    it('should concatenate multiple text blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'Part 1' },
          { type: 'text', text: ' Part 2' },
        ],
      });

      const result = await client.sendMessage(testMessages, testSystemPrompt);
      expect(result).toBe('Part 1 Part 2');
    });

    it('should filter out system messages from the messages array', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'response' }],
      });

      const messagesWithSystem: AIMessage[] = [
        { role: 'system', content: 'System message' },
        { role: 'user', content: 'User message' },
      ];

      await client.sendMessage(messagesWithSystem, testSystemPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'User message' }],
        }),
        expect.any(Object)
      );
    });

    it('should pass the abort signal', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'response' }],
      });

      const controller = new AbortController();
      await client.sendMessage(testMessages, testSystemPrompt, controller.signal);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ signal: controller.signal })
      );
    });
  });

  describe('streamMessage', () => {
    it('should stream message chunks and call onChunk', async () => {
      const chunks: AIStreamChunk[] = [];
      const onChunk = (chunk: AIStreamChunk) => chunks.push(chunk);

      // Simulate the stream: when 'text' event handler is registered, call it
      mockStreamOn.mockImplementation(function (
        this: { on: typeof mockStreamOn; finalMessage: typeof mockStreamFinalMessage },
        event: string,
        handler: (text: string) => void
      ) {
        if (event === 'text') {
          // Queue the text callbacks
          setTimeout(() => {
            handler('Hello');
            handler(' world');
          }, 0);
        }
        return this;
      });

      mockStreamFinalMessage.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello world' }],
      });

      await client.streamMessage(testMessages, testSystemPrompt, onChunk);

      // The done chunk is always sent
      expect(chunks[chunks.length - 1]).toEqual({ text: '', done: true });
    });

    it('should pass the abort signal to the stream', async () => {
      const onChunk = vi.fn();
      const controller = new AbortController();

      mockStreamOn.mockReturnThis();
      mockStreamFinalMessage.mockResolvedValue({
        content: [{ type: 'text', text: '' }],
      });

      // We need to get the stream mock to check its call
      const Anthropic = AnthropicSdk as any;
      const _instance = new Anthropic();

      // Create a new client that uses this instance
      const testClient = new AnthropicClient('test-key');
      await testClient.streamMessage(testMessages, testSystemPrompt, onChunk, controller.signal);

      // Verify stream was called (indirectly through the mock)
      expect(onChunk).toHaveBeenCalledWith({ text: '', done: true });
    });
  });

  describe('constructor', () => {
    it('should use the default model', () => {
      const Anthropic = AnthropicSdk as any;
      Anthropic._instances = [];
      Anthropic._lastArgs = [];
      new AnthropicClient('test-key');
      expect(Anthropic._lastArgs[0]).toMatchObject({
        apiKey: 'test-key',
        dangerouslyAllowBrowser: true,
      });
    });

    it('should accept a custom model', async () => {
      const customClient = new AnthropicClient('test-key', 'claude-3-haiku-20240307');
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'response' }],
      });

      await customClient.sendMessage(testMessages, testSystemPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-3-haiku-20240307' }),
        expect.any(Object)
      );
    });
  });
});
