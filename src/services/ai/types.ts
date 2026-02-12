/**
 * AI Client Abstraction Types
 *
 * Provider-agnostic interfaces for AI message sending and streaming.
 * Used by AnthropicClient and OpenAIClient implementations.
 */

/** Supported AI providers */
export type AIProvider = 'anthropic' | 'openai';

/** A message in an AI conversation */
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** A chunk of streamed AI response */
export interface AIStreamChunk {
  text: string;
  done: boolean;
}

/** Provider-agnostic AI client interface */
export interface AIClient {
  /** Send a message and receive the full response */
  sendMessage(messages: AIMessage[], systemPrompt: string, signal?: AbortSignal): Promise<string>;

  /** Stream a message response, calling onChunk for each text delta */
  streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    onChunk: (chunk: AIStreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void>;
}
