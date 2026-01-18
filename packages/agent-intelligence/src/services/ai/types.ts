/**
 * AI Service Types
 *
 * Common types for AI provider integrations.
 */

/**
 * Supported AI providers
 */
export type AIProvider = 'anthropic' | 'openai';

/**
 * Message role in conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Message content types
 */
export type ContentType = 'text' | 'tool_use' | 'tool_result';

/**
 * A message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string | ContentBlock[];
}

/**
 * Content block for multi-modal messages
 */
export interface ContentBlock {
  type: ContentType;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

/**
 * Tool definition for function calling
 */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, ToolProperty>;
    required?: string[];
  };
}

/**
 * Tool property schema
 */
export interface ToolProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: ToolProperty;
}

/**
 * Response from AI completion
 */
export interface CompletionResponse {
  id: string;
  content: ContentBlock[];
  model: string;
  stopReason: 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence';
  usage: TokenUsage;
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Streaming event types
 */
export type StreamEventType =
  | 'message_start'
  | 'content_block_start'
  | 'content_block_delta'
  | 'content_block_stop'
  | 'message_delta'
  | 'message_stop';

/**
 * Streaming event
 */
export interface StreamEvent {
  type: StreamEventType;
  index?: number;
  delta?: {
    type?: string;
    text?: string;
    partial_json?: string;
  };
  content_block?: ContentBlock;
  usage?: Partial<TokenUsage>;
}

/**
 * Completion options
 */
export interface CompletionOptions {
  model: string;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  tools?: ToolDefinition[];
  stream?: boolean;
  systemPrompt?: string;
}

/**
 * AI client interface
 */
export interface AIClient {
  provider: AIProvider;
  complete(messages: Message[], options: CompletionOptions): Promise<CompletionResponse>;
  completeStream(
    messages: Message[],
    options: CompletionOptions,
    onEvent: (event: StreamEvent) => void
  ): Promise<CompletionResponse>;
}
