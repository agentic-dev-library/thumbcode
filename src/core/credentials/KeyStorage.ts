/**
 * Key Storage
 *
 * Handles secure credential storage and retrieval using Capacitor Secure Storage
 * with hardware-backed encryption. Includes biometric authentication support.
 *
 * Falls back to encrypted sessionStorage for web environments with short TTL.
 */

import { BiometricAuth, type BiometryType } from '@aparajita/capacitor-biometric-auth';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import type { KeyValidator } from './KeyValidator';
import type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  SecureCredential,
  StoreOptions,
  ValidationResult,
} from './types';
import { validate } from './validation';

// SecureStore key prefixes for different credential types
const SECURE_STORE_KEYS: Record<CredentialType, string> = {
  github: 'thumbcode_cred_github',
  anthropic: 'thumbcode_cred_anthropic',
  openai: 'thumbcode_cred_openai',
  mcp_server: 'thumbcode_cred_mcp',
  gitlab: 'thumbcode_cred_gitlab',
  bitbucket: 'thumbcode_cred_bitbucket',
  mcp_signing_secret: 'thumbcode_cred_mcp_signing_secret',
};

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

// Helper to check for native platform
function isNativePlatform(): boolean {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform) {
    return window.Capacitor.isNativePlatform();
  }
  return false;
}

/**
 * Web Encryption Implementation (AES-GCM)
 *
 * Provides a minimal layer of obfuscation/encryption for web storage.
 * Note: This is NOT fully secure against a determined attacker with local access,
 * as the key is also stored in the browser. However, it prevents casual inspection.
 */
class WebEncryption {
  private static readonly KEY_STORAGE_KEY = 'thumbcode_web_ek';
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  private static async getKey(): Promise<CryptoKey> {
    const storedKey = sessionStorage.getItem(WebEncryption.KEY_STORAGE_KEY);

    if (storedKey) {
      // Import existing key
      const keyData = JSON.parse(storedKey);
      return crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: WebEncryption.ALGORITHM, length: WebEncryption.KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
      );
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: WebEncryption.ALGORITHM, length: WebEncryption.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store key
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    sessionStorage.setItem(WebEncryption.KEY_STORAGE_KEY, JSON.stringify(exportedKey));

    return key;
  }

  static async encrypt(data: string): Promise<string> {
    const key = await WebEncryption.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedContent = await crypto.subtle.encrypt(
      { name: WebEncryption.ALGORITHM, iv },
      key,
      encodedData
    );

    const encryptedArray = Array.from(new Uint8Array(encryptedContent));
    const ivArray = Array.from(iv);

    return JSON.stringify({
      iv: ivArray,
      data: encryptedArray,
    });
  }

  static async decrypt(encryptedString: string): Promise<string | null> {
    try {
      const { iv, data } = JSON.parse(encryptedString);
      const key = await WebEncryption.getKey();

      const decryptedContent = await crypto.subtle.decrypt(
        { name: WebEncryption.ALGORITHM, iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedContent);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

export class KeyStorage {
  constructor(private validator: KeyValidator) {}

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (!isNativePlatform()) {
      return false;
    }
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  }

  /**
   * Get the available biometric authentication types
   */
  async getBiometricTypes(): Promise<BiometryType[]> {
    if (!isNativePlatform()) {
      return [];
    }
    const result = await BiometricAuth.checkBiometry();
    // Return array with the detected biometry type, or empty if none
    return result.isAvailable ? [result.biometryType] : [];
  }

  /**
   * Perform biometric authentication
   */
  async authenticateWithBiometrics(
    promptMessage = 'Authenticate to access your credentials'
  ): Promise<BiometricResult> {
    if (!isNativePlatform()) {
      return { success: false, error: 'Biometric authentication is not supported on web' };
    }

    try {
      await BiometricAuth.authenticate({
        reason: promptMessage,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
      });

      // If authenticate resolves without throwing, auth succeeded
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Biometric authentication failed',
      };
    }
  }

  /**
   * Store a credential securely
   */
  async store(
    type: CredentialType,
    secret: string,
    options: StoreOptions = {}
  ): Promise<ValidationResult> {
    const { requireBiometric = false, skipValidation = false } = options;

    if (!validate(type, secret)) {
      return { isValid: false, message: 'Invalid credential format' };
    }

    // Biometric check if required
    // On web, if requireBiometric is true, this will fail because authenticateWithBiometrics returns false
    if (requireBiometric) {
      const biometricResult = await this.authenticateWithBiometrics();
      if (!biometricResult.success) {
        return {
          isValid: false,
          message: biometricResult.error || 'Biometric authentication failed',
        };
      }
    }

    // Validate the credential before storing (unless skipped)
    if (!skipValidation) {
      const validation = await this.validator.validateCredential(type, secret);
      if (!validation.isValid) {
        return validation;
      }
    }

    const key = SECURE_STORE_KEYS[type];
    const payload: SecureCredential = {
      secret,
      storedAt: new Date().toISOString(),
      type,
    };
    const value = JSON.stringify(payload);

    try {
      if (isNativePlatform()) {
        await SecureStoragePlugin.set({ key, value });
      } else {
        // Encrypt before storing in sessionStorage
        try {
          const encryptedValue = await WebEncryption.encrypt(value);
          sessionStorage.setItem(key, encryptedValue);
        } catch (_e) {
          // Handle quota exceeded or private mode restrictions
          return {
            isValid: false,
            message: 'Failed to store in session storage (Storage full or restricted)',
          };
        }
      }

      return { isValid: true, message: 'Credential stored successfully' };
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'Failed to store credential',
      };
    }
  }

  /**
   * Retrieve a credential securely
   */
  async retrieve(type: CredentialType, options: RetrieveOptions = {}): Promise<RetrieveResult> {
    const { requireBiometric = false } = options;

    // Biometric check if required
    if (requireBiometric) {
      const biometricResult = await this.authenticateWithBiometrics();
      if (!biometricResult.success) {
        return { secret: null };
      }
    }

    try {
      const key = SECURE_STORE_KEYS[type];
      let payload: string | null = null;

      if (isNativePlatform()) {
        const result = await SecureStoragePlugin.get({ key });
        payload = result.value;
      } else {
        try {
          const encryptedValue = sessionStorage.getItem(key);
          if (encryptedValue) {
            payload = await WebEncryption.decrypt(encryptedValue);
          }
        } catch (e) {
          console.error('Failed to access session storage:', e);
          return { secret: null };
        }
      }

      if (!payload) {
        return { secret: null };
      }

      const data: SecureCredential = JSON.parse(payload);

      return {
        secret: data.secret,
        metadata: {
          storedAt: data.storedAt,
          type: data.type,
        },
      };
    } catch (error) {
      // SecureStoragePlugin.get throws when key is not found
      console.error('Failed to retrieve credential:', error);
      return { secret: null };
    }
  }

  /**
   * Delete a credential securely
   */
  async delete(type: CredentialType): Promise<boolean> {
    try {
      const key = SECURE_STORE_KEYS[type];
      if (isNativePlatform()) {
        await SecureStoragePlugin.remove({ key });
      } else {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.error('Failed to remove from session storage:', e);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  }

  /**
   * Check if a credential exists
   */
  async exists(type: CredentialType): Promise<boolean> {
    try {
      const key = SECURE_STORE_KEYS[type];
      if (isNativePlatform()) {
        const result = await SecureStoragePlugin.get({ key });
        return result.value !== null && result.value !== undefined;
      } else {
        try {
          return sessionStorage.getItem(key) !== null;
        } catch {
          return false;
        }
      }
    } catch {
      // SecureStoragePlugin.get throws when key is not found
      return false;
    }
  }

  /**
   * Get all stored credential types
   */
  async getStoredCredentialTypes(): Promise<CredentialType[]> {
    const types = Object.keys(SECURE_STORE_KEYS) as CredentialType[];
    const results = await Promise.all(types.map((type) => this.exists(type)));
    return types.filter((_, index) => results[index]);
  }

  /**
   * Validate all stored credentials and return results
   */
  async validateAllStored(): Promise<Map<CredentialType, ValidationResult>> {
    const results = new Map<CredentialType, ValidationResult>();
    const storedTypes = await this.getStoredCredentialTypes();

    await Promise.all(
      storedTypes.map(async (type) => {
        const { secret } = await this.retrieve(type);
        if (secret) {
          const result = await this.validator.validateCredential(type, secret);
          results.set(type, result);
        }
      })
    );

    return results;
  }
}
