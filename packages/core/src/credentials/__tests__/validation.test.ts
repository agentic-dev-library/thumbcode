/**
 * Credential Validation Tests
 *
 * Tests for format validation of API keys (Anthropic, OpenAI, GitHub).
 */

import {
  validate,
  validateAnthropicKey,
  validateGitHubToken,
  validateOpenAIKey,
} from '../validation';

describe('validation', () => {
  describe('validateAnthropicKey', () => {
    it('should accept valid Anthropic key format', () => {
      expect(validateAnthropicKey('sk-ant-abc123')).toBe(true);
    });

    it('should reject key without sk-ant- prefix', () => {
      expect(validateAnthropicKey('sk-abc123')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateAnthropicKey('')).toBe(false);
    });
  });

  describe('validateOpenAIKey', () => {
    it('should accept valid OpenAI key format', () => {
      expect(validateOpenAIKey('sk-proj-abc123')).toBe(true);
    });

    it('should accept sk- prefix', () => {
      expect(validateOpenAIKey('sk-something')).toBe(true);
    });

    it('should reject key without sk- prefix', () => {
      expect(validateOpenAIKey('abc123')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateOpenAIKey('')).toBe(false);
    });
  });

  describe('validateGitHubToken', () => {
    it('should accept classic PAT (ghp_ prefix with 36 chars)', () => {
      expect(validateGitHubToken('ghp_' + 'a'.repeat(36))).toBe(true);
    });

    it('should reject classic PAT with wrong length', () => {
      expect(validateGitHubToken('ghp_' + 'a'.repeat(10))).toBe(false);
    });

    it('should accept fine-grained PAT (github_pat_ prefix)', () => {
      expect(validateGitHubToken('github_pat_abc123_def456')).toBe(true);
    });

    it('should accept OAuth token (gho_ prefix)', () => {
      expect(validateGitHubToken('gho_abc123')).toBe(true);
    });

    it('should accept app installation token (ghs_ prefix)', () => {
      expect(validateGitHubToken('ghs_abc123')).toBe(true);
    });

    it('should accept refresh token (ghr_ prefix)', () => {
      expect(validateGitHubToken('ghr_abc123')).toBe(true);
    });

    it('should reject token with unknown prefix', () => {
      expect(validateGitHubToken('abc_123')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateGitHubToken('')).toBe(false);
    });
  });

  describe('validate (generic)', () => {
    it('should validate anthropic credentials', () => {
      expect(validate('anthropic', 'sk-ant-key123')).toBe(true);
      expect(validate('anthropic', 'invalid')).toBe(false);
    });

    it('should validate openai credentials', () => {
      expect(validate('openai', 'sk-key123')).toBe(true);
      expect(validate('openai', 'invalid')).toBe(false);
    });

    it('should validate github credentials', () => {
      expect(validate('github', 'ghp_' + 'a'.repeat(36))).toBe(true);
      expect(validate('github', 'invalid')).toBe(false);
    });

    it('should accept unknown types without validation', () => {
      expect(validate('mcp_server', 'any-value')).toBe(true);
      expect(validate('unknown_type', 'any-value')).toBe(true);
    });
  });
});
