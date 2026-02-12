/**
 * OpenAI Client
 *
 * Wrapper for the OpenAI SDK with streaming support.
 */

import OpenAI from 'openai';
import { createStreamParserState, finalizeStream, processStreamChunk } from './openai-stream-parser';
import type {
  AIClient,
  CompletionOptions,
  CompletionResponse,
  ContentBlock,
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

/**
 * Format messages for OpenAI API
 */
function formatMessagesForOpenAI(
  messages: Message[],
  systemPrompt?: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === 'system') {
      if (!systemPrompt) {
        result.push({
          role: 'system',
          content: typeof msg.content === 'string' ? msg.content : '',
        });
      }
      continue;
    }

    if (typeof msg.content === 'string') {
      result.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    } else {
      const toolResults = msg.content.filter((b) => b.type === 'tool_result');
      for (const toolResult of toolResults) {
        result.push({
          role: 'tool',
          tool_call_id: toolResult.tool_use_id || '',
          content: toolResult.content || '',
        });
      }

      const textBlocks = msg.content.filter((b) => b.type === 'text');
      if (textBlocks.length > 0) {
        result.push({
          role: msg.role as 'user' | 'assistant',
          content: textBlocks.map((b) => b.text || '').join('\n'),
        });
      }

      if (msg.role === 'assistant') {
        const toolUseBlocks = msg.content.filter((b) => b.type === 'tool_use');
        if (toolUseBlocks.length > 0) {
          result.push({
            role: 'assistant',
            content: null,
            tool_calls: toolUseBlocks.map((b, i) => ({
              id: b.id || `call_${i}`,
              type: 'function' as const,
              function: {
                name: b.name || '',
                arguments: JSON.stringify(b.input || {}),
              },
            })),
          });
        }
      }
    }
  }

  return result;
}

/**
 * Parse OpenAI response content to our format
 */
function parseOpenAIContent(
  message: OpenAI.Chat.Completions.ChatCompletionMessage
): ContentBlock[] {
  const content: ContentBlock[] = [];

  if (message.content) {
    content.push({ type: 'text', text: message.content });
  }

  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(toolCall.function.arguments);
      } catch {
        parsedInput = {};
      }

      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: parsedInput,
      });
    }
  }

  return content;
}

/**
 * Map OpenAI stop reason to our format
 */
function mapOpenAIStopReason(reason: string | null): CompletionResponse['stopReason'] {
  switch (reason) {
    case 'stop':
      return 'end_turn';
    case 'length':
      return 'max_tokens';
    case 'tool_calls':
      return 'tool_use';
    case 'content_filter':
      return 'stop_sequence';
    default:
      return 'end_turn';
  }
}
