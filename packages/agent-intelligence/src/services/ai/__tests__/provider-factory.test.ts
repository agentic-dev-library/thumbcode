/**
 * Provider Factory Tests
 *
 * Tests the AI SDK provider factory internals:
 * - createAISDKClient for all 10 providers
 * - Tool conversion and schema handling
 * - Finish reason mapping
 * - Content block building with tool calls
 * - Default/available model lookups
 * - Stream event emission
 */

import {
  createAISDKClient,
  getFactoryAvailableModels,
  getFactoryDefaultModel,
} from '../provider-factory';
import type { CompletionResponse, StreamEvent } from '../types';

// Mock the Vercel AI SDK
const mockGenerateText = vi.fn();
const mockStreamText = vi.fn();

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
  streamText: (...args: unknown[]) => mockStreamText(...args),
}));

// Mock all AI SDK provider packages
const mockModelFactory = () => ({ modelId: 'mock-model', provider: 'mock' });
vi.mock('@ai-sdk/anthropic', () => ({ createAnthropic: () => mockModelFactory }));
vi.mock('@ai-sdk/openai', () => ({ createOpenAI: () => mockModelFactory }));
vi.mock('@ai-sdk/google', () => ({ createGoogleGenerativeAI: () => mockModelFactory }));
vi.mock('@ai-sdk/azure', () => ({ createAzure: () => mockModelFactory }));
vi.mock('@ai-sdk/xai', () => ({ createXai: () => mockModelFactory }));
vi.mock('@ai-sdk/amazon-bedrock', () => ({ createAmazonBedrock: () => mockModelFactory }));
vi.mock('@ai-sdk/mistral', () => ({ createMistral: () => mockModelFactory }));
vi.mock('@ai-sdk/cohere', () => ({ createCohere: () => mockModelFactory }));
vi.mock('@ai-sdk/groq', () => ({ createGroq: () => mockModelFactory }));
vi.mock('@ai-sdk/deepseek', () => ({ createDeepSeek: () => mockModelFactory }));

function makeGenerateResult(overrides: Record<string, unknown> = {}) {
  return {
    text: 'Generated text',
    response: { id: 'gen-001' },
    finishReason: 'stop',
    usage: { inputTokens: 20, outputTokens: 10, totalTokens: 30 },
    toolCalls: [],
    ...overrides,
  };
}

function makeStreamResult(overrides: Record<string, unknown> = {}) {
  const chunks = ['chunk1', 'chunk2'];
  let index = 0;
  return {
    textStream: {
      [Symbol.asyncIterator]: () => ({
        async next() {
          if (index < chunks.length) {
            return { value: chunks[index++], done: false };
          }
          return { value: undefined, done: true };
        },
      }),
    },
    response: Promise.resolve({ id: 'stream-001' }),
    usage: Promise.resolve({ inputTokens: 15, outputTokens: 8, totalTokens: 23 }),
    finishReason: Promise.resolve('stop'),
    toolCalls: Promise.resolve([]),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerateText.mockResolvedValue(makeGenerateResult());
  mockStreamText.mockReturnValue(makeStreamResult());
});

describe('createAISDKClient', () => {
  const ALL_PROVIDERS = [
    'openai',
    'anthropic',
    'google',
    'azure',
    'xai',
    'amazon-bedrock',
    'mistral',
    'cohere',
    'groq',
    'deepseek',
  ] as const;

  describe('provider creation', () => {
    for (const provider of ALL_PROVIDERS) {
      it(`should create a client for ${provider}`, () => {
        const client = createAISDKClient(provider, 'test-key');
        expect(client.provider).toBe(provider);
        expect(client.complete).toBeDefined();
        expect(client.completeStream).toBeDefined();
      });
    }

    it('should throw for unsupported provider on complete', async () => {
      const client = createAISDKClient('invalid' as never, 'key');
      await expect(
        client.complete([{ role: 'user', content: 'test' }], { model: 'test', maxTokens: 100 })
      ).rejects.toThrow('Unsupported AI provider: invalid');
    });

    it('should throw for unsupported provider on completeStream', async () => {
      const client = createAISDKClient('invalid' as never, 'key');
      await expect(
        client.completeStream(
          [{ role: 'user', content: 'test' }],
          { model: 'test', maxTokens: 100 },
          () => {}
        )
      ).rejects.toThrow('Unsupported AI provider: invalid');
    });
  });

  describe('complete', () => {
    it('should return a valid CompletionResponse', async () => {
      const client = createAISDKClient('anthropic', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Hello' }], {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 1024,
      });

      expect(response.id).toBe('gen-001');
      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toEqual({ type: 'text', text: 'Generated text' });
      expect(response.model).toBe('claude-sonnet-4-20250514');
      expect(response.stopReason).toBe('end_turn');
      expect(response.usage).toEqual({ inputTokens: 20, outputTokens: 10, totalTokens: 30 });
    });

    it('should pass maxOutputTokens to generateText', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 2048,
        temperature: 0.5,
        topP: 0.9,
        stopSequences: ['END'],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          maxOutputTokens: 2048,
          temperature: 0.5,
          topP: 0.9,
          stopSequences: ['END'],
        })
      );
    });

    it('should use default temperature of 0.7', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 100,
      });

      expect(mockGenerateText).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.7 }));
    });

    it('should include tool calls in content blocks', async () => {
      mockGenerateText.mockResolvedValue(
        makeGenerateResult({
          text: 'Using a tool',
          toolCalls: [{ toolCallId: 'tc-1', toolName: 'search', input: { query: 'hello' } }],
        })
      );

      const client = createAISDKClient('anthropic', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Search' }], {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 1024,
      });

      expect(response.content).toHaveLength(2);
      expect(response.content[0]).toEqual({ type: 'text', text: 'Using a tool' });
      expect(response.content[1]).toEqual({
        type: 'tool_use',
        id: 'tc-1',
        name: 'search',
        input: { query: 'hello' },
      });
    });

    it('should handle empty text with tool calls', async () => {
      mockGenerateText.mockResolvedValue(
        makeGenerateResult({
          text: '',
          toolCalls: [{ toolCallId: 'tc-2', toolName: 'calc', input: { n: 42 } }],
        })
      );

      const client = createAISDKClient('openai', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Calculate' }], {
        model: 'gpt-4o',
        maxTokens: 100,
      });

      // Empty text should not produce a text block
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('tool_use');
    });

    it('should handle system prompt in options', async () => {
      const client = createAISDKClient('anthropic', 'sk-test');
      await client.complete([{ role: 'user', content: 'Hello' }], {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 100,
        systemPrompt: 'You are a helpful assistant',
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: 'You are a helpful assistant' },
          ]),
        })
      );
    });

    it('should skip system messages from message array', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.complete(
        [
          { role: 'system', content: 'system msg' },
          { role: 'user', content: 'Hello' },
        ],
        { model: 'gpt-4o', maxTokens: 100 }
      );

      const call = mockGenerateText.mock.calls[0][0];
      // System content goes as first message, user content follows, system role not duplicated
      const roles = call.messages.map((m: { role: string }) => m.role);
      expect(roles.filter((r: string) => r === 'system')).toHaveLength(1);
    });

    it('should generate fallback id when response has none', async () => {
      mockGenerateText.mockResolvedValue(makeGenerateResult({ response: { id: undefined } }));

      const client = createAISDKClient('openai', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 100,
      });

      expect(response.id).toMatch(/^gen-\d+$/);
    });
  });

  describe('completeStream', () => {
    it('should emit correct stream events', async () => {
      const client = createAISDKClient('anthropic', 'sk-test');
      const events: StreamEvent[] = [];

      await client.completeStream(
        [{ role: 'user', content: 'Hello' }],
        { model: 'claude-sonnet-4-20250514', maxTokens: 1024 },
        (event) => events.push(event)
      );

      const types = events.map((e) => e.type);
      expect(types[0]).toBe('message_start');
      expect(types[1]).toBe('content_block_start');
      expect(types).toContain('content_block_delta');
      expect(types).toContain('content_block_stop');
      expect(types).toContain('message_delta');
      expect(types[types.length - 1]).toBe('message_stop');
    });

    it('should collect text from stream chunks', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      const deltas: string[] = [];

      const response = await client.completeStream(
        [{ role: 'user', content: 'Hello' }],
        { model: 'gpt-4o', maxTokens: 1024 },
        (event) => {
          if (event.type === 'content_block_delta' && event.delta?.text) {
            deltas.push(event.delta.text);
          }
        }
      );

      expect(deltas).toEqual(['chunk1', 'chunk2']);
      expect(response.content[0]).toEqual({ type: 'text', text: 'chunk1chunk2' });
    });

    it('should return valid CompletionResponse from stream', async () => {
      const client = createAISDKClient('anthropic', 'sk-test');

      const response = await client.completeStream(
        [{ role: 'user', content: 'Hello' }],
        { model: 'claude-sonnet-4-20250514', maxTokens: 1024 },
        () => {}
      );

      expect(response.id).toBe('stream-001');
      expect(response.model).toBe('claude-sonnet-4-20250514');
      expect(response.stopReason).toBe('end_turn');
      expect(response.usage).toEqual({ inputTokens: 15, outputTokens: 8, totalTokens: 23 });
    });

    it('should emit tool call events from stream', async () => {
      mockStreamText.mockReturnValue(
        makeStreamResult({
          toolCalls: Promise.resolve([
            { toolCallId: 'tc-s1', toolName: 'search', input: { q: 'test' } },
          ]),
        })
      );

      const client = createAISDKClient('anthropic', 'sk-test');
      const events: StreamEvent[] = [];

      await client.completeStream(
        [{ role: 'user', content: 'Search' }],
        { model: 'claude-sonnet-4-20250514', maxTokens: 1024 },
        (event) => events.push(event)
      );

      const toolEvents = events.filter(
        (e) => e.type === 'content_block_start' && e.content_block?.type === 'tool_use'
      );
      expect(toolEvents).toHaveLength(1);
      expect(toolEvents[0].content_block?.name).toBe('search');
      expect(toolEvents[0].index).toBe(1);
    });

    it('should pass maxOutputTokens to streamText', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.completeStream(
        [{ role: 'user', content: 'Hi' }],
        { model: 'gpt-4o', maxTokens: 4096 },
        () => {}
      );

      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({ maxOutputTokens: 4096 })
      );
    });

    it('should include output tokens in message_delta event', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      const events: StreamEvent[] = [];

      await client.completeStream(
        [{ role: 'user', content: 'Hi' }],
        { model: 'gpt-4o', maxTokens: 100 },
        (event) => events.push(event)
      );

      const deltaEvent = events.find((e) => e.type === 'message_delta');
      expect(deltaEvent?.usage?.outputTokens).toBe(8);
    });
  });

  describe('finish reason mapping', () => {
    const cases: Array<{ sdkReason: string; expected: CompletionResponse['stopReason'] }> = [
      { sdkReason: 'stop', expected: 'end_turn' },
      { sdkReason: 'length', expected: 'max_tokens' },
      { sdkReason: 'tool-calls', expected: 'tool_use' },
      { sdkReason: 'content-filter', expected: 'stop_sequence' },
      { sdkReason: 'unknown', expected: 'end_turn' },
    ];

    for (const { sdkReason, expected } of cases) {
      it(`should map "${sdkReason}" to "${expected}"`, async () => {
        mockGenerateText.mockResolvedValue(makeGenerateResult({ finishReason: sdkReason }));
        const client = createAISDKClient('openai', 'sk-test');
        const response = await client.complete([{ role: 'user', content: 'Hi' }], {
          model: 'gpt-4o',
          maxTokens: 100,
        });
        expect(response.stopReason).toBe(expected);
      });
    }
  });

  describe('usage calculation', () => {
    it('should handle zero usage', async () => {
      mockGenerateText.mockResolvedValue(
        makeGenerateResult({
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        })
      );

      const client = createAISDKClient('openai', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 100,
      });

      expect(response.usage).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    });

    it('should handle undefined usage gracefully', async () => {
      mockGenerateText.mockResolvedValue(makeGenerateResult({ usage: undefined }));

      const client = createAISDKClient('openai', 'sk-test');
      const response = await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 100,
      });

      expect(response.usage).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    });
  });

  describe('tool conversion', () => {
    it('should pass tools to generateText', async () => {
      const client = createAISDKClient('anthropic', 'sk-test');
      await client.complete([{ role: 'user', content: 'Use tools' }], {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 100,
        tools: [
          {
            name: 'get_weather',
            description: 'Get weather for a city',
            input_schema: {
              type: 'object',
              properties: {
                city: { type: 'string', description: 'City name' },
              },
              required: ['city'],
            },
          },
        ],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.objectContaining({
            get_weather: expect.any(Object),
          }),
        })
      );
    });

    it('should not pass tools when empty array', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.complete([{ role: 'user', content: 'Hi' }], {
        model: 'gpt-4o',
        maxTokens: 100,
        tools: [],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(expect.objectContaining({ tools: undefined }));
    });
  });

  describe('message conversion', () => {
    it('should convert ContentBlock[] messages to text', async () => {
      const client = createAISDKClient('openai', 'sk-test');
      await client.complete(
        [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'text', text: 'World' },
            ],
          },
        ],
        { model: 'gpt-4o', maxTokens: 100 }
      );

      const call = mockGenerateText.mock.calls[0][0];
      expect(call.messages).toContainEqual({ role: 'user', content: 'Hello\nWorld' });
    });
  });
});

describe('getFactoryDefaultModel', () => {
  it('should return correct default models', () => {
    expect(getFactoryDefaultModel('openai')).toBe('gpt-4o');
    expect(getFactoryDefaultModel('anthropic')).toBe('claude-sonnet-4-20250514');
    expect(getFactoryDefaultModel('google')).toBe('gemini-2.0-flash');
    expect(getFactoryDefaultModel('xai')).toBe('grok-3-mini');
    expect(getFactoryDefaultModel('deepseek')).toBe('deepseek-chat');
  });

  it('should return "unknown" for unregistered provider', () => {
    expect(getFactoryDefaultModel('nonexistent')).toBe('unknown');
  });
});

describe('getFactoryAvailableModels', () => {
  it('should return available models for each provider', () => {
    const openaiModels = getFactoryAvailableModels('openai');
    expect(openaiModels).toContain('gpt-4o');
    expect(openaiModels).toContain('gpt-4o-mini');

    const anthropicModels = getFactoryAvailableModels('anthropic');
    expect(anthropicModels.some((m) => m.includes('claude'))).toBe(true);

    const googleModels = getFactoryAvailableModels('google');
    expect(googleModels).toContain('gemini-2.0-flash');
  });

  it('should return empty array for unregistered provider', () => {
    expect(getFactoryAvailableModels('nonexistent')).toEqual([]);
  });

  it('should return models for all 10 providers', () => {
    const providers = [
      'openai',
      'anthropic',
      'google',
      'azure',
      'xai',
      'amazon-bedrock',
      'mistral',
      'cohere',
      'groq',
      'deepseek',
    ];
    for (const p of providers) {
      const models = getFactoryAvailableModels(p);
      expect(models.length).toBeGreaterThan(0);
    }
  });
});
