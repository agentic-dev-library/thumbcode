/**
 * AI Provider Factory
 *
 * Creates AIClient instances using Vercel AI SDK providers.
 * Adapts the AI SDK interface (generateText/streamText) to our
 * existing AIClient interface (complete/completeStream) so all
 * downstream consumers continue working without changes.
 */

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createCohere } from '@ai-sdk/cohere';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { jsonSchema, tool } from '@ai-sdk/provider-utils';
import { createXai } from '@ai-sdk/xai';
import type { LanguageModel, LanguageModelUsage } from 'ai';
import { generateText, streamText } from 'ai';
import type {
  AIClient,
  AIProvider,
  CompletionOptions,
  CompletionResponse,
  ContentBlock,
  Message,
  StreamEvent,
  ToolDefinition,
} from './types';

/**
 * Default models per provider.
 */
const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.0-flash',
  azure: 'gpt-4o',
  xai: 'grok-3-mini',
  'amazon-bedrock': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  mistral: 'mistral-large-latest',
  cohere: 'command-r-plus',
  groq: 'llama-3.3-70b-versatile',
  deepseek: 'deepseek-chat',
};

/**
 * Available models per provider for discovery.
 */
const AVAILABLE_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo-preview', 'o3-mini'],
  anthropic: [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  google: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'],
  azure: ['gpt-4o', 'gpt-4o-mini'],
  xai: ['grok-3-mini', 'grok-3'],
  'amazon-bedrock': [
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
    'anthropic.claude-3-haiku-20240307-v1:0',
  ],
  mistral: ['mistral-large-latest', 'mistral-small-latest', 'pixtral-large-latest'],
  cohere: ['command-r-plus', 'command-r'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
};

/**
 * Create a Vercel AI SDK language model for the given provider.
 */
function createLanguageModel(providerId: string, model: string, apiKey: string): LanguageModel {
  switch (providerId) {
    case 'openai':
      return createOpenAI({ apiKey })(model);
    case 'anthropic':
      return createAnthropic({ apiKey })(model);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(model);
    case 'azure':
      return createAzure({ apiKey })(model);
    case 'xai':
      return createXai({ apiKey })(model);
    case 'amazon-bedrock':
      return createAmazonBedrock({ accessKeyId: apiKey, secretAccessKey: '', region: 'us-east-1' })(
        model
      );
    case 'mistral':
      return createMistral({ apiKey })(model);
    case 'cohere':
      return createCohere({ apiKey })(model);
    case 'groq':
      return createGroq({ apiKey })(model);
    case 'deepseek':
      return createDeepSeek({ apiKey })(model);
    default:
      throw new Error(`Unsupported AI provider: ${providerId}`);
  }
}

/**
 * Convert our ToolDefinition format to AI SDK ToolSet format.
 */
function convertTools(tools?: ToolDefinition[]) {
  if (!tools || tools.length === 0) return undefined;

  const result: Record<string, ReturnType<typeof tool>> = {};
  for (const t of tools) {
    result[t.name] = tool({
      description: t.description,
      inputSchema: jsonSchema(t.input_schema as Record<string, unknown>),
    });
  }
  return result;
}

/**
 * Map AI SDK finish reason to our format.
 */
function mapFinishReason(reason: string | undefined | null): CompletionResponse['stopReason'] {
  switch (reason) {
    case 'stop':
      return 'end_turn';
    case 'length':
      return 'max_tokens';
    case 'tool-calls':
      return 'tool_use';
    case 'content-filter':
      return 'stop_sequence';
    default:
      return 'end_turn';
  }
}

type SDKMessage =
  | { role: 'system'; content: string }
  | { role: 'user' | 'assistant'; content: string };

/**
 * Convert our Message[] + CompletionOptions to AI SDK message format.
 */
function toSDKMessages(messages: Message[], options: CompletionOptions): SDKMessage[] {
  const result: SDKMessage[] = [];

  const systemPrompt = options.systemPrompt || messages.find((m) => m.role === 'system')?.content;
  if (systemPrompt && typeof systemPrompt === 'string') {
    result.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const text = typeof msg.content === 'string' ? msg.content : contentBlocksToText(msg.content);
    result.push({ role: msg.role as 'user' | 'assistant', content: text });
  }

  return result;
}

/**
 * Normalized tool call shape compatible with both AI SDK v6 results and our interface.
 * AI SDK v6 uses `input` on tool calls; we cast the SDK results to this type.
 */
type ToolCallArray = ReadonlyArray<{ toolCallId: string; toolName: string; input: unknown }>;

/**
 * Build ContentBlock[] from text and optional tool calls.
 */
function buildContentBlocks(text: string, toolCalls?: ToolCallArray): ContentBlock[] {
  const content: ContentBlock[] = [];
  if (text) {
    content.push({ type: 'text', text });
  }
  if (toolCalls) {
    for (const tc of toolCalls) {
      content.push({
        type: 'tool_use',
        id: tc.toolCallId,
        name: tc.toolName,
        input: tc.input as Record<string, unknown>,
      });
    }
  }
  return content;
}

/**
 * Build a TokenUsage object from AI SDK LanguageModelUsage.
 */
function buildUsage(usage?: LanguageModelUsage) {
  const input = usage?.inputTokens ?? 0;
  const output = usage?.outputTokens ?? 0;
  return { inputTokens: input, outputTokens: output, totalTokens: input + output };
}

/**
 * Create an AI client backed by a Vercel AI SDK provider.
 * Adapts generateText/streamText to the existing AIClient interface.
 */
export function createAISDKClient(providerId: AIProvider, apiKey: string): AIClient {
  return {
    provider: providerId,

    async complete(messages: Message[], options: CompletionOptions): Promise<CompletionResponse> {
      const model = createLanguageModel(providerId, options.model, apiKey);
      const sdkMessages = toSDKMessages(messages, options);

      const result = await generateText({
        model,
        messages: sdkMessages,
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        topP: options.topP,
        stopSequences: options.stopSequences,
        tools: convertTools(options.tools),
      });

      return {
        id: result.response?.id ?? `gen-${Date.now()}`,
        content: buildContentBlocks(result.text, result.toolCalls as ToolCallArray),
        model: options.model,
        stopReason: mapFinishReason(result.finishReason),
        usage: buildUsage(result.usage),
      };
    },

    async completeStream(
      messages: Message[],
      options: CompletionOptions,
      onEvent: (event: StreamEvent) => void
    ): Promise<CompletionResponse> {
      const model = createLanguageModel(providerId, options.model, apiKey);
      const sdkMessages = toSDKMessages(messages, options);

      const result = streamText({
        model,
        messages: sdkMessages,
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
        topP: options.topP,
        stopSequences: options.stopSequences,
        tools: convertTools(options.tools),
      });

      onEvent({ type: 'message_start' });
      onEvent({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });

      let collectedText = '';
      for await (const chunk of result.textStream) {
        collectedText += chunk;
        onEvent({ type: 'content_block_delta', index: 0, delta: { type: 'text', text: chunk } });
      }
      onEvent({ type: 'content_block_stop', index: 0 });

      const finalResult = await result.response;
      const usage = await result.usage;
      const finishReason = await result.finishReason;
      const toolCalls = (await result.toolCalls) as ToolCallArray;

      emitToolCallEvents(toolCalls, onEvent);

      onEvent({ type: 'message_delta', usage: { outputTokens: usage?.outputTokens ?? 0 } });
      onEvent({ type: 'message_stop' });

      return {
        id: finalResult?.id ?? `gen-${Date.now()}`,
        content: buildContentBlocks(collectedText, toolCalls),
        model: options.model,
        stopReason: mapFinishReason(finishReason),
        usage: buildUsage(usage),
      };
    },
  };
}

/**
 * Emit stream events for tool calls.
 */
function emitToolCallEvents(toolCalls: ToolCallArray, onEvent: (event: StreamEvent) => void): void {
  for (let i = 0; i < toolCalls.length; i++) {
    const tc = toolCalls[i];
    onEvent({
      type: 'content_block_start',
      index: i + 1,
      content_block: {
        type: 'tool_use',
        id: tc.toolCallId,
        name: tc.toolName,
        input: tc.input as Record<string, unknown>,
      },
    });
    onEvent({ type: 'content_block_stop', index: i + 1 });
  }
}

/**
 * Get default model for a provider from the factory registry.
 */
export function getFactoryDefaultModel(providerId: string): string {
  return DEFAULT_MODELS[providerId] ?? 'unknown';
}

/**
 * Get available models for a provider.
 */
export function getFactoryAvailableModels(providerId: string): string[] {
  return AVAILABLE_MODELS[providerId] ?? [];
}

/**
 * Helper: convert ContentBlock[] to plain text.
 */
function contentBlocksToText(blocks: ContentBlock[]): string {
  return blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n');
}
