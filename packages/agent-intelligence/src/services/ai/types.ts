/**
 * AI Service Types
 *
 * Common types for AI provider integrations.
 */

/**
 * Supported AI providers
 */
export type AIProvider =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'azure'
  | 'xai'
  | 'amazon-bedrock'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'deepseek';

/**
 * Message role in conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Message content types
 */
export type ContentType = 'text' | 'tool_use' | 'tool_result' | 'image' | 'document' | 'audio';

/**
 * A message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string | ContentBlock[];
}

/**
 * Image source for image content blocks
 */
export interface ImageSource {
  type: 'base64' | 'url' | 'file_id';
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  data: string;
}

/**
 * Document source for document content blocks
 */
export interface DocumentSource {
  type: 'base64' | 'url';
  mediaType: 'application/pdf';
  data: string;
}

/**
 * Audio source for audio content blocks
 */
export interface AudioSource {
  type: 'base64';
  mediaType: 'audio/wav' | 'audio/mp3' | 'audio/webm';
  data: string;
}

/**
 * Base content block for multi-modal messages
 */
export interface BaseContentBlock {
  type: ContentType;
}

/**
 * Text content block
 */
export interface TextContentBlock extends BaseContentBlock {
  type: 'text';
  text?: string;
}

/**
 * Tool use content block
 */
export interface ToolUseContentBlock extends BaseContentBlock {
  type: 'tool_use';
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

/**
 * Tool result content block
 */
export interface ToolResultContentBlock extends BaseContentBlock {
  type: 'tool_result';
  tool_use_id?: string;
  content?: string;
}

/**
 * Image content block
 */
export interface ImageContentBlock extends BaseContentBlock {
  type: 'image';
  source: ImageSource;
}

/**
 * Document content block
 */
export interface DocumentContentBlock extends BaseContentBlock {
  type: 'document';
  source: DocumentSource;
  filename?: string;
}

/**
 * Audio content block
 */
export interface AudioContentBlock extends BaseContentBlock {
  type: 'audio';
  source: AudioSource;
  transcript?: string;
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
  source?: ImageSource | DocumentSource | AudioSource;
  filename?: string;
  transcript?: string;
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
