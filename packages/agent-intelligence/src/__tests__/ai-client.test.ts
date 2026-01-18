/**
 * AI Client Tests
 */

import { createAIClient, getDefaultModel, getAvailableModels, ANTHROPIC_MODELS, OPENAI_MODELS } from '../services/ai';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        id: 'msg_123',
        content: [{ type: 'text', text: 'Hello, world!' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 5,
        },
      }),
      stream: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'message_start' };
          yield {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'text', text: '' },
          };
          yield {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'Hello' },
          };
          yield { type: 'content_block_stop' };
          yield { type: 'message_delta', usage: { output_tokens: 5 } };
          yield { type: 'message_stop' };
        },
        finalMessage: jest.fn().mockResolvedValue({
          id: 'msg_123',
          content: [{ type: 'text', text: 'Hello' }],
          model: 'claude-3-5-sonnet-20241022',
          stop_reason: 'end_turn',
          usage: {
            input_tokens: 10,
            output_tokens: 5,
          },
        }),
      })),
    },
  }));
});

// Mock the OpenAI SDK
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation((params) => {
          if (params.stream) {
            return {
              [Symbol.asyncIterator]: async function* () {
                yield {
                  id: 'chatcmpl-123',
                  model: 'gpt-4o',
                  choices: [
                    {
                      delta: { content: 'Hello' },
                      finish_reason: null,
                    },
                  ],
                };
                yield {
                  id: 'chatcmpl-123',
                  model: 'gpt-4o',
                  choices: [
                    {
                      delta: { content: ', world!' },
                      finish_reason: null,
                    },
                  ],
                };
                yield {
                  id: 'chatcmpl-123',
                  model: 'gpt-4o',
                  choices: [
                    {
                      delta: {},
                      finish_reason: 'stop',
                    },
                  ],
                  usage: {
                    prompt_tokens: 10,
                    completion_tokens: 5,
                    total_tokens: 15,
                  },
                };
              },
            };
          }
          return Promise.resolve({
            id: 'chatcmpl-123',
            model: 'gpt-4o',
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: 'Hello, world!',
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 5,
              total_tokens: 15,
            },
          });
        }),
      },
    },
  }));
});

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

    it('should throw for unsupported provider', () => {
      expect(() => createAIClient('unknown' as never, 'key')).toThrow('Unsupported AI provider');
    });
  });

  describe('getDefaultModel', () => {
    it('should return default Anthropic model', () => {
      expect(getDefaultModel('anthropic')).toBe(ANTHROPIC_MODELS.CLAUDE_3_5_SONNET);
    });

    it('should return default OpenAI model', () => {
      expect(getDefaultModel('openai')).toBe(OPENAI_MODELS.GPT_4O);
    });
  });

  describe('getAvailableModels', () => {
    it('should return Anthropic models', () => {
      const models = getAvailableModels('anthropic');
      expect(models).toContain(ANTHROPIC_MODELS.CLAUDE_3_5_SONNET);
      expect(models).toContain(ANTHROPIC_MODELS.CLAUDE_3_5_HAIKU);
    });

    it('should return OpenAI models', () => {
      const models = getAvailableModels('openai');
      expect(models).toContain(OPENAI_MODELS.GPT_4O);
      expect(models).toContain(OPENAI_MODELS.GPT_4O_MINI);
    });
  });
});

describe('Anthropic Client', () => {
  it('should complete a message', async () => {
    const client = createAIClient('anthropic', 'sk-ant-test');

    const response = await client.complete(
      [
        { role: 'user', content: 'Hello' },
      ],
      {
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1024,
      }
    );

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

    const response = await client.complete(
      [{ role: 'user', content: 'Hello' }],
      { model: 'gpt-4o', maxTokens: 1024 }
    );

    expect(response.id).toBe('chatcmpl-123');
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

    expect(response.id).toBe('chatcmpl-123');
    expect(events).toContain('message_start');
    expect(events).toContain('content_block_start');
    expect(events).toContain('content_block_delta');
    expect(events).toContain('message_stop');
  });
});
