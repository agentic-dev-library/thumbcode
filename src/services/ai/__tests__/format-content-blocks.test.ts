/**
 * formatContentBlocks Tests
 *
 * Tests that formatContentBlocks correctly handles image, document,
 * and audio content blocks for the Anthropic API.
 */

import type { ContentBlock } from '../types';

// We need to test the internal formatContentBlocks function via the public API.
// Since formatContentBlocks is called internally by createAnthropicClient,
// we test it indirectly by verifying the Anthropic SDK receives correct params.

// Mock the Anthropic SDK
const mockCreate = vi.fn().mockResolvedValue({
  id: 'msg_123',
  content: [{ type: 'text', text: 'OK' }],
  model: 'claude-3-5-sonnet-20241022',
  stop_reason: 'end_turn',
  usage: { input_tokens: 10, output_tokens: 5 },
});

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = {
      create: mockCreate,
    };
  }
  return { __esModule: true, default: MockAnthropic };
});

import { createAnthropicClient } from '../anthropic-client';

describe('formatContentBlocks multimodal', () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it('formats image content blocks for Anthropic API', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const imageBlock: ContentBlock = {
      type: 'image',
      source: {
        type: 'base64',
        mediaType: 'image/png',
        data: 'iVBORw0KGgoAAAANSUhEUg==',
      },
    };

    await client.complete([{ role: 'user', content: [imageBlock] }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent).toHaveLength(1);
    expect(formattedContent[0]).toEqual({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: 'iVBORw0KGgoAAAANSUhEUg==',
      },
    });
  });

  it('formats mixed text and image blocks', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const blocks: ContentBlock[] = [
      { type: 'text', text: 'Look at this image:' },
      {
        type: 'image',
        source: {
          type: 'base64',
          mediaType: 'image/jpeg',
          data: '/9j/4AAQSkZJRg==',
        },
      },
    ];

    await client.complete([{ role: 'user', content: blocks }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent).toHaveLength(2);
    expect(formattedContent[0]).toEqual({ type: 'text', text: 'Look at this image:' });
    expect(formattedContent[1].type).toBe('image');
    expect(formattedContent[1].source.media_type).toBe('image/jpeg');
  });

  it('formats document blocks as text fallback', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const docBlock: ContentBlock = {
      type: 'document',
      source: {
        type: 'base64',
        mediaType: 'application/pdf',
        data: 'JVBERi0xLjQK',
      },
      filename: 'report.pdf',
    };

    await client.complete([{ role: 'user', content: [docBlock] }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent).toHaveLength(1);
    expect(formattedContent[0]).toEqual({
      type: 'text',
      text: '[Document: report.pdf]',
    });
  });

  it('formats document blocks without filename', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const docBlock: ContentBlock = {
      type: 'document',
      source: {
        type: 'base64',
        mediaType: 'application/pdf',
        data: 'JVBERi0xLjQK',
      },
    };

    await client.complete([{ role: 'user', content: [docBlock] }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent[0]).toEqual({
      type: 'text',
      text: '[Document: document.pdf]',
    });
  });

  it('falls back to empty text for audio blocks', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const audioBlock: ContentBlock = {
      type: 'audio',
      source: {
        type: 'base64',
        mediaType: 'audio/wav',
        data: 'UklGRiQAAABXQVZF',
      },
      transcript: 'Hello world',
    };

    await client.complete([{ role: 'user', content: [audioBlock] }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent).toHaveLength(1);
    // Audio not supported by Anthropic API, falls back to empty text
    expect(formattedContent[0]).toEqual({ type: 'text', text: '' });
  });

  it('handles image blocks without source gracefully', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const block: ContentBlock = {
      type: 'image',
      // No source - should fall back to empty text
    };

    await client.complete([{ role: 'user', content: [block] }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent[0]).toEqual({ type: 'text', text: '' });
  });

  it('preserves existing text and tool_use formatting', async () => {
    const client = createAnthropicClient('sk-ant-test');
    const blocks: ContentBlock[] = [
      { type: 'text', text: 'Hello' },
      { type: 'tool_use', id: 'tool-1', name: 'read_file', input: { path: '/test' } },
      { type: 'tool_result', tool_use_id: 'tool-1', content: 'file contents' },
    ];

    await client.complete([{ role: 'user', content: blocks }], {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1024,
    });

    const callArgs = mockCreate.mock.calls[0][0];
    const formattedContent = callArgs.messages[0].content;
    expect(formattedContent).toHaveLength(3);
    expect(formattedContent[0]).toEqual({ type: 'text', text: 'Hello' });
    expect(formattedContent[1]).toEqual({
      type: 'tool_use',
      id: 'tool-1',
      name: 'read_file',
      input: { path: '/test' },
    });
    expect(formattedContent[2]).toEqual({
      type: 'tool_result',
      tool_use_id: 'tool-1',
      content: 'file contents',
    });
  });
});
