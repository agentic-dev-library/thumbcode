/**
 * OpenAI Client
 *
 * Wrapper for the OpenAI SDK with streaming support.
 */

import OpenAI from 'openai';
import { formatMessagesForOpenAI, mapOpenAIStopReason, parseOpenAIContent } from './openai-helpers';
import {
  createStreamParserState,
  finalizeStream,
  processStreamChunk,
} from './openai-stream-parser';
import type {
  AIClient,
  CompletionOptions,
  CompletionResponse,
  Message,
  StreamEvent,
} from './types';

/**
 * Default models for OpenAI
 */
export const OPENAI_MODELS = {
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
} as const;

/**
 * Create an OpenAI client
 */
export function createOpenAIClient(apiKey: string): AIClient {
  const client = new OpenAI({
    apiKey,
  });

  return {
    provider: 'openai',

    async complete(messages: Message[], options: CompletionOptions): Promise<CompletionResponse> {
      const openaiMessages = formatMessagesForOpenAI(messages, options.systemPrompt);

      const response = await client.chat.completions.create({
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP,
        messages: openaiMessages,
        tools: options.tools?.map((tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.input_schema,
          },
        })),
        stop: options.stopSequences,
      });

      const choice = response.choices[0];

      return {
        id: response.id,
        content: parseOpenAIContent(choice.message),
        model: response.model,
        stopReason: mapOpenAIStopReason(choice.finish_reason),
        usage: {
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
      };
    },

    async completeStream(
      messages: Message[],
      options: CompletionOptions,
      onEvent: (event: StreamEvent) => void
    ): Promise<CompletionResponse> {
      const openaiMessages = formatMessagesForOpenAI(messages, options.systemPrompt);

      const stream = await client.chat.completions.create({
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP,
        messages: openaiMessages,
        tools: options.tools?.map((tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.input_schema,
          },
        })),
        stop: options.stopSequences,
        stream: true,
        stream_options: { include_usage: true },
      });

      const state = createStreamParserState(options.model);

      onEvent({ type: 'message_start' });
      onEvent({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });

      for await (const chunk of stream) {
        processStreamChunk(state, chunk, onEvent);
      }

      const result = finalizeStream(state, onEvent);

      return {
        id: result.responseId,
        content: result.content,
        model: result.model,
        stopReason: mapOpenAIStopReason(result.finishReason),
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.inputTokens + result.outputTokens,
        },
      };
    },
  };
}
