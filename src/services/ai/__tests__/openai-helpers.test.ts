/**
 * OpenAI Helpers Tests
 *
 * Tests the OpenAI message formatting and response parsing utilities:
 * - formatMessagesForOpenAI: system prompt handling, role mapping, tool results, tool use
 * - parseOpenAIContent: text, tool calls, JSON parsing, edge cases
 * - mapOpenAIStopReason: all reason mappings
 */

import type OpenAI from 'openai';
import {
  formatMessagesForOpenAI,
  mapOpenAIStopReason,
  parseOpenAIContent,
} from '../openai-helpers';
import type { Message } from '../types';

// ---------------------------------------------------------------------------
// formatMessagesForOpenAI
// ---------------------------------------------------------------------------

describe('formatMessagesForOpenAI', () => {
  describe('system prompt handling', () => {
    it('should prepend systemPrompt as first message when provided', () => {
      const messages: Message[] = [{ role: 'user', content: 'Hello' }];
      const result = formatMessagesForOpenAI(messages, 'You are helpful.');

      expect(result[0]).toEqual({ role: 'system', content: 'You are helpful.' });
      expect(result[1]).toEqual({ role: 'user', content: 'Hello' });
    });

    it('should skip system messages from the array when systemPrompt is provided', () => {
      const messages: Message[] = [
        { role: 'system', content: 'I should be skipped' },
        { role: 'user', content: 'Hello' },
      ];
      const result = formatMessagesForOpenAI(messages, 'Use this instead.');

      const systemMessages = result.filter((m) => m.role === 'system');
      expect(systemMessages).toHaveLength(1);
      expect(systemMessages[0].content).toBe('Use this instead.');
    });

    it('should include system messages from array when no systemPrompt is given', () => {
      const messages: Message[] = [
        { role: 'system', content: 'System instructions' },
        { role: 'user', content: 'Hello' },
      ];
      const result = formatMessagesForOpenAI(messages);

      expect(result[0]).toEqual({ role: 'system', content: 'System instructions' });
      expect(result[1]).toEqual({ role: 'user', content: 'Hello' });
    });

    it('should not add any system message when both systemPrompt and system messages are absent', () => {
      const messages: Message[] = [{ role: 'user', content: 'Hi' }];
      const result = formatMessagesForOpenAI(messages);

      const systemMessages = result.filter((m) => m.role === 'system');
      expect(systemMessages).toHaveLength(0);
    });

    it('should handle system message with ContentBlock[] content as empty string', () => {
      const messages: Message[] = [
        {
          role: 'system',
          content: [{ type: 'text', text: 'should not be used' }],
        },
        { role: 'user', content: 'Hello' },
      ];
      const result = formatMessagesForOpenAI(messages);

      // System message with non-string content should produce empty content
      expect(result[0]).toEqual({ role: 'system', content: '' });
    });
  });

  describe('simple string messages', () => {
    it('should pass through user messages as-is', () => {
      const messages: Message[] = [{ role: 'user', content: 'What is 2+2?' }];
      const result = formatMessagesForOpenAI(messages);

      expect(result).toEqual([{ role: 'user', content: 'What is 2+2?' }]);
    });

    it('should pass through assistant messages as-is', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      const result = formatMessagesForOpenAI(messages);

      expect(result).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ]);
    });

    it('should handle an empty messages array', () => {
      const result = formatMessagesForOpenAI([]);
      expect(result).toEqual([]);
    });

    it('should handle empty messages array with systemPrompt', () => {
      const result = formatMessagesForOpenAI([], 'You are helpful.');
      expect(result).toEqual([{ role: 'system', content: 'You are helpful.' }]);
    });
  });

  describe('ContentBlock[] messages', () => {
    it('should extract text blocks and join them with newlines', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'First paragraph' },
            { type: 'text', text: 'Second paragraph' },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      expect(result).toEqual([{ role: 'user', content: 'First paragraph\nSecond paragraph' }]);
    });

    it('should handle text blocks with missing text as empty string', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Has text' },
            { type: 'text' }, // text is undefined
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      expect(result).toEqual([{ role: 'user', content: 'Has text\n' }]);
    });

    it('should not produce a text message when there are no text blocks', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: 'call_1', content: 'result' }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      // Should only have the tool message, no text message
      const textMessages = result.filter((m) => m.role === 'user');
      expect(textMessages).toHaveLength(0);
    });
  });

  describe('tool result handling', () => {
    it('should convert tool_result blocks to tool role messages', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: 'call_abc',
              content: 'The weather in London is 15C.',
            },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      expect(result).toContainEqual({
        role: 'tool',
        tool_call_id: 'call_abc',
        content: 'The weather in London is 15C.',
      });
    });

    it('should handle tool_result with missing tool_use_id', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [{ type: 'tool_result', content: 'some result' }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const toolMsg = result.find((m) => m.role === 'tool');
      expect(toolMsg).toBeDefined();
      expect(toolMsg?.tool_call_id).toBe('');
    });

    it('should handle tool_result with missing content', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: 'call_1' }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const toolMsg = result.find((m) => m.role === 'tool');
      expect(toolMsg).toBeDefined();
      expect(toolMsg?.content).toBe('');
    });

    it('should handle multiple tool results in one message', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [
            { type: 'tool_result', tool_use_id: 'call_1', content: 'Result 1' },
            { type: 'tool_result', tool_use_id: 'call_2', content: 'Result 2' },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const toolMessages = result.filter((m) => m.role === 'tool');
      expect(toolMessages).toHaveLength(2);
    });
  });

  describe('tool use handling (assistant messages)', () => {
    it('should convert tool_use blocks to assistant messages with tool_calls', () => {
      const messages: Message[] = [
        {
          role: 'assistant',
          content: [
            {
              type: 'tool_use',
              id: 'call_xyz',
              name: 'get_weather',
              input: { city: 'Paris' },
            },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const assistantMsg = result.find((m) => m.role === 'assistant' && 'tool_calls' in m) as
        | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
        | undefined;

      expect(assistantMsg).toBeDefined();
      expect(assistantMsg?.tool_calls).toHaveLength(1);
      expect(assistantMsg?.tool_calls?.[0]).toEqual({
        id: 'call_xyz',
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"city":"Paris"}',
        },
      });
    });

    it('should generate fallback id when tool_use id is missing', () => {
      const messages: Message[] = [
        {
          role: 'assistant',
          content: [{ type: 'tool_use', name: 'tool', input: {} }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const assistantMsg = result.find((m) => m.role === 'assistant' && 'tool_calls' in m) as
        | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
        | undefined;

      expect(assistantMsg?.tool_calls?.[0].id).toBe('call_0');
    });

    it('should handle missing name and input in tool_use', () => {
      const messages: Message[] = [
        {
          role: 'assistant',
          content: [{ type: 'tool_use', id: 'call_1' }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const assistantMsg = result.find((m) => m.role === 'assistant' && 'tool_calls' in m) as
        | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
        | undefined;

      expect(assistantMsg?.tool_calls?.[0].function.name).toBe('');
      expect(assistantMsg?.tool_calls?.[0].function.arguments).toBe('{}');
    });

    it('should not add tool_calls message for user messages with tool_use blocks', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: [{ type: 'tool_use', id: 'call_1', name: 'tool', input: {} }],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const toolCallMessages = result.filter((m) => 'tool_calls' in m);
      expect(toolCallMessages).toHaveLength(0);
    });

    it('should handle assistant message with both text and tool_use blocks', () => {
      const messages: Message[] = [
        {
          role: 'assistant',
          content: [
            { type: 'text', text: 'I will search for that.' },
            { type: 'tool_use', id: 'call_s', name: 'search', input: { q: 'test' } },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      // Should produce a text message AND a tool_calls message
      const textMsg = result.find(
        (m) =>
          m.role === 'assistant' && typeof m.content === 'string' && m.content.includes('search')
      );
      const toolMsg = result.find((m) => m.role === 'assistant' && 'tool_calls' in m);

      expect(textMsg).toBeDefined();
      expect(toolMsg).toBeDefined();
    });

    it('should handle multiple tool_use blocks with sequential fallback ids', () => {
      const messages: Message[] = [
        {
          role: 'assistant',
          content: [
            { type: 'tool_use', name: 'tool_a', input: {} },
            { type: 'tool_use', name: 'tool_b', input: { x: 1 } },
          ],
        },
      ];
      const result = formatMessagesForOpenAI(messages);

      const assistantMsg = result.find((m) => m.role === 'assistant' && 'tool_calls' in m) as
        | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
        | undefined;

      expect(assistantMsg?.tool_calls?.[0].id).toBe('call_0');
      expect(assistantMsg?.tool_calls?.[1].id).toBe('call_1');
    });
  });

  describe('complex conversation', () => {
    it('should handle a full multi-turn conversation with tool use', () => {
      const messages: Message[] = [
        { role: 'user', content: 'What is the weather in Paris?' },
        {
          role: 'assistant',
          content: [
            { type: 'text', text: 'Let me check.' },
            {
              type: 'tool_use',
              id: 'call_w',
              name: 'get_weather',
              input: { city: 'Paris' },
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: 'call_w',
              content: '22C and sunny',
            },
          ],
        },
        { role: 'assistant', content: 'The weather in Paris is 22C and sunny.' },
      ];

      const result = formatMessagesForOpenAI(messages, 'You are a weather assistant.');

      // System + user + assistant text + assistant tool_calls + tool result + assistant
      expect(result.length).toBeGreaterThanOrEqual(5);

      // First message is system prompt
      expect(result[0]).toEqual({ role: 'system', content: 'You are a weather assistant.' });

      // Should have a tool role message
      const toolMsg = result.find((m) => m.role === 'tool');
      expect(toolMsg).toBeDefined();

      // Last message should be assistant
      expect(result[result.length - 1]).toEqual({
        role: 'assistant',
        content: 'The weather in Paris is 22C and sunny.',
      });
    });
  });
});

// ---------------------------------------------------------------------------
// parseOpenAIContent
// ---------------------------------------------------------------------------

describe('parseOpenAIContent', () => {
  it('should parse text-only response', () => {
    const message = {
      role: 'assistant' as const,
      content: 'Hello, how can I help?',
      refusal: null,
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toEqual([{ type: 'text', text: 'Hello, how can I help?' }]);
  });

  it('should return empty array for null content and no tool calls', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toEqual([]);
  });

  it('should return empty array for empty string content', () => {
    const message = {
      role: 'assistant' as const,
      content: '',
      refusal: null,
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    // Empty string is falsy, so no text block
    expect(content).toEqual([]);
  });

  it('should parse tool calls with valid JSON arguments', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
      tool_calls: [
        {
          id: 'call_abc',
          type: 'function' as const,
          function: {
            name: 'get_weather',
            arguments: '{"city":"London"}',
          },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toEqual([
      {
        type: 'tool_use',
        id: 'call_abc',
        name: 'get_weather',
        input: { city: 'London' },
      },
    ]);
  });

  it('should handle malformed JSON arguments gracefully', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
      tool_calls: [
        {
          id: 'call_bad',
          type: 'function' as const,
          function: {
            name: 'broken',
            arguments: 'not json at all',
          },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toEqual([
      {
        type: 'tool_use',
        id: 'call_bad',
        name: 'broken',
        input: {},
      },
    ]);
  });

  it('should handle empty string arguments', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
      tool_calls: [
        {
          id: 'call_empty',
          type: 'function' as const,
          function: {
            name: 'no_args',
            arguments: '',
          },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content[0].input).toEqual({});
  });

  it('should include both text and tool calls when present', () => {
    const message = {
      role: 'assistant' as const,
      content: 'Searching now...',
      refusal: null,
      tool_calls: [
        {
          id: 'call_1',
          type: 'function' as const,
          function: {
            name: 'search',
            arguments: '{"query":"AI"}',
          },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toHaveLength(2);
    expect(content[0]).toEqual({ type: 'text', text: 'Searching now...' });
    expect(content[1]).toEqual({
      type: 'tool_use',
      id: 'call_1',
      name: 'search',
      input: { query: 'AI' },
    });
  });

  it('should handle multiple tool calls', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
      tool_calls: [
        {
          id: 'call_a',
          type: 'function' as const,
          function: { name: 'read_file', arguments: '{"path":"/a"}' },
        },
        {
          id: 'call_b',
          type: 'function' as const,
          function: { name: 'read_file', arguments: '{"path":"/b"}' },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content).toHaveLength(2);
    expect(content[0].id).toBe('call_a');
    expect(content[1].id).toBe('call_b');
  });

  it('should handle nested JSON in tool call arguments', () => {
    const message = {
      role: 'assistant' as const,
      content: null,
      refusal: null,
      tool_calls: [
        {
          id: 'call_nested',
          type: 'function' as const,
          function: {
            name: 'complex_tool',
            arguments: '{"config":{"nested":true,"items":[1,2,3]},"name":"test"}',
          },
        },
      ],
    };

    const content = parseOpenAIContent(message as OpenAI.Chat.Completions.ChatCompletionMessage);

    expect(content[0].input).toEqual({
      config: { nested: true, items: [1, 2, 3] },
      name: 'test',
    });
  });
});

// ---------------------------------------------------------------------------
// mapOpenAIStopReason
// ---------------------------------------------------------------------------

describe('mapOpenAIStopReason', () => {
  it('should map "stop" to "end_turn"', () => {
    expect(mapOpenAIStopReason('stop')).toBe('end_turn');
  });

  it('should map "length" to "max_tokens"', () => {
    expect(mapOpenAIStopReason('length')).toBe('max_tokens');
  });

  it('should map "tool_calls" to "tool_use"', () => {
    expect(mapOpenAIStopReason('tool_calls')).toBe('tool_use');
  });

  it('should map "content_filter" to "stop_sequence"', () => {
    expect(mapOpenAIStopReason('content_filter')).toBe('stop_sequence');
  });

  it('should map null to "end_turn"', () => {
    expect(mapOpenAIStopReason(null)).toBe('end_turn');
  });

  it('should map unknown string to "end_turn"', () => {
    expect(mapOpenAIStopReason('some_unknown_reason')).toBe('end_turn');
  });

  it('should map empty string to "end_turn"', () => {
    expect(mapOpenAIStopReason('')).toBe('end_turn');
  });
});
