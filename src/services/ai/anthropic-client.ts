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
 * Process a single Anthropic stream event and emit the corresponding StreamEvent
 */
function processAnthropicStreamEvent(
  // biome-ignore lint/suspicious/noExplicitAny: Anthropic SDK stream events have dynamic properties
  event: { type: string; [key: string]: any },
  blockIndex: number,
  currentText: string,
  onEvent: (event: StreamEvent) => void
): { blockIndex: number; text: string; contentBlock: ContentBlock | null } {
  switch (event.type) {
    case 'message_start':
      onEvent({ type: 'message_start' });
      return { blockIndex, text: currentText, contentBlock: null };
    case 'content_block_start':
      if (event.content_block.type === 'text') {
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
      return { blockIndex: event.index, text: '', contentBlock: null };
    case 'content_block_delta':
      if (event.delta.type === 'text_delta') {
        onEvent({
          type: 'content_block_delta',
          index: blockIndex,
          delta: { type: 'text', text: event.delta.text },
        });
        return { blockIndex, text: currentText + event.delta.text, contentBlock: null };
      }
      if (event.delta.type === 'input_json_delta') {
        onEvent({
          type: 'content_block_delta',
          index: blockIndex,
          delta: { type: 'tool_use', partial_json: event.delta.partial_json },
        });
      }
      return { blockIndex, text: currentText, contentBlock: null };
    case 'content_block_stop': {
      const contentBlock = currentText ? { type: 'text' as const, text: currentText } : null;
      onEvent({ type: 'content_block_stop', index: blockIndex });
      return { blockIndex, text: currentText, contentBlock };
    }
    case 'message_delta':
      onEvent({
        type: 'message_delta',
        usage: { outputTokens: event.usage?.output_tokens },
      });
      return { blockIndex, text: currentText, contentBlock: null };
    case 'message_stop':
      onEvent({ type: 'message_stop' });
      return { blockIndex, text: currentText, contentBlock: null };
    default:
      return { blockIndex, text: currentText, contentBlock: null };
  }
}

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
        const result = processAnthropicStreamEvent(event, currentBlockIndex, currentText, onEvent);
        currentBlockIndex = result.blockIndex;
        currentText = result.text;
        if (result.contentBlock) {
          collectedContent.push(result.contentBlock);
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
): (
  | Anthropic.Messages.TextBlockParam
  | Anthropic.Messages.ToolUseBlockParam
  | Anthropic.Messages.ToolResultBlockParam
  | Anthropic.Messages.ImageBlockParam
)[] {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: maps each content block type to Anthropic API format
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
    if (block.type === 'image' && block.source) {
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: block.source.mediaType as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp',
          data: block.source.data,
        },
      };
    }
    if (block.type === 'document' && block.source) {
      // Document blocks are not yet supported in this SDK version;
      // encode as text with a reference to the document content.
      return {
        type: 'text' as const,
        text: `[Document: ${block.filename || 'document.pdf'}]`,
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
