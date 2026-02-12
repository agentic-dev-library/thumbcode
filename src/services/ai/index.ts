/**
 * AI Service
 *
 * Provider-agnostic AI client abstraction with Anthropic and OpenAI implementations.
 */

export { createAIClient } from './AIClientFactory';
export { getAgentSystemPrompt } from './AgentPrompts';
export { AnthropicClient } from './AnthropicClient';
export { OpenAIClient } from './OpenAIClient';
export type { AIClient, AIMessage, AIProvider, AIStreamChunk } from './types';
