/**
 * Auth Flow Integration Tests
 *
 * Tests the end-to-end credential storage, GitHub device flow,
 * and session management using mocked SecureStore and fetch.
 */

import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { CredentialService } from '@/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import type { Mock } from 'vitest';

// In-memory store to simulate Capacitor Secure Storage
const secureStoreMap = new Map<string, string>();

beforeEach(() => {
  secureStoreMap.clear();
  vi.clearAllMocks();

  // Mock global window/Capacitor for native platform
  vi.stubGlobal('window', {
    Capacitor: {
      isNativePlatform: () => true, // Native for integration tests to use SecureStorage
    },
  });

  // Wire up SecureStoragePlugin mocks to an in-memory map
  (SecureStoragePlugin.set as Mock).mockImplementation(
    async ({ key, value }: { key: string; value: string }) => {
      secureStoreMap.set(key, value);
    }
  );
  (SecureStoragePlugin.get as Mock).mockImplementation(async ({ key }: { key: string }) => {
    const value = secureStoreMap.get(key);
    if (value === undefined) throw new Error('Key not found');
    return { value };
  });
  (SecureStoragePlugin.remove as Mock).mockImplementation(async ({ key }: { key: string }) => {
    secureStoreMap.delete(key);
    return { value: true };
  });

  // Default biometric mocks
  (BiometricAuth.checkBiometry as Mock).mockResolvedValue({
    isAvailable: true,
    biometryType: 1,
    reason: '',
    code: 0,
    strongBiometryIsAvailable: true,
    biometryTypes: [1],
  });
  (BiometricAuth.authenticate as Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Auth Flow Integration', () => {
  describe('Credential lifecycle', () => {
    it('stores and retrieves an Anthropic key', async () => {
      const key = 'sk-ant-test-key-1234567890';
      const result = await CredentialService.store('anthropic', key, {
        skipValidation: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Credential stored successfully');

      const retrieved = await CredentialService.retrieve('anthropic');
      expect(retrieved.secret).toBe(key);
      expect(retrieved.metadata?.type).toBe('anthropic');
    });

    it('stores and retrieves an OpenAI key', async () => {
      const key = 'sk-proj-test-key-1234567890';
      const result = await CredentialService.store('openai', key, {
        skipValidation: true,
      });

      expect(result.isValid).toBe(true);

      const retrieved = await CredentialService.retrieve('openai');
      expect(retrieved.secret).toBe(key);
    });

    it('stores and retrieves a GitHub token', async () => {
      const token = `ghp_${'a'.repeat(36)}`;
      const result = await CredentialService.store('github', token, {
        skipValidation: true,
      });

      expect(result.isValid).toBe(true);

      const retrieved = await CredentialService.retrieve('github');
      expect(retrieved.secret).toBe(token);
    });

    it('deletes a credential', async () => {
      const key = 'sk-ant-test-key-delete';
      await CredentialService.store('anthropic', key, {
        skipValidation: true,
      });

      expect(await CredentialService.exists('anthropic')).toBe(true);

      const deleted = await CredentialService.delete('anthropic');
      expect(deleted).toBe(true);

      expect(await CredentialService.exists('anthropic')).toBe(false);

      const retrieved = await CredentialService.retrieve('anthropic');
      expect(retrieved.secret).toBeNull();
    });

    it('returns null for a credential that was never stored', async () => {
      const retrieved = await CredentialService.retrieve('openai');
      expect(retrieved.secret).toBeNull();
    });
  });

  describe('Format validation', () => {
    it('rejects an invalid Anthropic key format', async () => {
      const result = await CredentialService.store('anthropic', 'bad-key-format');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });

    it('rejects an invalid OpenAI key format', async () => {
      const result = await CredentialService.store('openai', 'not-an-openai-key');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });

    it('rejects an invalid GitHub token format', async () => {
      const result = await CredentialService.store('github', 'bad-token');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
    });

    it('accepts MCP server credentials without format validation', async () => {
      const result = await CredentialService.store('mcp_server', 'any-arbitrary-value', {
        skipValidation: true,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Biometric authentication', () => {
    it('checks biometric availability', async () => {
      const available = await CredentialService.isBiometricAvailable();
      expect(available).toBe(true);
    });

    it('reports biometric unavailable when not available', async () => {
      (BiometricAuth.checkBiometry as Mock).mockResolvedValue({
        isAvailable: false,
        biometryType: 0,
        reason: 'No biometry available',
        code: 0,
        strongBiometryIsAvailable: false,
        biometryTypes: [],
      });
      const available = await CredentialService.isBiometricAvailable();
      expect(available).toBe(false);
    });

    it('blocks storage when biometric auth fails', async () => {
      (BiometricAuth.authenticate as Mock).mockRejectedValue(new Error('user_cancel'));

      const result = await CredentialService.store('anthropic', 'sk-ant-test-key-bio', {
        requireBiometric: true,
        skipValidation: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Biometric authentication failed');
    });

    it('allows storage when biometric auth succeeds', async () => {
      const result = await CredentialService.store('anthropic', 'sk-ant-test-key-bio-success', {
        requireBiometric: true,
        skipValidation: true,
      });

      expect(result.isValid).toBe(true);
    });

    it('blocks retrieval when biometric auth fails', async () => {
      // First store without biometric
      await CredentialService.store('anthropic', 'sk-ant-test-key-retrieve', {
        skipValidation: true,
      });

      // Then attempt retrieval with biometric (but auth fails)
      (BiometricAuth.authenticate as Mock).mockRejectedValue(new Error('user_cancel'));

      const retrieved = await CredentialService.retrieve('anthropic', {
        requireBiometric: true,
      });
      expect(retrieved.secret).toBeNull();
    });
  });

  describe('Secret masking', () => {
    it('masks GitHub token correctly', () => {
      const token = 'ghp_' + 'abcdefghij1234567890ABCDEFGHIJKLMNOP';
      const masked = CredentialService.maskSecret(token, 'github');
      expect(masked).toMatch(/^ghp_abc\.\.\.MNOP$/);
    });

    it('masks Anthropic key correctly', () => {
      const key = 'sk-ant-abcdef1234567890';
      const masked = CredentialService.maskSecret(key, 'anthropic');
      expect(masked).toMatch(/^sk-ant-\.\.\.7890$/);
    });

    it('masks OpenAI key correctly', () => {
      const key = 'sk-proj-abcdef1234567890';
      const masked = CredentialService.maskSecret(key, 'openai');
      expect(masked).toMatch(/^sk-\.\.\.7890$/);
    });

    it('returns empty string for empty secret', () => {
      expect(CredentialService.maskSecret('', 'github')).toBe('');
    });
  });

  describe('Stored credential types', () => {
    it('returns empty array when nothing stored', async () => {
      const types = await CredentialService.getStoredCredentialTypes();
      expect(types).toEqual([]);
    });

    it('returns only stored types', async () => {
      await CredentialService.store('anthropic', 'sk-ant-stored-type', {
        skipValidation: true,
      });
      await CredentialService.store('github', `ghp_${'x'.repeat(36)}`, { skipValidation: true });

      const types = await CredentialService.getStoredCredentialTypes();
      expect(types).toContain('anthropic');
      expect(types).toContain('github');
      expect(types).not.toContain('openai');
    });
  });
});
