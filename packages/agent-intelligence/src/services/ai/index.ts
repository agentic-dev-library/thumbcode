/**
 * AI Services
 *
 * Unified interface for AI providers via Vercel AI SDK.
 * Legacy direct-SDK clients (anthropic-client, openai-client) are preserved
 * but all new provider support routes through the AIProviderFactory.
 */

export * from './anthropic-client';
export * from './openai-client';
export * from './provider-factory';
export * from './types';

import { ANTHROPIC_MODELS } from './anthropic-client';
import { OPENAI_MODELS } from './openai-client';
import {
  createAISDKClient,
  getFactoryAvailableModels,
  getFactoryDefaultModel,
} from './provider-factory';
import type { AIClient, AIProvider } from './types';

/**
 * Create an AI client for the specified provider.
 * Uses Vercel AI SDK providers for a unified interface across all providers.
 */
export function createAIClient(provider: AIProvider, apiKey: string): AIClient {
  return createAISDKClient(provider, apiKey);
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  // Use factory defaults for all providers (includes legacy providers with updated models)
  const model = getFactoryDefaultModel(provider);
  if (model !== 'unknown') return model;

  // Fallback for legacy compatibility
  switch (provider) {
    case 'anthropic':
      return ANTHROPIC_MODELS.CLAUDE_3_5_SONNET;
    case 'openai':
      return OPENAI_MODELS.GPT_4O;
    default:
      throw new Error(`No default model for provider: ${provider}`);
  }
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
  // Use factory models for all providers
  const models = getFactoryAvailableModels(provider);
  if (models.length > 0) return models;

  // Fallback for legacy compatibility
  switch (provider) {
    case 'anthropic':
      return Object.values(ANTHROPIC_MODELS);
    case 'openai':
      return Object.values(OPENAI_MODELS);
    default:
      return [];
  }
}
