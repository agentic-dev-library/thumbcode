/**
 * OpenAI Client Tests
 */

import OpenAISdk from 'openai';
import { OpenAIClient } from '../OpenAIClient';
import type { AIMessage, AIStreamChunk } from '../types';

// Mock the OpenAI SDK
const mockCreate = vi.fn();

vi.mock('openai', () => {
  class MockOpenAI {
    chat = { completions: { create: mockCreate } };
    constructor(...args: unknown[]) {
      MockOpenAI._lastArgs = args;
      MockOpenAI._instances.push(this);
    }
    static _lastArgs: unknown[] = [];
    static _instances: MockOpenAI[] = [];
  }
  return { __esModule: true, default: MockOpenAI };
});

describe('OpenAIClient', () => {
  let client: OpenAIClient;
  const testMessages: AIMessage[] = [{ role: 'user', content: 'Hello' }];
  const testSystemPrompt = 'You are a helpful assistant.';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OpenAIClient('test-api-key');
  });

  describe('sendMessage', () => {
    it('should send a message and return the response content', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Hello! How can I help you?' } }],
      });

      const result = await client.sendMessage(testMessages, testSystemPrompt);

      expect(result).toBe('Hello! How can I help you?');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: testSystemPrompt },
            { role: 'user', content: 'Hello' },
          ],
        }),
        expect.any(Object)
      );
    });

    it('should return empty string when no content', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const result = await client.sendMessage(testMessages, testSystemPrompt);
      expect(result).toBe('');
    });

    it('should return empty string when no choices', async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const result = await client.sendMessage(testMessages, testSystemPrompt);
      expect(result).toBe('');
    });

    it('should filter out system messages from input', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }],
      });

      const messagesWithSystem: AIMessage[] = [
        { role: 'system', content: 'Extra system' },
        { role: 'user', content: 'User message' },
      ];

      await client.sendMessage(messagesWithSystem, testSystemPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: 'system', content: testSystemPrompt },
            { role: 'user', content: 'User message' },
          ],
        }),
        expect.any(Object)
      );
    });

    it('should pass the abort signal', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }],
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

      // Create an async iterable that simulates the stream
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
          yield { choices: [{ delta: { content: null } }] };
        },
      };

      mockCreate.mockResolvedValue(mockStream);

      await client.streamMessage(testMessages, testSystemPrompt, onChunk);

      expect(chunks).toEqual([
        { text: 'Hello', done: false },
        { text: ' world', done: false },
        { text: '', done: true },
      ]);
    });

    it('should pass stream: true to the API', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          // empty stream
        },
      };
      mockCreate.mockResolvedValue(mockStream);

      await client.streamMessage(testMessages, testSystemPrompt, vi.fn());

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ stream: true }),
        expect.any(Object)
      );
    });

    it('should skip chunks without delta content', async () => {
      const chunks: AIStreamChunk[] = [];
      const onChunk = (chunk: AIStreamChunk) => chunks.push(chunk);

      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { choices: [{ delta: {} }] };
          yield { choices: [{ delta: { content: 'text' } }] };
          yield { choices: [] };
        },
      };

      mockCreate.mockResolvedValue(mockStream);

      await client.streamMessage(testMessages, testSystemPrompt, onChunk);

      expect(chunks).toEqual([
        { text: 'text', done: false },
        { text: '', done: true },
      ]);
    });

    it('should pass the abort signal to the stream', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          // empty
        },
      };
      mockCreate.mockResolvedValue(mockStream);

      const controller = new AbortController();
      await client.streamMessage(testMessages, testSystemPrompt, vi.fn(), controller.signal);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ signal: controller.signal })
      );
    });
  });

  describe('constructor', () => {
    it('should use the default model', () => {
      const OpenAI = OpenAISdk as any;
      OpenAI._instances = [];
      OpenAI._lastArgs = [];
      new OpenAIClient('test-key');
      expect(OpenAI._lastArgs[0]).toMatchObject({
        apiKey: 'test-key',
        dangerouslyAllowBrowser: true,
      });
    });

    it('should accept a custom model', async () => {
      const customClient = new OpenAIClient('test-key', 'gpt-3.5-turbo');
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }],
      });

      await customClient.sendMessage(testMessages, testSystemPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-3.5-turbo' }),
        expect.any(Object)
      );
    });
  });
});
