/**
 * Anthropic Client Tests
 *
 * Tests for the exported pure functions from anthropic-client:
 * - ANTHROPIC_MODELS constant
 * - processAnthropicStreamEvent stream event processing
 */

import { ANTHROPIC_MODELS, processAnthropicStreamEvent } from '../anthropic-client';
import type { ContentBlock, StreamEvent } from '../types';

describe('ANTHROPIC_MODELS', () => {
  it('should contain CLAUDE_3_5_SONNET with correct model ID', () => {
    expect(ANTHROPIC_MODELS.CLAUDE_3_5_SONNET).toBe('claude-3-5-sonnet-20241022');
  });

  it('should contain CLAUDE_3_5_HAIKU with correct model ID', () => {
    expect(ANTHROPIC_MODELS.CLAUDE_3_5_HAIKU).toBe('claude-3-5-haiku-20241022');
  });

  it('should contain CLAUDE_3_OPUS with correct model ID', () => {
    expect(ANTHROPIC_MODELS.CLAUDE_3_OPUS).toBe('claude-3-opus-20240229');
  });

  it('should have exactly three model entries', () => {
    expect(Object.keys(ANTHROPIC_MODELS)).toHaveLength(3);
  });

  it('should be a readonly constant', () => {
    // Verify the const assertion makes values literal types
    const sonnet: 'claude-3-5-sonnet-20241022' = ANTHROPIC_MODELS.CLAUDE_3_5_SONNET;
    const haiku: 'claude-3-5-haiku-20241022' = ANTHROPIC_MODELS.CLAUDE_3_5_HAIKU;
    const opus: 'claude-3-opus-20240229' = ANTHROPIC_MODELS.CLAUDE_3_OPUS;
    expect(sonnet).toBeDefined();
    expect(haiku).toBeDefined();
    expect(opus).toBeDefined();
  });
});

describe('processAnthropicStreamEvent', () => {
  let events: StreamEvent[];
  let onEvent: (event: StreamEvent) => void;

  beforeEach(() => {
    events = [];
    onEvent = (event: StreamEvent) => events.push(event);
  });

  describe('message_start', () => {
    it('should emit a message_start event', () => {
      const result = processAnthropicStreamEvent({ type: 'message_start' }, -1, '', onEvent);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'message_start' });
      expect(result.blockIndex).toBe(-1);
      expect(result.text).toBe('');
      expect(result.contentBlock).toBeNull();
    });

    it('should preserve existing blockIndex and text', () => {
      const result = processAnthropicStreamEvent(
        { type: 'message_start' },
        2,
        'existing text',
        onEvent
      );

      expect(result.blockIndex).toBe(2);
      expect(result.text).toBe('existing text');
    });
  });

  describe('content_block_start with text', () => {
    it('should emit content_block_start for a text block', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'text', text: '' },
        },
        -1,
        '',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      });
      expect(result.blockIndex).toBe(0);
      expect(result.text).toBe('');
      expect(result.contentBlock).toBeNull();
    });

    it('should reset text accumulator on new block', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_start',
          index: 1,
          content_block: { type: 'text', text: '' },
        },
        0,
        'previous text',
        onEvent
      );

      expect(result.text).toBe('');
      expect(result.blockIndex).toBe(1);
    });
  });

  describe('content_block_start with tool_use', () => {
    it('should emit content_block_start for a tool_use block', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_start',
          index: 1,
          content_block: {
            type: 'tool_use',
            id: 'toolu_abc123',
            name: 'get_weather',
          },
        },
        0,
        'some text',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'content_block_start',
        index: 1,
        content_block: {
          type: 'tool_use',
          id: 'toolu_abc123',
          name: 'get_weather',
          input: {},
        },
      });
      expect(result.blockIndex).toBe(1);
      expect(result.text).toBe('');
      expect(result.contentBlock).toBeNull();
    });

    it('should include empty input object for tool_use', () => {
      processAnthropicStreamEvent(
        {
          type: 'content_block_start',
          index: 0,
          content_block: {
            type: 'tool_use',
            id: 'toolu_xyz',
            name: 'search',
          },
        },
        -1,
        '',
        onEvent
      );

      expect(events[0].content_block?.input).toEqual({});
    });
  });

  describe('content_block_start with unknown block type', () => {
    it('should not emit any event for unknown content block type', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'unknown_type' },
        },
        -1,
        '',
        onEvent
      );

      expect(events).toHaveLength(0);
      expect(result.blockIndex).toBe(0);
      expect(result.text).toBe('');
    });
  });

  describe('content_block_delta with text_delta', () => {
    it('should emit content_block_delta with text', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        },
        0,
        '',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text', text: 'Hello' },
      });
      expect(result.text).toBe('Hello');
      expect(result.blockIndex).toBe(0);
      expect(result.contentBlock).toBeNull();
    });

    it('should accumulate text across multiple deltas', () => {
      const result1 = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        },
        0,
        '',
        onEvent
      );

      const result2 = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: ' World' },
        },
        result1.blockIndex,
        result1.text,
        onEvent
      );

      expect(result2.text).toBe('Hello World');
      expect(events).toHaveLength(2);
    });

    it('should use the current blockIndex in the emitted event', () => {
      processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'chunk' },
        },
        3,
        'prior',
        onEvent
      );

      expect(events[0].index).toBe(3);
    });
  });

  describe('content_block_delta with input_json_delta', () => {
    it('should emit content_block_delta with partial JSON', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'input_json_delta', partial_json: '{"city":' },
        },
        1,
        '',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'tool_use', partial_json: '{"city":' },
      });
      expect(result.text).toBe('');
      expect(result.blockIndex).toBe(1);
      expect(result.contentBlock).toBeNull();
    });

    it('should not accumulate text for JSON deltas', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'input_json_delta', partial_json: '"New York"}' },
        },
        1,
        'existing',
        onEvent
      );

      expect(result.text).toBe('existing');
    });
  });

  describe('content_block_delta with unknown delta type', () => {
    it('should not emit any event for unknown delta type', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'content_block_delta',
          delta: { type: 'unknown_delta', data: 'test' },
        },
        0,
        'current',
        onEvent
      );

      expect(events).toHaveLength(0);
      expect(result.text).toBe('current');
      expect(result.blockIndex).toBe(0);
    });
  });

  describe('content_block_stop', () => {
    it('should emit content_block_stop and return a text content block when text exists', () => {
      const result = processAnthropicStreamEvent(
        { type: 'content_block_stop' },
        0,
        'Complete response text',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'content_block_stop', index: 0 });
      expect(result.contentBlock).toEqual({
        type: 'text',
        text: 'Complete response text',
      });
      expect(result.blockIndex).toBe(0);
      expect(result.text).toBe('Complete response text');
    });

    it('should return null contentBlock when text is empty', () => {
      const result = processAnthropicStreamEvent({ type: 'content_block_stop' }, 1, '', onEvent);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'content_block_stop', index: 1 });
      expect(result.contentBlock).toBeNull();
    });

    it('should use the current blockIndex in the emitted event', () => {
      processAnthropicStreamEvent({ type: 'content_block_stop' }, 5, 'text', onEvent);

      expect(events[0].index).toBe(5);
    });
  });

  describe('message_delta', () => {
    it('should emit message_delta with output token usage', () => {
      const result = processAnthropicStreamEvent(
        {
          type: 'message_delta',
          usage: { output_tokens: 42 },
        },
        0,
        'some text',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'message_delta',
        usage: { outputTokens: 42 },
      });
      expect(result.blockIndex).toBe(0);
      expect(result.text).toBe('some text');
      expect(result.contentBlock).toBeNull();
    });

    it('should handle missing usage data', () => {
      processAnthropicStreamEvent({ type: 'message_delta' }, 0, '', onEvent);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'message_delta',
        usage: { outputTokens: undefined },
      });
    });

    it('should handle usage with zero output tokens', () => {
      processAnthropicStreamEvent(
        {
          type: 'message_delta',
          usage: { output_tokens: 0 },
        },
        0,
        '',
        onEvent
      );

      expect(events[0].usage?.outputTokens).toBe(0);
    });
  });

  describe('message_stop', () => {
    it('should emit message_stop event', () => {
      const result = processAnthropicStreamEvent(
        { type: 'message_stop' },
        0,
        'final text',
        onEvent
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({ type: 'message_stop' });
      expect(result.blockIndex).toBe(0);
      expect(result.text).toBe('final text');
      expect(result.contentBlock).toBeNull();
    });
  });

  describe('unknown event type', () => {
    it('should not emit any event for unknown types', () => {
      const result = processAnthropicStreamEvent({ type: 'ping' }, 2, 'text', onEvent);

      expect(events).toHaveLength(0);
      expect(result.blockIndex).toBe(2);
      expect(result.text).toBe('text');
      expect(result.contentBlock).toBeNull();
    });

    it('should preserve all state for unrecognized events', () => {
      const result = processAnthropicStreamEvent(
        { type: 'error', error: { message: 'something went wrong' } },
        7,
        'accumulated',
        onEvent
      );

      expect(events).toHaveLength(0);
      expect(result).toEqual({
        blockIndex: 7,
        text: 'accumulated',
        contentBlock: null,
      });
    });
  });

  describe('full stream simulation', () => {
    it('should correctly process a complete message stream', () => {
      const streamEvents = [
        { type: 'message_start' },
        {
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'text', text: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: ', world!' },
        },
        { type: 'content_block_stop' },
        { type: 'message_delta', usage: { output_tokens: 5 } },
        { type: 'message_stop' },
      ];

      let blockIndex = -1;
      let currentText = '';
      const collectedBlocks: ContentBlock[] = [];

      for (const event of streamEvents) {
        const result = processAnthropicStreamEvent(event, blockIndex, currentText, onEvent);
        blockIndex = result.blockIndex;
        currentText = result.text;
        if (result.contentBlock) {
          collectedBlocks.push(result.contentBlock);
        }
      }

      // Verify all events were emitted
      expect(events).toHaveLength(7);
      expect(events.map((e) => e.type)).toEqual([
        'message_start',
        'content_block_start',
        'content_block_delta',
        'content_block_delta',
        'content_block_stop',
        'message_delta',
        'message_stop',
      ]);

      // Verify collected content blocks
      expect(collectedBlocks).toHaveLength(1);
      expect(collectedBlocks[0]).toEqual({
        type: 'text',
        text: 'Hello, world!',
      });

      // Verify final state
      expect(currentText).toBe('Hello, world!');
      expect(blockIndex).toBe(0);
    });

    it('should handle a stream with text followed by tool use', () => {
      const streamEvents = [
        { type: 'message_start' },
        // Text block
        {
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'text', text: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Let me search for that.' },
        },
        { type: 'content_block_stop' },
        // Tool use block
        {
          type: 'content_block_start',
          index: 1,
          content_block: {
            type: 'tool_use',
            id: 'toolu_search_1',
            name: 'web_search',
          },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'input_json_delta', partial_json: '{"query":' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'input_json_delta', partial_json: '"weather NYC"}' },
        },
        { type: 'content_block_stop' },
        { type: 'message_delta', usage: { output_tokens: 25 } },
        { type: 'message_stop' },
      ];

      let blockIndex = -1;
      let currentText = '';
      const collectedBlocks: ContentBlock[] = [];

      for (const event of streamEvents) {
        const result = processAnthropicStreamEvent(event, blockIndex, currentText, onEvent);
        blockIndex = result.blockIndex;
        currentText = result.text;
        if (result.contentBlock) {
          collectedBlocks.push(result.contentBlock);
        }
      }

      // First content_block_stop should produce a text block
      expect(collectedBlocks).toHaveLength(1);
      expect(collectedBlocks[0]).toEqual({
        type: 'text',
        text: 'Let me search for that.',
      });

      // Second content_block_stop should not produce a block
      // because tool_use block accumulates JSON, not text
      expect(events).toHaveLength(10);

      // Verify tool use events
      const toolStartEvents = events.filter(
        (e) => e.type === 'content_block_start' && e.content_block?.type === 'tool_use'
      );
      expect(toolStartEvents).toHaveLength(1);
      expect(toolStartEvents[0].content_block?.name).toBe('web_search');
      expect(toolStartEvents[0].content_block?.id).toBe('toolu_search_1');

      // Verify JSON delta events
      const jsonDeltas = events.filter(
        (e) => e.type === 'content_block_delta' && e.delta?.type === 'tool_use'
      );
      expect(jsonDeltas).toHaveLength(2);
      expect(jsonDeltas[0].delta?.partial_json).toBe('{"query":');
      expect(jsonDeltas[1].delta?.partial_json).toBe('"weather NYC"}');
    });

    it('should handle multiple text blocks in sequence', () => {
      const streamEvents = [
        { type: 'message_start' },
        {
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'text', text: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'First block.' },
        },
        { type: 'content_block_stop' },
        {
          type: 'content_block_start',
          index: 1,
          content_block: { type: 'text', text: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Second block.' },
        },
        { type: 'content_block_stop' },
        { type: 'message_stop' },
      ];

      let blockIndex = -1;
      let currentText = '';
      const collectedBlocks: ContentBlock[] = [];

      for (const event of streamEvents) {
        const result = processAnthropicStreamEvent(event, blockIndex, currentText, onEvent);
        blockIndex = result.blockIndex;
        currentText = result.text;
        if (result.contentBlock) {
          collectedBlocks.push(result.contentBlock);
        }
      }

      expect(collectedBlocks).toHaveLength(2);
      expect(collectedBlocks[0]).toEqual({ type: 'text', text: 'First block.' });
      expect(collectedBlocks[1]).toEqual({ type: 'text', text: 'Second block.' });
    });
  });
});
