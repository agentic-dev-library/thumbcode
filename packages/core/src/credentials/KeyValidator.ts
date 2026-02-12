/**
 * Key Validator
 *
 * Validates API credentials against their respective provider endpoints.
 * Handles GitHub, Anthropic, and OpenAI key validation.
 */

import { secureFetch } from '../api/api';
import type { CredentialType, ValidationResult } from './types';
import { validate } from './validation';

// Validation API endpoints
const VALIDATION_ENDPOINTS = {
  github: 'https://api.github.com/user',
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/models',
} as const;

export class KeyValidator {
  /**
   * Validate a credential against its respective API
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

      if (response.status === 401) {
        return { isValid: false, message: 'Invalid Anthropic API key' };
      }

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
   * Mask a secret for display purposes
   */
  maskSecret(secret: string, type: CredentialType): string {
    if (!secret) return '';

    switch (type) {
      case 'github':
        if (
          secret.startsWith('ghp_') ||
          secret.startsWith('gho_') ||
          secret.startsWith('ghs_')
        ) {
          return `${secret.slice(0, 7)}...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      case 'anthropic':
        if (secret.startsWith('sk-ant-')) {
          return `sk-ant-...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      case 'openai':
        if (secret.startsWith('sk-')) {
          return `sk-...${secret.slice(-4)}`;
        }
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;

      default:
        return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
    }
  }
}
