/**
 * KeyStorage Tests
 *
 * Tests for secure credential storage and retrieval using Capacitor Secure Storage
 * and @aparajita/capacitor-biometric-auth.
 */

import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { afterEach, beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

import { KeyStorage } from '../KeyStorage';
import type { KeyValidator } from '../KeyValidator';

const mockValidator: Mocked<KeyValidator> = {
  validateCredential: vi.fn(),
  maskSecret: vi.fn(),
} as any;

const mockSecureStorage = SecureStoragePlugin as Mocked<typeof SecureStoragePlugin>;
const mockBiometricAuth = BiometricAuth as Mocked<typeof BiometricAuth>;

describe('KeyStorage', () => {
  let storage: KeyStorage;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Native Environment', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => true,
        },
      });
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
        expect(mockSecureStorage.set).toHaveBeenCalledWith({
          key: 'thumbcode_cred_anthropic',
          value: expect.any(String),
        });
      });

      it('should reject invalid format', async () => {
        const result = await storage.store('anthropic', 'invalid-key');

        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Invalid credential format');
        expect(mockSecureStorage.set).not.toHaveBeenCalled();
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
        expect(mockSecureStorage.set).not.toHaveBeenCalled();
      });

      it('should require biometric when specified', async () => {
        // BiometricAuth.authenticate resolves on success
        mockBiometricAuth.authenticate.mockResolvedValue(undefined);
        mockValidator.validateCredential.mockResolvedValue({
          isValid: true,
          message: 'Valid',
        });

        const result = await storage.store('github', 'ghp_' + 'a'.repeat(36), {
          requireBiometric: true,
        });

        expect(result.isValid).toBe(true);
        expect(mockBiometricAuth.authenticate).toHaveBeenCalled();
      });

      it('should reject when biometric fails', async () => {
        // BiometricAuth.authenticate throws on failure
        mockBiometricAuth.authenticate.mockRejectedValue(new Error('user_cancel'));

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
        mockSecureStorage.set.mockRejectedValueOnce(new Error('Storage full'));

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
        mockSecureStorage.get.mockResolvedValue({ value: payload });

        const result = await storage.retrieve('anthropic');

        expect(result.secret).toBe('sk-ant-test123');
        expect(result.metadata?.storedAt).toBe('2025-01-01T00:00:00Z');
      });

      it('should return null secret when not stored', async () => {
        mockSecureStorage.get.mockRejectedValue(new Error('Key not found'));

        const result = await storage.retrieve('github');

        expect(result.secret).toBeNull();
      });

      it('should require biometric when specified', async () => {
        mockBiometricAuth.authenticate.mockResolvedValue(undefined);
        mockSecureStorage.get.mockResolvedValue({
          value: JSON.stringify({ secret: 'test', storedAt: 'now', type: 'github' }),
        });

        const result = await storage.retrieve('github', { requireBiometric: true });

        expect(result.secret).toBe('test');
        expect(mockBiometricAuth.authenticate).toHaveBeenCalled();
      });

      it('should return null when biometric fails', async () => {
        mockBiometricAuth.authenticate.mockRejectedValue(new Error('user_cancel'));

        const result = await storage.retrieve('github', { requireBiometric: true });

        expect(result.secret).toBeNull();
      });

      it('should handle SecureStore read errors', async () => {
        mockSecureStorage.get.mockRejectedValueOnce(new Error('Access denied'));

        const result = await storage.retrieve('anthropic');

        expect(result.secret).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete a credential', async () => {
        mockSecureStorage.remove.mockResolvedValue({ value: true });

        const result = await storage.delete('github');

        expect(result).toBe(true);
        expect(mockSecureStorage.remove).toHaveBeenCalledWith({ key: 'thumbcode_cred_github' });
      });

      it('should return false on delete error', async () => {
        mockSecureStorage.remove.mockRejectedValueOnce(new Error('Failed'));

        const result = await storage.delete('github');

        expect(result).toBe(false);
      });
    });

    describe('exists', () => {
      it('should return true when credential exists', async () => {
        mockSecureStorage.get.mockResolvedValue({ value: 'some-value' });

        const result = await storage.exists('anthropic');

        expect(result).toBe(true);
      });

      it('should return false when credential does not exist', async () => {
        mockSecureStorage.get.mockRejectedValue(new Error('Key not found'));

        const result = await storage.exists('openai');

        expect(result).toBe(false);
      });
    });

    describe('isBiometricAvailable', () => {
      it('should return true when biometry is available', async () => {
        mockBiometricAuth.checkBiometry.mockResolvedValue({
          isAvailable: true,
          biometryType: 1, // face ID
          reason: '',
          code: 0,
          strongBiometryIsAvailable: true,
          biometryTypes: [1],
        } as any);

        const result = await storage.isBiometricAvailable();

        expect(result).toBe(true);
      });

      it('should return false when biometry is not available', async () => {
        mockBiometricAuth.checkBiometry.mockResolvedValue({
          isAvailable: false,
          biometryType: 0,
          reason: 'No biometry available',
          code: 0,
          strongBiometryIsAvailable: false,
          biometryTypes: [],
        } as any);

        const result = await storage.isBiometricAvailable();

        expect(result).toBe(false);
      });
    });

    describe('getStoredCredentialTypes', () => {
      it('should return types of stored credentials', async () => {
        mockSecureStorage.get.mockImplementation(async ({ key }: { key: string }) => {
          if (key === 'thumbcode_cred_github' || key === 'thumbcode_cred_anthropic') {
            return { value: 'value' };
          }
          throw new Error('Key not found');
        });

        const types = await storage.getStoredCredentialTypes();

        expect(types).toContain('github');
        expect(types).toContain('anthropic');
        expect(types).not.toContain('openai');
      });
    });
  });

  describe('Web Environment', () => {
    let localStorageStore: Record<string, string>;

    beforeEach(() => {
      // Mock web environment (isNativePlatform = false)
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => false,
        },
      });

      // Mock localStorage
      localStorageStore = {};
      const localStorageMock = {
        getItem: vi.fn((key: string) => localStorageStore[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageStore[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageStore[key];
        }),
        clear: vi.fn(() => {
          localStorageStore = {};
        }),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      storage = new KeyStorage(mockValidator);
    });

    describe('store', () => {
      it('should store credential in localStorage', async () => {
        mockValidator.validateCredential.mockResolvedValue({
          isValid: true,
          message: 'Valid',
        });

        const result = await storage.store('anthropic', 'sk-ant-test123');

        expect(result.isValid).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'thumbcode_cred_anthropic',
          expect.stringContaining('sk-ant-test123')
        );
      });

      it('should NOT call SecureStoragePlugin', async () => {
        mockValidator.validateCredential.mockResolvedValue({
          isValid: true,
          message: 'Valid',
        });

        await storage.store('anthropic', 'sk-ant-test123');

        expect(mockSecureStorage.set).not.toHaveBeenCalled();
      });

      it('should succeed even if biometrics required (no-op on web)', async () => {
        mockValidator.validateCredential.mockResolvedValue({
          isValid: true,
          message: 'Valid',
        });

        const result = await storage.store('anthropic', 'sk-ant-test123', {
          requireBiometric: true,
        });

        expect(result.isValid).toBe(true);
        expect(mockBiometricAuth.authenticate).not.toHaveBeenCalled();
      });
    });

    describe('retrieve', () => {
      it('should retrieve credential from localStorage', async () => {
        const payload = JSON.stringify({
          secret: 'sk-ant-test123',
          storedAt: '2025-01-01T00:00:00Z',
          type: 'anthropic',
        });
        localStorageStore['thumbcode_cred_anthropic'] = payload;

        const result = await storage.retrieve('anthropic');

        expect(result.secret).toBe('sk-ant-test123');
        expect(localStorage.getItem).toHaveBeenCalledWith('thumbcode_cred_anthropic');
      });

      it('should return null if not in localStorage', async () => {
        const result = await storage.retrieve('anthropic');
        expect(result.secret).toBeNull();
      });
    });

    describe('delete', () => {
      it('should remove credential from localStorage', async () => {
        localStorageStore['thumbcode_cred_anthropic'] = 'some-value';

        const result = await storage.delete('anthropic');

        expect(result).toBe(true);
        expect(localStorage.removeItem).toHaveBeenCalledWith('thumbcode_cred_anthropic');
        expect(localStorageStore['thumbcode_cred_anthropic']).toBeUndefined();
      });
    });

    describe('exists', () => {
      it('should return true if key exists in localStorage', async () => {
        localStorageStore['thumbcode_cred_anthropic'] = 'some-value';

        const result = await storage.exists('anthropic');

        expect(result).toBe(true);
      });

      it('should return false if key does not exist in localStorage', async () => {
        const result = await storage.exists('anthropic');
        expect(result).toBe(false);
      });
    });

    describe('biometrics', () => {
        it('should report biometrics unavailable', async () => {
            const result = await storage.isBiometricAvailable();
            expect(result).toBe(false);
        });

        it('should return empty biometrics types', async () => {
            const result = await storage.getBiometricTypes();
            expect(result).toEqual([]);
        });
    });
  });
});
