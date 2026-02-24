/**
 * KeyValidator Tests
 *
 * Tests for API credential validation against provider endpoints.
 */

vi.mock('../../api/api', () => ({
  secureFetch: vi.fn(),
}));

import { secureFetch } from '../../api/api';
import { KeyValidator } from '../KeyValidator';

const mockSecureFetch = secureFetch as Mock;

describe('KeyValidator', () => {
  let validator: KeyValidator;

  beforeEach(() => {
    vi.clearAllMocks();
    validator = new KeyValidator();
  });

  describe('validateCredential', () => {
    it('should reject invalid format before making API call', async () => {
      const result = await validator.validateCredential('anthropic', 'invalid-key');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
      expect(mockSecureFetch).not.toHaveBeenCalled();
    });

    it('should accept mcp_server credentials without API validation', async () => {
      const result = await validator.validateCredential('mcp_server', 'any-value');

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('MCP server');
    });

    it('should accept unknown credential types', async () => {
      const result = await validator.validateCredential('custom' as any, 'any-value');

      expect(result.isValid).toBe(true);
    });
  });

  describe('GitHub token validation', () => {
    const validToken = `ghp_${'a'.repeat(36)}`;

    it('should validate a valid GitHub token', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ login: 'testuser', avatar_url: 'https://avatar.url', name: 'Test' }),
        headers: new Headers({
          'github-authentication-token-expiration': '2025-12-31T00:00:00Z',
          'x-oauth-scopes': 'repo, user',
          'x-ratelimit-remaining': '4999',
        }),
      } as Response);

      const result = await validator.validateCredential('github', validToken);

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('testuser');
      expect(result.metadata?.username).toBe('testuser');
      expect(result.metadata?.scopes).toEqual(['repo', 'user']);
    });

    it('should return invalid for 401 response', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as Response);

      const result = await validator.validateCredential('github', validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid GitHub token');
    });

    it('should return error for other HTTP errors', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      } as Response);

      const result = await validator.validateCredential('github', validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('500');
    });

    it('should handle network errors', async () => {
      mockSecureFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validator.validateCredential('github', validToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Network error');
    });
  });

  describe('Anthropic key validation', () => {
    const validKey = 'sk-ant-test123';

    it('should validate a valid Anthropic key', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'anthropic-ratelimit-requests-remaining': '999',
        }),
      } as Response);

      const result = await validator.validateCredential('anthropic', validKey);

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('valid');
    });

    it('should return invalid for 401 response', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as Response);

      const result = await validator.validateCredential('anthropic', validKey);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid Anthropic');
    });

    it('should treat 429 as valid but rate limited', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers(),
      } as Response);

      const result = await validator.validateCredential('anthropic', validKey);

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('rate limited');
    });
  });

  describe('OpenAI key validation', () => {
    const validKey = 'sk-test123abc';

    it('should validate a valid OpenAI key', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'x-ratelimit-remaining-requests': '499',
        }),
      } as Response);

      const result = await validator.validateCredential('openai', validKey);

      expect(result.isValid).toBe(true);
      expect(result.message).toContain('valid');
    });

    it('should return invalid for 401 response', async () => {
      mockSecureFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as Response);

      const result = await validator.validateCredential('openai', validKey);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid OpenAI');
    });
  });

  describe('maskSecret', () => {
    it('should mask GitHub classic PAT', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = validator.maskSecret(token, 'github');
      expect(masked).toBe('ghp_123...wxyz');
    });

    it('should mask Anthropic key', () => {
      const key = 'sk-ant-abc123def456';
      const masked = validator.maskSecret(key, 'anthropic');
      expect(masked).toBe('sk-ant-...f456');
    });

    it('should mask OpenAI key', () => {
      const key = 'sk-abc123def456';
      const masked = validator.maskSecret(key, 'openai');
      expect(masked).toBe('sk-...f456');
    });

    it('should handle empty string', () => {
      expect(validator.maskSecret('', 'github')).toBe('');
    });

    it('should handle unknown credential type', () => {
      const masked = validator.maskSecret('secret12345678', 'custom' as any);
      expect(masked).toBe('secr...5678');
    });
  });
});
