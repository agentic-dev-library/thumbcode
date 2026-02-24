/**
 * Credential Type Definitions
 *
 * Types for credential management across the application.
 */

/**
 * Supported credential providers
 */
export type CredentialType =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'anthropic'
  | 'openai'
  | 'mcp_server';

/**
 * Credential provider category
 */
export type CredentialProvider = 'github' | 'anthropic' | 'openai' | 'custom';

/**
 * Base credential interface (metadata only - secrets stored in SecureStore)
 */
export interface Credential {
  id: string;
  type: CredentialType;
  provider: CredentialProvider;
  name: string;
  /** Key used to retrieve the actual secret from SecureStore */
  secureStoreKey: string;
  /** Masked version of the secret for display */
  maskedValue: string;
  isValid: boolean;
  status: CredentialStatus;
  lastValidated?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Credential validation status
 */
export type CredentialStatus = 'pending' | 'valid' | 'invalid' | 'expired' | 'validating';

/**
 * GitHub specific credential metadata
 */
export interface GitHubCredentialMeta extends Credential {
  type: 'github';
  provider: 'github';
  username?: string;
  scopes?: string[];
  avatarUrl?: string;
}

/**
 * Anthropic specific credential metadata
 */
export interface AnthropicCredentialMeta extends Credential {
  type: 'anthropic';
  provider: 'anthropic';
  organizationId?: string;
}

/**
 * OpenAI specific credential metadata
 */
export interface OpenAICredentialMeta extends Credential {
  type: 'openai';
  provider: 'openai';
  organizationId?: string;
}

/**
 * MCP Server credential metadata
 */
export interface MCPServerCredentialMeta extends Credential {
  type: 'mcp_server';
  provider: 'custom';
  serverUrl: string;
  capabilities: string[];
}

/**
 * Union of all credential metadata types
 */
export type CredentialMeta =
  | GitHubCredentialMeta
  | AnthropicCredentialMeta
  | OpenAICredentialMeta
  | MCPServerCredentialMeta;

/**
 * Result of credential validation
 */
export interface CredentialValidationResult {
  isValid: boolean;
  message?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}
