/**
 * Credential Service Tests
 *
 * Note: These tests mock SecureStore and LocalAuthentication
 * since actual hardware-backed storage is not available in Jest.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useCredentialStore } from '@/stores';
import { CredentialService } from '../CredentialService';

// Mock SecureStore
jest.mock('expo-secure-store');

// Mock LocalAuthentication
jest.mock('expo-local-authentication');

// Mock fetch for API validation
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  useCredentialStore.setState({
    credentials: [],
    isValidating: false,
    lastError: null,
  });
});

describe('CredentialService', () => {
  describe('isBiometricAvailable', () => {
    it('should return true when hardware and enrollment are available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await CredentialService.isBiometricAvailable();
      expect(result).toBe(true);
    });

    it('should return false when hardware is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await CredentialService.isBiometricAvailable();
      expect(result).toBe(false);
    });

    it('should return false when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await CredentialService.isBiometricAvailable();
      expect(result).toBe(false);
    });
  });

  describe('authenticateWithBiometrics', () => {
    it('should return success when authentication succeeds', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await CredentialService.authenticateWithBiometrics();
      expect(result.success).toBe(true);
    });

    it('should return error when authentication fails', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await CredentialService.authenticateWithBiometrics();
      expect(result.success).toBe(false);
      expect(result.error).toBe('user_cancel');
    });

    it('should handle exceptions gracefully', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Hardware error')
      );

      const result = await CredentialService.authenticateWithBiometrics();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Hardware error');
    });
  });

  describe('store', () => {
    it('should store a credential in SecureStore', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ login: 'testuser' }),
        headers: new Headers({
          'x-oauth-scopes': 'repo, user',
          'x-ratelimit-remaining': '5000',
        }),
      });

      const result = await CredentialService.store('github', {
        name: 'Test GitHub Token',
        secret: 'ghp_test123',
      });

      expect(result.isValid).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should skip validation when skipValidation is true', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await CredentialService.store(
        'github',
        {
          name: 'Test Token',
          secret: 'ghp_test123',
        },
        { skipValidation: true }
      );

      expect(result.isValid).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should require biometric authentication when requested', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await CredentialService.store(
        'github',
        {
          name: 'Test Token',
          secret: 'ghp_test123',
        },
        { requireBiometric: true }
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Biometric authentication failed');
    });

    it('should fail when validation fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await CredentialService.store('github', {
        name: 'Invalid Token',
        secret: 'invalid_token',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid');
    });
  });

  describe('retrieve', () => {
    it('should retrieve a stored credential', async () => {
      const storedPayload = JSON.stringify({
        secret: 'ghp_test123',
        storedAt: new Date().toISOString(),
        type: 'github',
      });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(storedPayload);

      const result = await CredentialService.retrieve('github');

      expect(result.secret).toBe('ghp_test123');
      expect(result.metadata?.type).toBe('github');
    });

    it('should return null for non-existent credential', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await CredentialService.retrieve('github');

      expect(result.secret).toBeNull();
    });

    it('should require biometric authentication when requested', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await CredentialService.retrieve('github', {
        requireBiometric: true,
      });

      expect(result.secret).toBeNull();
    });
  });

  describe('validateCredential', () => {
    it('should validate a GitHub token successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ login: 'testuser' }),
        headers: new Headers({
          'x-oauth-scopes': 'repo, user',
          'x-ratelimit-remaining': '5000',
        }),
      });

      const result = await CredentialService.validateCredential('github', 'ghp_valid_token');

      expect(result.isValid).toBe(true);
      expect(result.metadata?.username).toBe('testuser');
    });

    it('should reject an invalid GitHub token', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await CredentialService.validateCredential('github', 'invalid');

      expect(result.isValid).toBe(false);
    });

    it('should validate an Anthropic key successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'anthropic-ratelimit-requests-remaining': '100',
        }),
      });

      const result = await CredentialService.validateCredential('anthropic', 'sk-ant-valid');

      expect(result.isValid).toBe(true);
    });

    it('should validate an OpenAI key successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Headers({
          'x-ratelimit-remaining-requests': '100',
        }),
      });

      const result = await CredentialService.validateCredential('openai', 'sk-valid');

      expect(result.isValid).toBe(true);
    });

    it('should accept MCP server credentials without validation', async () => {
      const result = await CredentialService.validateCredential('mcp_server', 'any_token');

      expect(result.isValid).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a credential from SecureStore', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Add a credential to the store first
      useCredentialStore.setState({
        credentials: [
          {
            id: 'test-id',
            provider: 'github',
            name: 'Test',
            secureStoreKey: 'thumbcode_cred_github',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      const result = await CredentialService.delete('github');

      expect(result).toBe(true);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('thumbcode_cred_github');
    });
  });

  describe('exists', () => {
    it('should return true when credential exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('some_value');

      const result = await CredentialService.exists('github');

      expect(result).toBe(true);
    });

    it('should return false when credential does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await CredentialService.exists('github');

      expect(result).toBe(false);
    });
  });

  describe('revalidateAll', () => {
    it('should validate all stored credentials', async () => {
      // Setup stored credentials
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
        if (key === 'thumbcode_cred_github') {
          return JSON.stringify({
            secret: 'ghp_test',
            storedAt: new Date().toISOString(),
            type: 'github',
          });
        }
        return null;
      });

      // Mock successful validation
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ login: 'testuser' }),
        headers: new Headers({
          'x-oauth-scopes': 'repo',
          'x-ratelimit-remaining': '5000',
        }),
      });

      // Add credential to metadata store
      useCredentialStore.setState({
        credentials: [
          {
            id: 'test-id',
            provider: 'github',
            name: 'Test',
            secureStoreKey: 'thumbcode_cred_github',
            status: 'unknown',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      const results = await CredentialService.revalidateAll();

      expect(results.github?.isValid).toBe(true);
    });
  });
});
