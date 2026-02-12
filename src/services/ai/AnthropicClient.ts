/**
 * Anthropic AI Client
 *
 * AIClient implementation using the Anthropic SDK.
 * Supports both full message responses and streaming.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIClient, AIMessage, AIStreamChunk } from './types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

export class AnthropicClient implements AIClient {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = model;
  }

  async sendMessage(
    messages: AIMessage[],
    systemPrompt: string,
    signal?: AbortSignal
  ): Promise<string> {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      },
      { signal }
    );

    const textBlocks = response.content.filter((block) => block.type === 'text');
    return textBlocks.map((block) => block.text).join('');
  }

  async streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    onChunk: (chunk: AIStreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const stream = this.client.messages.stream(
      {
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      },
      { signal }
    );

    stream.on('text', (textDelta) => {
      onChunk({ text: textDelta, done: false });
    });

    // Wait for the stream to complete
    await stream.finalMessage();

    onChunk({ text: '', done: true });
  }
}
