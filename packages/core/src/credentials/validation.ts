/**
 * Credential Validation
 *
 * Provides Zod schemas for validating credential formats.
 */
import { z } from 'zod';

const AnthropicKeySchema = z.string().startsWith('sk-ant-');
const OpenAIKeySchema = z.string().startsWith('sk-');
const GitHubTokenSchema = z.string().regex(/^ghp_[a-zA-Z0-9]{36}$/);

export function validate(type: string, value: string): boolean {
  switch (type) {
    case 'anthropic':
      return AnthropicKeySchema.safeParse(value).success;
    case 'openai':
      return OpenAIKeySchema.safeParse(value).success;
    case 'github':
      return GitHubTokenSchema.safeParse(value).success;
    default:
      return true; // No validation for other types
  }
}
