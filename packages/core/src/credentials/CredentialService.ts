/**
 * Credential Service
 *
 * Provides secure credential management using Expo SecureStore with
 * hardware-backed encryption. This is a low-level service that handles
 * only secure storage and validation - no state management.
 *
 * Security Features:
 * - Hardware-backed secure enclave storage (SecureStore)
 * - Biometric authentication support
 * - Automatic token validation
 * - Secure deletion
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { secureFetch } from '../api/api';
import { validate } from './validation';

import type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  SecureCredential,
  StoreOptions,
  ValidationResult,
} from './types';

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

// Validation API endpoints
const VALIDATION_ENDPOINTS = {
  github: 'https://api.github.com/user',
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/models',
} as const;

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
   * @param secret - The secret value to store
   * @param options - Storage options
   * @returns Validation result
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
      const validation = await this.validateCredential(type, secret);
      if (!validation.isValid) {
        return validation;
      }
    }

    // Store the secret in SecureStore
    const key = SECURE_STORE_KEYS[type];
    try {
      const payload: SecureCredential = {
        secret,
        storedAt: new Date().toISOString(),
        type,
      };

      await SecureStore.setItemAsync(key, JSON.stringify(payload), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

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
      const payload = await SecureStore.getItemAsync(key);

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
    if (!validate(type, secret)) {
      return { isValid: false, message: 'Invalid credential format' };
    }

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
      const response = await secureFetch(VALIDATION_ENDPOINTS.github, {
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
          avatarUrl: user.avatar_url,
          name: user.name,
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
      const response = await secureFetch(VALIDATION_ENDPOINTS.anthropic, {
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
      const response = await secureFetch(VALIDATION_ENDPOINTS.openai, {
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
      await SecureStore.deleteItemAsync(key);
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
   * Get all stored credential types
   */
  async getStoredCredentialTypes(): Promise<CredentialType[]> {
    const stored: CredentialType[] = [];
    for (const type of Object.keys(SECURE_STORE_KEYS) as CredentialType[]) {
      if (await this.exists(type)) {
        stored.push(type);
      }
    }
    return stored;
  }

  /**
   * Mask a secret for display purposes
   */
  maskSecret(secret: string, type: CredentialType): string {
    if (!secret) return '';

    switch (type) {
      case 'github':
        // GitHub tokens: ghp_xxxx...
        if (
          secret.startsWith('ghp_') ||
          secret.startsWith('gho_') ||
          secret.startsWith('ghs_')
        ) {
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
   * Validate all stored credentials and return results
   */
  async validateAllStored(): Promise<Map<CredentialType, ValidationResult>> {
    const results = new Map<CredentialType, ValidationResult>();
    const storedTypes = await this.getStoredCredentialTypes();

    await Promise.all(
      storedTypes.map(async (type) => {
        const { secret } = await this.retrieve(type);
        if (secret) {
          const result = await this.validateCredential(type, secret);
          results.set(type, result);
        }
      })
    );

    return results;
  }
}

// Export singleton instance
export const CredentialService = new CredentialServiceClass();
