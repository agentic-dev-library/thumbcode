/**
 * OpenAI Client
 *
 * Wrapper for the OpenAI SDK with streaming support.
 */

import OpenAI from 'openai';
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

      let collectedText = '';
      let collectedToolCalls: Map<number, { id: string; name: string; arguments: string }> =
        new Map();
      let responseId = '';
      let model = options.model;
      let finishReason: string | null = null;
      let inputTokens = 0;
      let outputTokens = 0;

      onEvent({ type: 'message_start' });
      onEvent({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });

      for await (const chunk of stream) {
        responseId = chunk.id;
        model = chunk.model;

        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens;
          outputTokens = chunk.usage.completion_tokens;
        }

        const choice = chunk.choices[0];
        if (!choice) continue;

        if (choice.finish_reason) {
          finishReason = choice.finish_reason;
        }

        const delta = choice.delta;

        if (delta.content) {
          collectedText += delta.content;
          onEvent({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text', text: delta.content },
          });
        }

        if (delta.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            const index = toolCall.index;
            let current = collectedToolCalls.get(index);

            if (!current) {
              current = {
                id: toolCall.id || '',
                name: toolCall.function?.name || '',
                arguments: '',
              };
              collectedToolCalls.set(index, current);

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

      onEvent({ type: 'content_block_stop', index: 0 });

      for (const [index] of collectedToolCalls) {
        onEvent({ type: 'content_block_stop', index: index + 1 });
      }

      onEvent({
        type: 'message_delta',
        usage: { outputTokens },
      });
      onEvent({ type: 'message_stop' });

      const content: ContentBlock[] = [];

      if (collectedText) {
        content.push({ type: 'text', text: collectedText });
      }

      for (const toolCall of collectedToolCalls.values()) {
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
        id: responseId,
        content,
        model,
        stopReason: mapOpenAIStopReason(finishReason),
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
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

  // Add system prompt if provided
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
      // Handle tool results
      const toolResults = msg.content.filter((b) => b.type === 'tool_result');
      for (const toolResult of toolResults) {
        result.push({
          role: 'tool',
          tool_call_id: toolResult.tool_use_id || '',
          content: toolResult.content || '',
        });
      }

      // Handle regular content
      const textBlocks = msg.content.filter((b) => b.type === 'text');
      if (textBlocks.length > 0) {
        result.push({
          role: msg.role as 'user' | 'assistant',
          content: textBlocks.map((b) => b.text || '').join('\n'),
        });
      }

      // Handle tool use (for assistant messages)
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
