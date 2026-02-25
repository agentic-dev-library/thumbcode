/**
 * OpenAI Helpers
 *
 * Message formatting and response parsing utilities for the OpenAI client.
 */

import type OpenAI from 'openai';
import type { CompletionResponse, ContentBlock, Message } from './types';

/**
 * Format messages for OpenAI API
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: maps message content types to OpenAI API format
export function formatMessagesForOpenAI(
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
export function parseOpenAIContent(
  message: OpenAI.Chat.Completions.ChatCompletionMessage
): ContentBlock[] {
  const content: ContentBlock[] = [];

  if (message.content) {
    content.push({ type: 'text', text: message.content });
  }

  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;

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
export function mapOpenAIStopReason(reason: string | null): CompletionResponse['stopReason'] {
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
