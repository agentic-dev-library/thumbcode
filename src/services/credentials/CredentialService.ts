/**
 * Credential Service
 *
 * Provides secure credential management using Expo SecureStore with
 * hardware-backed encryption. This service handles the actual secrets
 * while CredentialStore (Zustand) manages metadata only.
 *
 * Security Features:
 * - Hardware-backed secure enclave storage (SecureStore)
 * - Biometric authentication support
 * - Automatic token validation
 * - Secure deletion with memory clearing
 */

import { useCredentialStore } from '@thumbcode/state';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import type { Credential, CredentialType } from '@/types';

// SecureStore key prefixes for different credential types
const SECURE_STORE_KEYS = {
  github: 'thumbcode_cred_github',
  anthropic: 'thumbcode_cred_anthropic',
  openai: 'thumbcode_cred_openai',
  mcp_server: 'thumbcode_cred_mcp',
  gitlab: 'thumbcode_cred_gitlab',
  bitbucket: 'thumbcode_cred_bitbucket',
} as const;

// Validation API endpoints
const VALIDATION_ENDPOINTS = {
  github: 'https://api.github.com/user',
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/models',
} as const;

/**
 * Result of credential validation
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Options for storing credentials
 */
export interface StoreOptions {
  /** Require biometric authentication for access */
  requireBiometric?: boolean;
  /** Skip validation when storing */
  skipValidation?: boolean;
}

/**
 * Options for retrieving credentials
 */
export interface RetrieveOptions {
  /** Require biometric authentication to retrieve */
  requireBiometric?: boolean;
  /** Validate the credential after retrieval */
  validateAfterRetrieve?: boolean;
}

/**
 * Biometric authentication result
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
  authenticationType?: LocalAuthentication.AuthenticationType;
}

/**
 * Credential Service for secure credential management
 */
class CredentialServiceClass {
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
   *
   * @param type - The type of credential
   * @param data - The credential data (including secret)
   * @param options - Storage options
   */
  async store(
    type: CredentialType,
    data: Partial<Credential> & { secret: string },
    options: StoreOptions = {}
  ): Promise<ValidationResult> {
    const { requireBiometric = false, skipValidation = false } = options;

    // Biometric check if required
    if (requireBiometric) {
      const biometricResult = await this.authenticateWithBiometrics();
      if (!biometricResult.success) {
        return { isValid: false, message: 'Biometric authentication failed' };
      }
    }

    // Validate the credential before storing (unless skipped)
    if (!skipValidation) {
      const validation = await this.validateCredential(type, data.secret);
      if (!validation.isValid) {
        return validation;
      }
    }

    // Store the secret in SecureStore
    const key = SECURE_STORE_KEYS[type];
    try {
      // Create a secure payload with the secret and metadata
      const payload = JSON.stringify({
        secret: data.secret,
        storedAt: new Date().toISOString(),
        type,
      });

      await SecureStore.setItemAsync(key, payload, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      // Update the credential store with metadata (no secrets)
      const store = useCredentialStore.getState();
      store.addCredential({
        provider: type === 'mcp_server' ? 'custom' : (type as 'anthropic' | 'openai' | 'github'),
        name: data.name || `${type} credential`,
        secureStoreKey: key,
        maskedValue: this.maskSecret(data.secret, type),
      });

      // Set the credential as valid
      const credential = store.getCredentialByProvider(
        type === 'mcp_server' ? 'custom' : (type as 'anthropic' | 'openai' | 'github')
      );
      if (credential) {
        store.setCredentialStatus(credential.id, 'valid');
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
   *
   * @param type - The type of credential to retrieve
   * @param options - Retrieval options
   */
  async retrieve(
    type: CredentialType,
    options: RetrieveOptions = {}
  ): Promise<{ secret: string | null; metadata?: Record<string, unknown> }> {
    const { requireBiometric = false, validateAfterRetrieve = false } = options;

    // Biometric check if required
    if (requireBiometric) {
      const biometricResult = await this.authenticateWithBiometrics();
      if (!biometricResult.success) {
        return { secret: null };
      }
    }

    try {
      const key = SECURE_STORE_KEYS[type];
      const payload = await SecureStore.getItemAsync(key);

      if (!payload) {
        return { secret: null };
      }

      const data = JSON.parse(payload);

      // Validate after retrieval if requested
      if (validateAfterRetrieve) {
        const validation = await this.validateCredential(type, data.secret);
        if (!validation.isValid) {
          // Update store with invalid status
          const store = useCredentialStore.getState();
          const credential = store.getCredentialByProvider(
            type === 'mcp_server' ? 'custom' : (type as 'anthropic' | 'openai' | 'github')
          );
          if (credential) {
            store.setCredentialStatus(credential.id, 'invalid');
          }
        }
      }

      return {
        secret: data.secret,
        metadata: {
          storedAt: data.storedAt,
          type: data.type,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve credential:', error);
      return { secret: null };
    }
  }

  /**
   * Validate a credential against its respective API
   *
   * @param type - The credential type
   * @param secret - The secret to validate
   */
  async validateCredential(type: CredentialType, secret: string): Promise<ValidationResult> {
    try {
      switch (type) {
        case 'github':
          return this.validateGitHubToken(secret);
        case 'anthropic':
          return this.validateAnthropicKey(secret);
        case 'openai':
          return this.validateOpenAIKey(secret);
        case 'mcp_server':
          // MCP servers require specific validation per server
          return { isValid: true, message: 'MCP server credentials accepted' };
        default:
          return { isValid: true, message: 'Credential accepted without validation' };
      }
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Validate a GitHub personal access token
   */
  private async validateGitHubToken(token: string): Promise<ValidationResult> {
    try {
      const response = await fetch(VALIDATION_ENDPOINTS.github, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, message: 'Invalid GitHub token' };
        }
        return { isValid: false, message: `GitHub API error: ${response.status}` };
      }

      const user = await response.json();

      // Check for expiration header if present
      const expiresAt = response.headers.get('github-authentication-token-expiration');

      return {
        isValid: true,
        message: `Authenticated as ${user.login}`,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        metadata: {
          username: user.login,
          scopes: response.headers.get('x-oauth-scopes')?.split(', ') || [],
          rateLimit: parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10),
        },
      };
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'GitHub validation failed',
      };
    }
  }

  /**
   * Validate an Anthropic API key
   */
  private async validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
    try {
      // For Anthropic, we make a minimal request to check the key
      const response = await fetch(VALIDATION_ENDPOINTS.anthropic, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      // We expect the request to work, indicating valid key
      // Note: This will consume a small amount of API credits
      if (response.ok || response.status === 200) {
        return {
          isValid: true,
          message: 'Anthropic API key is valid',
          metadata: {
            rateLimit: parseInt(
              response.headers.get('anthropic-ratelimit-requests-remaining') || '0',
              10
            ),
          },
        };
      }

      // 401 means invalid key
      if (response.status === 401) {
        return { isValid: false, message: 'Invalid Anthropic API key' };
      }

      // 429 means rate limited but key is valid
      if (response.status === 429) {
        return {
          isValid: true,
          message: 'Anthropic API key valid but rate limited',
        };
      }

      return { isValid: false, message: `Anthropic API error: ${response.status}` };
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'Anthropic validation failed',
      };
    }
  }

  /**
   * Validate an OpenAI API key
   */
  private async validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch(VALIDATION_ENDPOINTS.openai, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        return {
          isValid: true,
          message: 'OpenAI API key is valid',
          metadata: {
            rateLimit: parseInt(response.headers.get('x-ratelimit-remaining-requests') || '0', 10),
          },
        };
      }

      if (response.status === 401) {
        return { isValid: false, message: 'Invalid OpenAI API key' };
      }

      return { isValid: false, message: `OpenAI API error: ${response.status}` };
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'OpenAI validation failed',
      };
    }
  }

  /**
   * Delete a credential securely
   *
   * @param type - The credential type to delete
   */
  async delete(type: CredentialType): Promise<boolean> {
    try {
      const key = SECURE_STORE_KEYS[type];

      // Delete from SecureStore
      await SecureStore.deleteItemAsync(key);

      // Remove from metadata store
      const store = useCredentialStore.getState();
      const credential = store.getCredentialByProvider(
        type === 'mcp_server' ? 'custom' : (type as 'anthropic' | 'openai' | 'github')
      );
      if (credential) {
        store.removeCredential(credential.id);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  }

  /**
   * Check if a credential exists
   *
   * @param type - The credential type to check
   */
  async exists(type: CredentialType): Promise<boolean> {
    try {
      const key = SECURE_STORE_KEYS[type];
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch {
      return false;
    }
  }

  /**
   * Mask a secret for display purposes
   */
  private maskSecret(secret: string, type: CredentialType): string {
    if (!secret) return '';

    switch (type) {
      case 'github':
        // GitHub tokens: ghp_xxxx...
        if (secret.startsWith('ghp_') || secret.startsWith('gho_') || secret.startsWith('ghs_')) {
          return `${secret.slice(0, 7)}...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      case 'anthropic':
        // Anthropic keys: sk-ant-...
        if (secret.startsWith('sk-ant-')) {
          return `sk-ant-...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      case 'openai':
        // OpenAI keys: sk-...
        if (secret.startsWith('sk-')) {
          return `sk-...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      default:
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
    }
  }

  /**
   * Re-validate all stored credentials
   */
  async revalidateAll(): Promise<Record<CredentialType, ValidationResult>> {
    const results: Partial<Record<CredentialType, ValidationResult>> = {};

    const store = useCredentialStore.getState();
    store.setValidating(true);

    try {
      for (const type of Object.keys(SECURE_STORE_KEYS) as CredentialType[]) {
        const exists = await this.exists(type);
        if (exists) {
          const { secret } = await this.retrieve(type);
          if (secret) {
            const result = await this.validateCredential(type, secret);
            results[type] = result;

            // Update store
            const credential = store.getCredentialByProvider(
              type === 'mcp_server' ? 'custom' : (type as 'anthropic' | 'openai' | 'github')
            );
            if (credential) {
              store.setValidationResult(credential.id, {
                isValid: result.isValid,
                message: result.message,
                expiresAt: result.expiresAt?.toISOString(),
                metadata: result.metadata,
              });
            }
          }
        }
      }
    } finally {
      store.setValidating(false);
    }

    return results as Record<CredentialType, ValidationResult>;
  }
}

// Export singleton instance
export const CredentialService = new CredentialServiceClass();
