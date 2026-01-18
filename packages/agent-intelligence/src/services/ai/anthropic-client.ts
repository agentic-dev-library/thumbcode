/**
 * Anthropic Claude Client
 *
 * Wrapper for the Anthropic SDK with streaming support.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  AIClient,
  CompletionOptions,
  CompletionResponse,
  ContentBlock,
  Message,
  StreamEvent,
} from './types';

/**
 * Default models for Anthropic
 */
export const ANTHROPIC_MODELS = {
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20241022',
  CLAUDE_3_5_HAIKU: 'claude-3-5-haiku-20241022',
  CLAUDE_3_OPUS: 'claude-3-opus-20240229',
} as const;

/**
 * Create an Anthropic AI client
 */
export function createAnthropicClient(apiKey: string): AIClient {
  const client = new Anthropic({
    apiKey,
  });

  return {
    provider: 'anthropic',

    async complete(messages: Message[], options: CompletionOptions): Promise<CompletionResponse> {
      const systemPrompt = options.systemPrompt || extractSystemPrompt(messages);
      const conversationMessages = filterConversationMessages(messages);

      const response = await client.messages.create({
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: conversationMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: typeof m.content === 'string' ? m.content : formatContentBlocks(m.content),
        })),
        tools: options.tools?.map((tool) => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        })),
        stop_sequences: options.stopSequences,
      });

      return {
        id: response.id,
        content: response.content.map(mapAnthropicContent),
        model: response.model,
        stopReason: mapStopReason(response.stop_reason),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    },

    async completeStream(
      messages: Message[],
      options: CompletionOptions,
      onEvent: (event: StreamEvent) => void
    ): Promise<CompletionResponse> {
      const systemPrompt = options.systemPrompt || extractSystemPrompt(messages);
      const conversationMessages = filterConversationMessages(messages);

      const stream = await client.messages.stream({
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: conversationMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: typeof m.content === 'string' ? m.content : formatContentBlocks(m.content),
        })),
        tools: options.tools?.map((tool) => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        })),
        stop_sequences: options.stopSequences,
      });

      const collectedContent: ContentBlock[] = [];
      let currentBlockIndex = -1;
      let currentText = '';

      for await (const event of stream) {
        switch (event.type) {
          case 'message_start':
            onEvent({ type: 'message_start' });
            break;
          case 'content_block_start':
            currentBlockIndex = event.index;
            if (event.content_block.type === 'text') {
              currentText = '';
              onEvent({
                type: 'content_block_start',
                index: event.index,
                content_block: { type: 'text', text: '' },
              });
            } else if (event.content_block.type === 'tool_use') {
              onEvent({
                type: 'content_block_start',
                index: event.index,
                content_block: {
                  type: 'tool_use',
                  id: event.content_block.id,
                  name: event.content_block.name,
                  input: {},
                },
              });
            }
            break;
          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              currentText += event.delta.text;
              onEvent({
                type: 'content_block_delta',
                index: currentBlockIndex,
                delta: { type: 'text', text: event.delta.text },
              });
            } else if (event.delta.type === 'input_json_delta') {
              onEvent({
                type: 'content_block_delta',
                index: currentBlockIndex,
                delta: { type: 'tool_use', partial_json: event.delta.partial_json },
              });
            }
            break;
          case 'content_block_stop':
            if (currentText) {
              collectedContent.push({ type: 'text', text: currentText });
            }
            onEvent({ type: 'content_block_stop', index: currentBlockIndex });
            break;
          case 'message_delta':
            onEvent({
              type: 'message_delta',
              usage: {
                outputTokens: event.usage?.output_tokens,
              },
            });
            break;
          case 'message_stop':
            onEvent({ type: 'message_stop' });
            break;
        }
      }

      const finalMessage = await stream.finalMessage();

      return {
        id: finalMessage.id,
        content: finalMessage.content.map(mapAnthropicContent),
        model: finalMessage.model,
        stopReason: mapStopReason(finalMessage.stop_reason),
        usage: {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
        },
      };
    },
  };
}

/**
 * Extract system prompt from messages
 */
function extractSystemPrompt(messages: Message[]): string {
  const systemMsg = messages.find((m) => m.role === 'system');
  return typeof systemMsg?.content === 'string' ? systemMsg.content : '';
}

/**
 * Filter out system messages for conversation
 */
function filterConversationMessages(messages: Message[]): Message[] {
  return messages.filter((m) => m.role !== 'system');
}

/**
 * Format content blocks for Anthropic API
 */
function formatContentBlocks(
  blocks: ContentBlock[]
): Anthropic.Messages.ContentBlockParam[] {
  return blocks.map((block) => {
    if (block.type === 'text') {
      return { type: 'text' as const, text: block.text || '' };
    }
    if (block.type === 'tool_use') {
      return {
        type: 'tool_use' as const,
        id: block.id || '',
        name: block.name || '',
        input: block.input || {},
      };
    }
    if (block.type === 'tool_result') {
      return {
        type: 'tool_result' as const,
        tool_use_id: block.tool_use_id || '',
        content: block.content || '',
      };
    }
    return { type: 'text' as const, text: '' };
  });
}

/**
 * Map Anthropic content to our format
 */
function mapAnthropicContent(block: Anthropic.Messages.ContentBlock): ContentBlock {
  if (block.type === 'text') {
    return { type: 'text', text: block.text };
  }
  if (block.type === 'tool_use') {
    return {
      type: 'tool_use',
      id: block.id,
      name: block.name,
      input: block.input as Record<string, unknown>,
    };
  }
  return { type: 'text', text: '' };
}

/**
 * Map stop reason to our format
 */
function mapStopReason(
  reason: Anthropic.Messages.Message['stop_reason']
): CompletionResponse['stopReason'] {
  switch (reason) {
    case 'end_turn':
      return 'end_turn';
    case 'max_tokens':
      return 'max_tokens';
    case 'tool_use':
      return 'tool_use';
    case 'stop_sequence':
      return 'stop_sequence';
    default:
      return 'end_turn';
  }
}
