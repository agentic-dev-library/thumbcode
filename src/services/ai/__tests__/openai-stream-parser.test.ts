/**
 * OpenAI Stream Parser Tests
 *
 * Tests the OpenAI streaming response parser:
 * - createStreamParserState initialization
 * - processStreamChunk with text deltas, tool calls, usage, and finish reasons
 * - finalizeStream content building, event emission, and JSON parsing
 * - Edge cases: empty inputs, missing fields, malformed JSON
 */

import {
  createStreamParserState,
  finalizeStream,
  processStreamChunk,
  type StreamParserState,
} from '../openai-stream-parser';
import type { StreamEvent } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal OpenAI-shaped stream chunk */
function makeChunk(
  overrides: {
    id?: string;
    model?: string;
    usage?: { prompt_tokens: number; completion_tokens: number } | null;
    choices?: Array<{
      finish_reason?: string | null;
      delta: {
        content?: string | null;
        tool_calls?: Array<{
          index: number;
          id?: string;
          function?: { name?: string; arguments?: string };
        }>;
      };
    }>;
  } = {}
) {
  return {
    id: overrides.id ?? 'chatcmpl-001',
    model: overrides.model ?? 'gpt-4o',
    usage: overrides.usage ?? null,
    choices: overrides.choices ?? [{ delta: { content: null } }],
  };
}

/** Collect events emitted during processStreamChunk */
function collectEvents(
  state: StreamParserState,
  chunk: ReturnType<typeof makeChunk>
): StreamEvent[] {
  const events: StreamEvent[] = [];
  processStreamChunk(state, chunk, (e) => events.push(e));
  return events;
}

// ---------------------------------------------------------------------------
// createStreamParserState
// ---------------------------------------------------------------------------

describe('createStreamParserState', () => {
  it('should initialize with empty defaults and the given model', () => {
    const state = createStreamParserState('gpt-4o');

    expect(state.collectedText).toBe('');
    expect(state.collectedToolCalls.size).toBe(0);
    expect(state.responseId).toBe('');
    expect(state.model).toBe('gpt-4o');
    expect(state.finishReason).toBeNull();
    expect(state.inputTokens).toBe(0);
    expect(state.outputTokens).toBe(0);
  });

  it('should accept any model string', () => {
    const state = createStreamParserState('custom-model-v2');
    expect(state.model).toBe('custom-model-v2');
  });

  it('should accept an empty string model', () => {
    const state = createStreamParserState('');
    expect(state.model).toBe('');
  });
});

// ---------------------------------------------------------------------------
// processStreamChunk
// ---------------------------------------------------------------------------

describe('processStreamChunk', () => {
  let state: StreamParserState;

  beforeEach(() => {
    state = createStreamParserState('gpt-4o');
  });

  describe('basic metadata', () => {
    it('should set responseId from chunk id', () => {
      processStreamChunk(state, makeChunk({ id: 'chatcmpl-abc' }), () => {});
      expect(state.responseId).toBe('chatcmpl-abc');
    });

    it('should set model from chunk model', () => {
      processStreamChunk(state, makeChunk({ model: 'gpt-4-turbo' }), () => {});
      expect(state.model).toBe('gpt-4-turbo');
    });

    it('should overwrite metadata on subsequent chunks', () => {
      processStreamChunk(state, makeChunk({ id: 'first', model: 'gpt-4o' }), () => {});
      processStreamChunk(state, makeChunk({ id: 'second', model: 'gpt-4o-mini' }), () => {});

      expect(state.responseId).toBe('second');
      expect(state.model).toBe('gpt-4o-mini');
    });
  });

  describe('usage tracking', () => {
    it('should update token counts when usage is present', () => {
      processStreamChunk(
        state,
        makeChunk({ usage: { prompt_tokens: 42, completion_tokens: 17 } }),
        () => {}
      );

      expect(state.inputTokens).toBe(42);
      expect(state.outputTokens).toBe(17);
    });

    it('should not change token counts when usage is null', () => {
      state.inputTokens = 10;
      state.outputTokens = 5;
      processStreamChunk(state, makeChunk({ usage: null }), () => {});

      expect(state.inputTokens).toBe(10);
      expect(state.outputTokens).toBe(5);
    });

    it('should not change token counts when usage is undefined', () => {
      state.inputTokens = 10;
      state.outputTokens = 5;
      processStreamChunk(state, makeChunk({ usage: undefined }), () => {});

      expect(state.inputTokens).toBe(10);
      expect(state.outputTokens).toBe(5);
    });

    it('should handle zero token counts', () => {
      processStreamChunk(
        state,
        makeChunk({ usage: { prompt_tokens: 0, completion_tokens: 0 } }),
        () => {}
      );

      expect(state.inputTokens).toBe(0);
      expect(state.outputTokens).toBe(0);
    });
  });

  describe('empty choices', () => {
    it('should return early when choices array is empty', () => {
      const events = collectEvents(state, makeChunk({ choices: [] }));

      expect(events).toHaveLength(0);
      expect(state.collectedText).toBe('');
      expect(state.finishReason).toBeNull();
    });
  });

  describe('finish reason', () => {
    it('should set finishReason when choice has one', () => {
      processStreamChunk(
        state,
        makeChunk({
          choices: [{ finish_reason: 'stop', delta: {} }],
        }),
        () => {}
      );

      expect(state.finishReason).toBe('stop');
    });

    it('should set finishReason for tool_calls', () => {
      processStreamChunk(
        state,
        makeChunk({
          choices: [{ finish_reason: 'tool_calls', delta: {} }],
        }),
        () => {}
      );

      expect(state.finishReason).toBe('tool_calls');
    });

    it('should not overwrite finishReason with null', () => {
      processStreamChunk(
        state,
        makeChunk({ choices: [{ finish_reason: 'stop', delta: {} }] }),
        () => {}
      );
      processStreamChunk(
        state,
        makeChunk({ choices: [{ finish_reason: null, delta: {} }] }),
        () => {}
      );

      expect(state.finishReason).toBe('stop');
    });

    it('should leave finishReason null when finish_reason is absent', () => {
      processStreamChunk(state, makeChunk({ choices: [{ delta: { content: 'hi' } }] }), () => {});

      expect(state.finishReason).toBeNull();
    });
  });

  describe('text content deltas', () => {
    it('should accumulate text from content deltas', () => {
      processStreamChunk(
        state,
        makeChunk({ choices: [{ delta: { content: 'Hello' } }] }),
        () => {}
      );
      processStreamChunk(
        state,
        makeChunk({ choices: [{ delta: { content: ' world' } }] }),
        () => {}
      );

      expect(state.collectedText).toBe('Hello world');
    });

    it('should emit content_block_delta events for text', () => {
      const events = collectEvents(
        state,
        makeChunk({
          choices: [{ delta: { content: 'Hello' } }],
        })
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text', text: 'Hello' },
      });
    });

    it('should not emit events for null content', () => {
      const events = collectEvents(
        state,
        makeChunk({
          choices: [{ delta: { content: null } }],
        })
      );

      expect(events).toHaveLength(0);
      expect(state.collectedText).toBe('');
    });

    it('should not emit events for undefined content', () => {
      const events = collectEvents(
        state,
        makeChunk({
          choices: [{ delta: {} }],
        })
      );

      expect(events).toHaveLength(0);
    });

    it('should not emit events for empty string content', () => {
      // Empty string is falsy, so it should not trigger accumulation
      const events = collectEvents(
        state,
        makeChunk({
          choices: [{ delta: { content: '' } }],
        })
      );

      expect(events).toHaveLength(0);
      expect(state.collectedText).toBe('');
    });
  });

  describe('tool call deltas', () => {
    it('should create a new tool call entry and emit content_block_start', () => {
      const events = collectEvents(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_abc',
                    function: { name: 'get_weather', arguments: '' },
                  },
                ],
              },
            },
          ],
        })
      );

      expect(state.collectedToolCalls.size).toBe(1);
      const toolCall = state.collectedToolCalls.get(0);
      expect(toolCall).toEqual({
        id: 'call_abc',
        name: 'get_weather',
        arguments: '',
      });

      // Should emit content_block_start with index offset of 1
      const startEvent = events.find((e) => e.type === 'content_block_start');
      expect(startEvent).toEqual({
        type: 'content_block_start',
        index: 1,
        content_block: {
          type: 'tool_use',
          id: 'call_abc',
          name: 'get_weather',
          input: {},
        },
      });
    });

    it('should accumulate arguments across multiple chunks', () => {
      // First chunk: creates tool call
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_xyz',
                    function: { name: 'search', arguments: '{"q' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      // Second chunk: appends arguments
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { arguments: 'uery":"test"}' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      const toolCall = state.collectedToolCalls.get(0);
      expect(toolCall?.arguments).toBe('{"query":"test"}');
    });

    it('should emit content_block_delta for argument chunks', () => {
      // Create tool call first
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_1',
                    function: { name: 'tool', arguments: '' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      // Now send arguments
      const events = collectEvents(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { arguments: '{"key":"value"}' },
                  },
                ],
              },
            },
          ],
        })
      );

      const deltaEvent = events.find((e) => e.type === 'content_block_delta');
      expect(deltaEvent).toEqual({
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'tool_use', partial_json: '{"key":"value"}' },
      });
    });

    it('should handle multiple concurrent tool calls at different indices', () => {
      // First tool call at index 0
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  { index: 0, id: 'call_a', function: { name: 'search', arguments: '' } },
                  { index: 1, id: 'call_b', function: { name: 'calc', arguments: '' } },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      expect(state.collectedToolCalls.size).toBe(2);
      expect(state.collectedToolCalls.get(0)?.name).toBe('search');
      expect(state.collectedToolCalls.get(1)?.name).toBe('calc');
    });

    it('should update id on subsequent chunks if provided', () => {
      // Create tool call without id
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { name: 'tool' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      expect(state.collectedToolCalls.get(0)?.id).toBe('');

      // Update with id
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_late',
                    function: { arguments: '{}' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      expect(state.collectedToolCalls.get(0)?.id).toBe('call_late');
    });

    it('should update name on subsequent chunks if provided', () => {
      // Create tool call with initial name
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_1',
                    function: { name: 'initial' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      // Later chunk has a different name
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { name: 'updated', arguments: '{}' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      expect(state.collectedToolCalls.get(0)?.name).toBe('updated');
    });

    it('should handle tool call with no function property', () => {
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_nofn',
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      const toolCall = state.collectedToolCalls.get(0);
      expect(toolCall).toEqual({
        id: 'call_nofn',
        name: '',
        arguments: '',
      });
    });

    it('should not emit argument delta when arguments is empty string', () => {
      // Create then send empty arguments
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_1',
                    function: { name: 'tool', arguments: '' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      // Only content_block_start should have been emitted (no delta for empty args)
      const events = collectEvents(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { arguments: '' },
                  },
                ],
              },
            },
          ],
        })
      );

      const deltaEvents = events.filter((e) => e.type === 'content_block_delta');
      expect(deltaEvents).toHaveLength(0);
    });
  });

  describe('mixed content and tool calls', () => {
    it('should handle text and tool calls in the same stream', () => {
      // Text chunk
      processStreamChunk(
        state,
        makeChunk({
          choices: [{ delta: { content: 'I will search for that.' } }],
        }),
        () => {}
      );

      // Tool call chunk
      processStreamChunk(
        state,
        makeChunk({
          choices: [
            {
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_1',
                    function: { name: 'search', arguments: '{"query":"test"}' },
                  },
                ],
              },
            },
          ],
        }),
        () => {}
      );

      expect(state.collectedText).toBe('I will search for that.');
      expect(state.collectedToolCalls.size).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// finalizeStream
// ---------------------------------------------------------------------------

describe('finalizeStream', () => {
  let state: StreamParserState;

  beforeEach(() => {
    state = createStreamParserState('gpt-4o');
  });

  describe('event emission', () => {
    it('should emit content_block_stop for text (index 0)', () => {
      const events: StreamEvent[] = [];
      finalizeStream(state, (e) => events.push(e));

      const stopEvents = events.filter((e) => e.type === 'content_block_stop');
      expect(stopEvents).toHaveLength(1);
      expect(stopEvents[0].index).toBe(0);
    });

    it('should emit content_block_stop for each tool call', () => {
      state.collectedToolCalls.set(0, { id: 'call_a', name: 'search', arguments: '{}' });
      state.collectedToolCalls.set(1, { id: 'call_b', name: 'calc', arguments: '{}' });

      const events: StreamEvent[] = [];
      finalizeStream(state, (e) => events.push(e));

      const stopEvents = events.filter((e) => e.type === 'content_block_stop');
      // Index 0 for text, index 1 for tool 0, index 2 for tool 1
      expect(stopEvents).toHaveLength(3);
      expect(stopEvents.map((e) => e.index)).toEqual([0, 1, 2]);
    });

    it('should emit message_delta with output tokens', () => {
      state.outputTokens = 42;

      const events: StreamEvent[] = [];
      finalizeStream(state, (e) => events.push(e));

      const deltaEvent = events.find((e) => e.type === 'message_delta');
      expect(deltaEvent).toEqual({
        type: 'message_delta',
        usage: { outputTokens: 42 },
      });
    });

    it('should emit message_stop as the last event', () => {
      const events: StreamEvent[] = [];
      finalizeStream(state, (e) => events.push(e));

      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('message_stop');
    });

    it('should emit events in correct order: stop(s) -> message_delta -> message_stop', () => {
      state.collectedToolCalls.set(0, { id: 'call_1', name: 'tool', arguments: '{}' });

      const events: StreamEvent[] = [];
      finalizeStream(state, (e) => events.push(e));

      const types = events.map((e) => e.type);
      expect(types).toEqual([
        'content_block_stop', // text block (index 0)
        'content_block_stop', // tool call (index 1)
        'message_delta',
        'message_stop',
      ]);
    });
  });

  describe('content building', () => {
    it('should include text block when collectedText is non-empty', () => {
      state.collectedText = 'Hello, world!';

      const result = finalizeStream(state, () => {});

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Hello, world!' });
    });

    it('should not include text block when collectedText is empty', () => {
      state.collectedText = '';

      const result = finalizeStream(state, () => {});

      expect(result.content.filter((b) => b.type === 'text')).toHaveLength(0);
    });

    it('should parse tool call arguments as JSON', () => {
      state.collectedToolCalls.set(0, {
        id: 'call_1',
        name: 'get_weather',
        arguments: '{"city":"London","units":"celsius"}',
      });

      const result = finalizeStream(state, () => {});

      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toEqual({
        type: 'tool_use',
        id: 'call_1',
        name: 'get_weather',
        input: { city: 'London', units: 'celsius' },
      });
    });

    it('should fall back to empty object for malformed JSON arguments', () => {
      state.collectedToolCalls.set(0, {
        id: 'call_bad',
        name: 'broken_tool',
        arguments: '{not valid json',
      });

      const result = finalizeStream(state, () => {});

      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock?.input).toEqual({});
    });

    it('should fall back to empty object for empty arguments string', () => {
      state.collectedToolCalls.set(0, {
        id: 'call_empty',
        name: 'no_args_tool',
        arguments: '',
      });

      const result = finalizeStream(state, () => {});

      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock?.input).toEqual({});
    });

    it('should include both text and tool_use blocks in order', () => {
      state.collectedText = 'Searching...';
      state.collectedToolCalls.set(0, {
        id: 'call_1',
        name: 'search',
        arguments: '{"q":"test"}',
      });
      state.collectedToolCalls.set(1, {
        id: 'call_2',
        name: 'fetch',
        arguments: '{"url":"https://example.com"}',
      });

      const result = finalizeStream(state, () => {});

      expect(result.content).toHaveLength(3);
      expect(result.content[0].type).toBe('text');
      expect(result.content[1].type).toBe('tool_use');
      expect(result.content[1].name).toBe('search');
      expect(result.content[2].type).toBe('tool_use');
      expect(result.content[2].name).toBe('fetch');
    });

    it('should handle only tool calls with no text', () => {
      state.collectedToolCalls.set(0, {
        id: 'call_only',
        name: 'calculate',
        arguments: '{"n":42}',
      });

      const result = finalizeStream(state, () => {});

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'tool_use',
        id: 'call_only',
        name: 'calculate',
        input: { n: 42 },
      });
    });
  });

  describe('result metadata', () => {
    it('should return all accumulated state in the result', () => {
      state.responseId = 'chatcmpl-final';
      state.model = 'gpt-4o';
      state.finishReason = 'stop';
      state.inputTokens = 100;
      state.outputTokens = 50;
      state.collectedText = 'Done';

      const result = finalizeStream(state, () => {});

      expect(result.responseId).toBe('chatcmpl-final');
      expect(result.model).toBe('gpt-4o');
      expect(result.finishReason).toBe('stop');
      expect(result.inputTokens).toBe(100);
      expect(result.outputTokens).toBe(50);
    });

    it('should return null finishReason when not set', () => {
      const result = finalizeStream(state, () => {});
      expect(result.finishReason).toBeNull();
    });

    it('should return empty content array when nothing was collected', () => {
      const result = finalizeStream(state, () => {});
      expect(result.content).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: full stream simulation
// ---------------------------------------------------------------------------

describe('full stream simulation', () => {
  it('should correctly process a complete text-only stream', () => {
    const state = createStreamParserState('gpt-4o');
    const events: StreamEvent[] = [];
    const onEvent = (e: StreamEvent) => events.push(e);

    // Simulate a typical stream sequence
    processStreamChunk(
      state,
      makeChunk({
        id: 'chatcmpl-001',
        model: 'gpt-4o',
        choices: [{ delta: { content: 'Hello' } }],
      }),
      onEvent
    );

    processStreamChunk(
      state,
      makeChunk({
        id: 'chatcmpl-001',
        model: 'gpt-4o',
        choices: [{ delta: { content: ', ' } }],
      }),
      onEvent
    );

    processStreamChunk(
      state,
      makeChunk({
        id: 'chatcmpl-001',
        model: 'gpt-4o',
        choices: [{ delta: { content: 'world!' } }],
      }),
      onEvent
    );

    processStreamChunk(
      state,
      makeChunk({
        id: 'chatcmpl-001',
        model: 'gpt-4o',
        usage: { prompt_tokens: 10, completion_tokens: 5 },
        choices: [{ finish_reason: 'stop', delta: {} }],
      }),
      onEvent
    );

    const result = finalizeStream(state, onEvent);

    expect(result.content).toEqual([{ type: 'text', text: 'Hello, world!' }]);
    expect(result.responseId).toBe('chatcmpl-001');
    expect(result.model).toBe('gpt-4o');
    expect(result.finishReason).toBe('stop');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);

    // Verify event sequence
    const textDeltas = events.filter(
      (e) => e.type === 'content_block_delta' && e.delta?.type === 'text'
    );
    expect(textDeltas).toHaveLength(3);
    expect(textDeltas.map((e) => e.delta?.text)).toEqual(['Hello', ', ', 'world!']);

    // Final events
    const types = events.map((e) => e.type);
    expect(types[types.length - 1]).toBe('message_stop');
    expect(types[types.length - 2]).toBe('message_delta');
    expect(types[types.length - 3]).toBe('content_block_stop');
  });

  it('should correctly process a stream with text then tool call', () => {
    const state = createStreamParserState('gpt-4o');
    const events: StreamEvent[] = [];
    const onEvent = (e: StreamEvent) => events.push(e);

    // Text chunk
    processStreamChunk(
      state,
      makeChunk({
        choices: [{ delta: { content: 'Let me search.' } }],
      }),
      onEvent
    );

    // Tool call start
    processStreamChunk(
      state,
      makeChunk({
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_search',
                  function: { name: 'web_search', arguments: '{"q' },
                },
              ],
            },
          },
        ],
      }),
      onEvent
    );

    // Tool call argument continuation
    processStreamChunk(
      state,
      makeChunk({
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: { arguments: 'uery":"AI"}' },
                },
              ],
            },
          },
        ],
      }),
      onEvent
    );

    // Finish
    processStreamChunk(
      state,
      makeChunk({
        usage: { prompt_tokens: 20, completion_tokens: 15 },
        choices: [{ finish_reason: 'tool_calls', delta: {} }],
      }),
      onEvent
    );

    const result = finalizeStream(state, onEvent);

    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({ type: 'text', text: 'Let me search.' });
    expect(result.content[1]).toEqual({
      type: 'tool_use',
      id: 'call_search',
      name: 'web_search',
      input: { query: 'AI' },
    });
    expect(result.finishReason).toBe('tool_calls');
  });

  it('should correctly process a stream with multiple tool calls and no text', () => {
    const state = createStreamParserState('gpt-4o');
    const events: StreamEvent[] = [];
    const onEvent = (e: StreamEvent) => events.push(e);

    // Two tool calls in one delta
    processStreamChunk(
      state,
      makeChunk({
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_a',
                  function: { name: 'read_file', arguments: '{"path":"/tmp/a"}' },
                },
                {
                  index: 1,
                  id: 'call_b',
                  function: { name: 'read_file', arguments: '{"path":"/tmp/b"}' },
                },
              ],
            },
          },
        ],
      }),
      onEvent
    );

    processStreamChunk(
      state,
      makeChunk({
        choices: [{ finish_reason: 'tool_calls', delta: {} }],
      }),
      onEvent
    );

    const result = finalizeStream(state, onEvent);

    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: 'tool_use',
      id: 'call_a',
      name: 'read_file',
      input: { path: '/tmp/a' },
    });
    expect(result.content[1]).toEqual({
      type: 'tool_use',
      id: 'call_b',
      name: 'read_file',
      input: { path: '/tmp/b' },
    });
  });
});
