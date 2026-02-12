/**
 * KeyStorage Tests
 *
 * Tests for secure credential storage and retrieval using SecureStore.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { KeyStorage } from '../KeyStorage';
import type { KeyValidator } from '../KeyValidator';

const mockValidator: jest.Mocked<KeyValidator> = {
  validateCredential: jest.fn(),
  maskSecret: jest.fn(),
} as any;

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

describe('KeyStorage', () => {
  let storage: KeyStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new KeyStorage(mockValidator);
  });

  describe('store', () => {
    it('should store a valid credential', async () => {
      mockValidator.validateCredential.mockResolvedValue({
        isValid: true,
        message: 'Valid',
      });

      const result = await storage.store('anthropic', 'sk-ant-test123');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Credential stored successfully');
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'thumbcode_cred_anthropic',
        expect.any(String),
        expect.objectContaining({
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        })
      );
    });

    it('should reject invalid format', async () => {
      const result = await storage.store('anthropic', 'invalid-key');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid credential format');
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should skip API validation when skipValidation is true', async () => {
      const result = await storage.store('anthropic', 'sk-ant-test123', {
        skipValidation: true,
      });

      expect(result.isValid).toBe(true);
      expect(mockValidator.validateCredential).not.toHaveBeenCalled();
    });

    it('should reject when API validation fails', async () => {
      mockValidator.validateCredential.mockResolvedValue({
        isValid: false,
        message: 'API key expired',
      });

      const result = await storage.store('anthropic', 'sk-ant-test123');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('API key expired');
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should require biometric when specified', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
      mockValidator.validateCredential.mockResolvedValue({
        isValid: true,
        message: 'Valid',
      });

      const result = await storage.store('github', 'ghp_' + 'a'.repeat(36), {
        requireBiometric: true,
      });

      expect(result.isValid).toBe(true);
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalled();
    });

    it('should reject when biometric fails', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await storage.store('github', 'ghp_' + 'a'.repeat(36), {
        requireBiometric: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Biometric authentication failed');
    });

    it('should handle SecureStore write errors', async () => {
      mockValidator.validateCredential.mockResolvedValue({
        isValid: true,
        message: 'Valid',
      });
      mockSecureStore.setItemAsync.mockRejectedValueOnce(new Error('Storage full'));

      const result = await storage.store('openai', 'sk-test123');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Storage full');
    });
  });

  describe('retrieve', () => {
    it('should retrieve a stored credential', async () => {
      const payload = JSON.stringify({
        secret: 'sk-ant-test123',
        storedAt: '2025-01-01T00:00:00Z',
        type: 'anthropic',
      });
      mockSecureStore.getItemAsync.mockResolvedValue(payload);

      const result = await storage.retrieve('anthropic');

      expect(result.secret).toBe('sk-ant-test123');
      expect(result.metadata?.storedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should return null secret when not stored', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await storage.retrieve('github');

      expect(result.secret).toBeNull();
    });

    it('should require biometric when specified', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
      mockSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({ secret: 'test', storedAt: 'now', type: 'github' })
      );

      const result = await storage.retrieve('github', { requireBiometric: true });

      expect(result.secret).toBe('test');
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalled();
    });

    it('should return null when biometric fails', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await storage.retrieve('github', { requireBiometric: true });

      expect(result.secret).toBeNull();
    });

    it('should handle SecureStore read errors', async () => {
      mockSecureStore.getItemAsync.mockRejectedValueOnce(new Error('Access denied'));

      const result = await storage.retrieve('anthropic');

      expect(result.secret).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a credential', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const result = await storage.delete('github');

      expect(result).toBe(true);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('thumbcode_cred_github');
    });

    it('should return false on delete error', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValueOnce(new Error('Failed'));

      const result = await storage.delete('github');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when credential exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('some-value');

      const result = await storage.exists('anthropic');

      expect(result).toBe(true);
    });

    it('should return false when credential does not exist', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await storage.exists('openai');

      expect(result).toBe(false);
    });
  });

  describe('isBiometricAvailable', () => {
    it('should return true when hardware and enrollment are available', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await storage.isBiometricAvailable();

      expect(result).toBe(true);
    });

    it('should return false when no hardware', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await storage.isBiometricAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getStoredCredentialTypes', () => {
    it('should return types of stored credentials', async () => {
      mockSecureStore.getItemAsync.mockImplementation(async (key: string) => {
        if (key === 'thumbcode_cred_github' || key === 'thumbcode_cred_anthropic') {
          return 'value';
        }
        return null;
      });

      const types = await storage.getStoredCredentialTypes();

      expect(types).toContain('github');
      expect(types).toContain('anthropic');
      expect(types).not.toContain('openai');
    });
  });
});
