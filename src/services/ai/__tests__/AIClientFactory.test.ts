/**
 * AI Client Factory Tests
 */

import { createAIClient } from '../AIClientFactory';
import { AnthropicClient } from '../AnthropicClient';
import { OpenAIClient } from '../OpenAIClient';

// Mock the client implementations
vi.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    messages: { create: vi.fn(), stream: vi.fn() },
  })),
}));

vi.mock('openai', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: vi.fn() } },
  })),
}));

describe('createAIClient', () => {
  it('should create an AnthropicClient for anthropic provider', () => {
    const client = createAIClient('anthropic', 'test-key');
    expect(client).toBeInstanceOf(AnthropicClient);
  });

  it('should create an OpenAIClient for openai provider', () => {
    const client = createAIClient('openai', 'test-key');
    expect(client).toBeInstanceOf(OpenAIClient);
  });

  it('should throw for unsupported provider', () => {
    expect(() => {
      // @ts-expect-error testing invalid provider
      createAIClient('unsupported', 'test-key');
    }).toThrow('Unsupported AI provider');
  });
});
