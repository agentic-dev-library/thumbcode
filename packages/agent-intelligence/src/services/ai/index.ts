/**
 * AI Services
 *
 * Unified interface for AI providers (Anthropic, OpenAI).
 */

export * from './types';
export * from './anthropic-client';
export * from './openai-client';

import type { AIClient, AIProvider } from './types';
import { createAnthropicClient, ANTHROPIC_MODELS } from './anthropic-client';
import { createOpenAIClient, OPENAI_MODELS } from './openai-client';

/**
 * Create an AI client for the specified provider
 */
export function createAIClient(provider: AIProvider, apiKey: string): AIClient {
  switch (provider) {
    case 'anthropic':
      return createAnthropicClient(apiKey);
    case 'openai':
      return createOpenAIClient(apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'anthropic':
      return ANTHROPIC_MODELS.CLAUDE_3_5_SONNET;
    case 'openai':
      return OPENAI_MODELS.GPT_4O;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
  switch (provider) {
    case 'anthropic':
      return Object.values(ANTHROPIC_MODELS);
    case 'openai':
      return Object.values(OPENAI_MODELS);
    default:
      return [];
  }
}
