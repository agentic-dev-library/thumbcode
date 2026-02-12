/**
 * OpenAI AI Client
 *
 * AIClient implementation using the OpenAI SDK.
 * Supports both full message responses and streaming.
 */

import OpenAI from 'openai';
import type { AIClient, AIMessage, AIStreamChunk } from './types';

const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIClient implements AIClient {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new OpenAI({
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
    const response = await this.client.chat.completions.create(
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter((m) => m.role !== 'system'),
        ],
      },
      { signal }
    );

    return response.choices[0]?.message?.content ?? '';
  }

  async streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    onChunk: (chunk: AIStreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const stream = await this.client.chat.completions.create(
      {
        model: this.model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter((m) => m.role !== 'system'),
        ],
      },
      { signal }
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        onChunk({ text: delta, done: false });
      }
    }

    onChunk({ text: '', done: true });
  }
}
