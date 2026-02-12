/**
 * Key Storage
 *
 * Handles secure credential storage and retrieval using Capacitor Secure Storage
 * with hardware-backed encryption. Includes biometric authentication support.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
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
import type { KeyValidator } from './KeyValidator';

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

export class KeyStorage {
  constructor(private validator: KeyValidator) {}

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  /**
   * Get the available biometric authentication types
   */
  async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  }

  /**
   * Perform biometric authentication
   */
  async authenticateWithBiometrics(
    promptMessage = 'Authenticate to access your credentials'
  ): Promise<BiometricResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
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
    if (requireBiometric) {
      const biometricResult = await this.authenticateWithBiometrics();
      if (!biometricResult.success) {
        return { isValid: false, message: 'Biometric authentication failed' };
      }
    }

    // Validate the credential before storing (unless skipped)
    if (!skipValidation) {
      const validation = await this.validator.validateCredential(type, secret);
      if (!validation.isValid) {
        return validation;
      }
    }

    // Store the secret in Capacitor Secure Storage
    const key = SECURE_STORE_KEYS[type];
    try {
      const payload: SecureCredential = {
        secret,
        storedAt: new Date().toISOString(),
        type,
      };

      await SecureStoragePlugin.set({ key, value: JSON.stringify(payload) });

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
      const result = await SecureStoragePlugin.get({ key });
      const payload = result.value;

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
      await SecureStoragePlugin.remove({ key });
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
      const result = await SecureStoragePlugin.get({ key });
      return result.value !== null && result.value !== undefined;
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
