/**
 * OpenAI Stream Parser
 *
 * Handles parsing of OpenAI streaming responses into our internal format.
 */

import type { ContentBlock, StreamEvent } from './types';

interface CollectedToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface StreamParserResult {
  content: ContentBlock[];
  responseId: string;
  model: string;
  finishReason: string | null;
  inputTokens: number;
  outputTokens: number;
}

export interface StreamParserState {
  collectedText: string;
  collectedToolCalls: Map<number, CollectedToolCall>;
  responseId: string;
  model: string;
  finishReason: string | null;
  inputTokens: number;
  outputTokens: number;
}

export function createStreamParserState(defaultModel: string): StreamParserState {
  return {
    collectedText: '',
    collectedToolCalls: new Map(),
    responseId: '',
    model: defaultModel,
    finishReason: null,
    inputTokens: 0,
    outputTokens: 0,
  };
}

export function processStreamChunk(
  state: StreamParserState,
  chunk: {
    id: string;
    model: string;
    usage?: { prompt_tokens: number; completion_tokens: number } | null;
    choices: Array<{
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
  },
  onEvent: (event: StreamEvent) => void
): void {
  state.responseId = chunk.id;
  state.model = chunk.model;

  if (chunk.usage) {
    state.inputTokens = chunk.usage.prompt_tokens;
    state.outputTokens = chunk.usage.completion_tokens;
  }

  const choice = chunk.choices[0];
  if (!choice) return;

  if (choice.finish_reason) {
    state.finishReason = choice.finish_reason;
  }

  const delta = choice.delta;

  if (delta.content) {
    state.collectedText += delta.content;
    onEvent({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text', text: delta.content },
    });
  }

  if (delta.tool_calls) {
    for (const toolCall of delta.tool_calls) {
      const index = toolCall.index;
      let current = state.collectedToolCalls.get(index);

      if (!current) {
        current = {
          id: toolCall.id || '',
          name: toolCall.function?.name || '',
          arguments: '',
        };
        state.collectedToolCalls.set(index, current);

        onEvent({
          type: 'content_block_start',
          index: index + 1,
          content_block: {
            type: 'tool_use',
            id: current.id,
            name: current.name,
            input: {},
          },
        });
      }

      if (toolCall.id) current.id = toolCall.id;
      if (toolCall.function?.name) current.name = toolCall.function.name;
      if (toolCall.function?.arguments) {
        current.arguments += toolCall.function.arguments;
        onEvent({
          type: 'content_block_delta',
          index: index + 1,
          delta: { type: 'tool_use', partial_json: toolCall.function.arguments },
        });
      }
    }
  }
}

export function finalizeStream(
  state: StreamParserState,
  onEvent: (event: StreamEvent) => void
): StreamParserResult {
  onEvent({ type: 'content_block_stop', index: 0 });

  for (const [index] of state.collectedToolCalls) {
    onEvent({ type: 'content_block_stop', index: index + 1 });
  }

  onEvent({
    type: 'message_delta',
    usage: { outputTokens: state.outputTokens },
  });
  onEvent({ type: 'message_stop' });

  const content: ContentBlock[] = [];

  if (state.collectedText) {
    content.push({ type: 'text', text: state.collectedText });
  }

  for (const toolCall of state.collectedToolCalls.values()) {
    let parsedInput: Record<string, unknown> = {};
    try {
      parsedInput = JSON.parse(toolCall.arguments);
    } catch {
      parsedInput = {};
    }

    content.push({
      type: 'tool_use',
      id: toolCall.id,
      name: toolCall.name,
      input: parsedInput,
    });
  }

  return {
    content,
    responseId: state.responseId,
    model: state.model,
    finishReason: state.finishReason,
    inputTokens: state.inputTokens,
    outputTokens: state.outputTokens,
  };
}
