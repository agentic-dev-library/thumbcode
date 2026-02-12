/**
 * AI Client Factory
 *
 * Creates provider-specific AI client instances based on the provider type.
 */

import { AnthropicClient } from './AnthropicClient';
import { OpenAIClient } from './OpenAIClient';
import type { AIClient, AIProvider } from './types';

/**
 * Create an AI client for the given provider.
 *
 * @param provider - The AI provider to use ('anthropic' or 'openai')
 * @param apiKey - The API key for the provider
 * @returns An AIClient implementation for the specified provider
 */
export function createAIClient(provider: AIProvider, apiKey: string): AIClient {
  switch (provider) {
    case 'anthropic':
      return new AnthropicClient(apiKey);
    case 'openai':
      return new OpenAIClient(apiKey);
    default: {
      const exhaustive: never = provider;
      throw new Error(`Unsupported AI provider: ${exhaustive}`);
    }
  }
}
