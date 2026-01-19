/**
 * Credential Validation
 *
 * Provides Zod schemas for validating credential formats.
 */
import { z } from 'zod';

const AnthropicKeySchema = z.string().startsWith('sk-ant-');
const OpenAIKeySchema = z.string().startsWith('sk-');
// GitHub tokens: classic (ghp_), fine-grained (github_pat_), OAuth (gho_), or installation tokens
const GitHubTokenSchema = z
  .string()
  .regex(/^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+|gho_[a-zA-Z0-9]+|ghs_[a-zA-Z0-9]+|ghr_[a-zA-Z0-9]+)$/);

/**
 * Validate an Anthropic API key format
 */
export function validateAnthropicKey(value: string): boolean {
  return AnthropicKeySchema.safeParse(value).success;
}

/**
 * Validate an OpenAI API key format
 */
export function validateOpenAIKey(value: string): boolean {
  return OpenAIKeySchema.safeParse(value).success;
}

/**
 * Validate a GitHub token format (classic, fine-grained, OAuth, or installation)
 */
export function validateGitHubToken(value: string): boolean {
  return GitHubTokenSchema.safeParse(value).success;
}

/**
 * Generic validation function for all credential types
 */
export function validate(type: string, value: string): boolean {
  switch (type) {
    case 'anthropic':
      return validateAnthropicKey(value);
    case 'openai':
      return validateOpenAIKey(value);
    case 'github':
      return validateGitHubToken(value);
    default:
      return true; // No validation for other types
  }
}
