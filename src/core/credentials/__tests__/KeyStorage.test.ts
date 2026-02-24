/**
 * KeyStorage Tests
 *
 * Tests for secure credential storage and retrieval using Capacitor Secure Storage
 * and @aparajita/capacitor-biometric-auth.
 */

import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { afterEach, beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import { KeyStorage } from '../KeyStorage';
import type { KeyValidator } from '../KeyValidator';

const mockValidator = {
  validateCredential: vi.fn(),
  maskSecret: vi.fn(),
} as unknown as Mocked<KeyValidator>;

const mockSecureStorage = SecureStoragePlugin as Mocked<typeof SecureStoragePlugin>;
const mockBiometricAuth = BiometricAuth as Mocked<typeof BiometricAuth>;

// Mock WebCrypto API for Node/JSDOM environment
const mockWebCrypto = {
  subtle: {
    generateKey: vi.fn().mockResolvedValue({} as CryptoKey),
    exportKey: vi.fn().mockResolvedValue({ k: 'mock-key', alg: 'A256GCM', ext: true, kty: 'oct' }),
    importKey: vi.fn().mockResolvedValue({} as CryptoKey),
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    decrypt: vi
      .fn()
      .mockResolvedValue(
        new TextEncoder().encode(
          '{"secret":"sk-ant-test123","storedAt":"2025-01-01T00:00:00Z","type":"anthropic"}'
        ).buffer
      ),
  },
  getRandomValues: vi.fn().mockReturnValue(new Uint8Array(12)),
};

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

        const result = await storage.store('github', `ghp_${'a'.repeat(36)}`, {
          requireBiometric: true,
        });

        expect(result.isValid).toBe(true);
        expect(mockBiometricAuth.authenticate).toHaveBeenCalled();
      });

      it('should reject when biometric fails', async () => {
        // BiometricAuth.authenticate throws on failure
        mockBiometricAuth.authenticate.mockRejectedValue(new Error('user_cancel'));

        const result = await storage.store('github', `ghp_${'a'.repeat(36)}`, {
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
        } as never);

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
        } as never);

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
    let sessionStorageStore: Record<string, string>;

    beforeEach(() => {
      // Mock web environment (isNativePlatform = false)
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => false,
        },
        crypto: mockWebCrypto,
      });

      // Also stub global crypto for Node environment
      vi.stubGlobal('crypto', mockWebCrypto);
      global.TextEncoder = TextEncoder;
      global.TextDecoder = TextDecoder;

      // Mock sessionStorage
      sessionStorageStore = {};
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => sessionStorageStore[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          sessionStorageStore[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete sessionStorageStore[key];
        }),
        clear: vi.fn(() => {
          sessionStorageStore = {};
        }),
      };
      vi.stubGlobal('sessionStorage', sessionStorageMock);

      storage = new KeyStorage(mockValidator);
    });

    describe('store', () => {
      it('should encrypt and store credential in sessionStorage', async () => {
        mockValidator.validateCredential.mockResolvedValue({
          isValid: true,
          message: 'Valid',
        });

        const result = await storage.store('anthropic', 'sk-ant-test123');

        expect(result.isValid).toBe(true);
        // Verify encryption was called
        expect(mockWebCrypto.subtle.encrypt).toHaveBeenCalled();
        // Verify storage set
        expect(sessionStorage.setItem).toHaveBeenCalledWith(
          'thumbcode_cred_anthropic',
          expect.any(String)
        );
        // Verify it's not storing plain text
        const storedValue = sessionStorageStore.thumbcode_cred_anthropic;
        expect(storedValue).not.toContain('sk-ant-test123');
      });

      it('should fail if biometric is required', async () => {
        const result = await storage.store('anthropic', 'sk-ant-test123', {
          requireBiometric: true,
        });

        expect(result.isValid).toBe(false);
        expect(result.message).toContain('Biometric authentication is not supported');
      });
    });

    describe('retrieve', () => {
      it('should retrieve and decrypt credential from sessionStorage', async () => {
        // Mock a stored encrypted value
        const encryptedPayload = JSON.stringify({
          iv: [1, 2, 3],
          data: [4, 5, 6],
        });
        sessionStorageStore.thumbcode_cred_anthropic = encryptedPayload;

        // Mock decrypt to return the specific payload for this test
        const decryptedPayload = JSON.stringify({
          secret: 'sk-ant-test123',
          storedAt: '2025-01-01T00:00:00Z',
          type: 'anthropic',
        });

        mockWebCrypto.subtle.decrypt.mockResolvedValueOnce(
          new TextEncoder().encode(decryptedPayload).buffer
        );

        const result = await storage.retrieve('anthropic');

        expect(result.secret).toBe('sk-ant-test123');
        expect(sessionStorage.getItem).toHaveBeenCalledWith('thumbcode_cred_anthropic');
        expect(mockWebCrypto.subtle.decrypt).toHaveBeenCalled();
      });

      it('should return null if not in sessionStorage', async () => {
        const result = await storage.retrieve('anthropic');
        expect(result.secret).toBeNull();
      });
    });

    describe('biometrics', () => {
      it('should report biometrics unavailable on web', async () => {
        const result = await storage.isBiometricAvailable();
        expect(result).toBe(false);
      });

      it('authenticateWithBiometrics should return failure on web', async () => {
        const result = await storage.authenticateWithBiometrics();
        expect(result.success).toBe(false);
        expect(result.error).toContain('not supported');
      });
    });
  });
});
