/**
 * AI Client Tests
 *
 * Tests the AI client factory and provider-factory-backed clients
 * via mocked Vercel AI SDK (generateText / streamText).
 */

import {
  ANTHROPIC_MODELS,
  createAIClient,
  getAvailableModels,
  getDefaultModel,
  OPENAI_MODELS,
} from '../services/ai';

// Mock the Vercel AI SDK — this is the actual call path now
vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Hello, world!',
    response: { id: 'msg_123' },
    finishReason: 'stop',
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    toolCalls: [],
  }),
  streamText: vi.fn().mockImplementation(() => {
    const chunks = ['Hello', ', world!'];
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
      response: Promise.resolve({ id: 'msg_123' }),
      usage: Promise.resolve({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
      finishReason: Promise.resolve('stop'),
      toolCalls: Promise.resolve([]),
    };
  }),
}));

// Mock all AI SDK provider packages (they just need to return callable model factories)
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

describe('AI Client Factory', () => {
  describe('createAIClient', () => {
    it('should create an Anthropic client', () => {
      const client = createAIClient('anthropic', 'sk-ant-test');
      expect(client.provider).toBe('anthropic');
    });

    it('should create an OpenAI client', () => {
      const client = createAIClient('openai', 'sk-test');
      expect(client.provider).toBe('openai');
    });

    it('should throw for unsupported provider when calling complete', async () => {
      // Provider factory defers validation to the first API call
      const client = createAIClient('unknown' as never, 'key');
      await expect(
        client.complete([{ role: 'user', content: 'test' }], { model: 'test', maxTokens: 100 })
      ).rejects.toThrow('Unsupported AI provider');
    });
  });

  describe('getDefaultModel', () => {
    it('should return default Anthropic model', () => {
      const model = getDefaultModel('anthropic');
      // Factory provides claude-sonnet-4, which takes precedence over legacy constant
      expect(model).toBeTruthy();
      expect(typeof model).toBe('string');
    });

    it('should return default OpenAI model', () => {
      const model = getDefaultModel('openai');
      expect(model).toBe('gpt-4o');
    });
  });

  describe('getAvailableModels', () => {
    it('should return Anthropic models', () => {
      const models = getAvailableModels('anthropic');
      expect(models.length).toBeGreaterThan(0);
      // Should include some claude model
      expect(models.some((m) => m.includes('claude'))).toBe(true);
    });

    it('should return OpenAI models', () => {
      const models = getAvailableModels('openai');
      expect(models).toContain('gpt-4o');
      expect(models).toContain('gpt-4o-mini');
    });
  });
});

describe('Anthropic Client', () => {
  it('should complete a message', async () => {
    const client = createAIClient('anthropic', 'sk-ant-test');

    const response = await client.complete([{ role: 'user', content: 'Hello' }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    expect(response.id).toBe('msg_123');
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(response.usage.totalTokens).toBe(15);
  });

  it('should stream a message', async () => {
    const client = createAIClient('anthropic', 'sk-ant-test');
    const events: string[] = [];

    const response = await client.completeStream(
      [{ role: 'user', content: 'Hello' }],
      { model: 'claude-3-5-sonnet-20241022', maxTokens: 1024 },
      (event) => {
        events.push(event.type);
      }
    );

    expect(response.id).toBe('msg_123');
    expect(events).toContain('message_start');
    expect(events).toContain('content_block_start');
    expect(events).toContain('content_block_delta');
    expect(events).toContain('message_stop');
  });
});

describe('OpenAI Client', () => {
  it('should complete a message', async () => {
    const client = createAIClient('openai', 'sk-test');

    const response = await client.complete([{ role: 'user', content: 'Hello' }], {
      model: 'gpt-4o',
      maxTokens: 1024,
    });

    expect(response.id).toBe('msg_123');
    expect(response.content).toHaveLength(1);
    expect(response.content[0].text).toBe('Hello, world!');
    expect(response.usage.totalTokens).toBe(15);
  });

  it('should stream a message', async () => {
    const client = createAIClient('openai', 'sk-test');
    const events: string[] = [];

    const response = await client.completeStream(
      [{ role: 'user', content: 'Hello' }],
      { model: 'gpt-4o', maxTokens: 1024 },
      (event) => {
        events.push(event.type);
      }
    );

    expect(response.id).toBe('msg_123');
    expect(events).toContain('message_start');
    expect(events).toContain('content_block_start');
    expect(events).toContain('content_block_delta');
    expect(events).toContain('message_stop');
  });
});
