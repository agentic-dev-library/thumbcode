/**
 * Credential Validation
 *
 * Provides Zod schemas for validating credential formats.
 */
import { z } from 'zod';

const AnthropicKeySchema = z.string().startsWith('sk-ant-');
const OpenAIKeySchema = z.string().startsWith('sk-');
// GitHub tokens:
// - Classic personal access tokens: `ghp_` + 36 alphanumeric chars (total 40). GitHub currently uses a fixed length,
//   so we enforce `{36}` here.
// - Fine-grained PATs: `github_pat_` followed by several segments. GitHub does not currently guarantee a fixed
//   total length in public docs, so we accept one or more chars with `+` after the prefix.
// - OAuth tokens: `gho_` prefix; exact length is not documented and may change, so we use `+`.
// - GitHub App installation tokens: `ghs_` / `ghr_` prefixes; lengths are likewise not documented.
//
// We intentionally only constrain the classic PAT suffix to 36 characters and keep the other token types flexible
// to avoid rejecting valid tokens if GitHub changes their formats. If GitHub later documents fixed lengths for the
// other token types, this regex can be updated accordingly.
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
