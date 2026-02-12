/**
 * Credential System Type Definitions
 */

export type CredentialType =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'anthropic'
  | 'openai'
  | 'mcp_server';

export interface Credential {
  id: string;
  type: CredentialType;
  name: string;
  isValid: boolean;
  lastValidated?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface GitHubCredential extends Credential {
  type: 'github';
  username: string;
  accessToken: string; // Stored in SecureStore
  scopes: string[];
}

export interface AnthropicCredential extends Credential {
  type: 'anthropic';
  apiKey: string; // Stored in SecureStore
  organizationId?: string;
}

export interface OpenAICredential extends Credential {
  type: 'openai';
  apiKey: string; // Stored in SecureStore
  organizationId?: string;
}

export interface MCPServerCredential extends Credential {
  type: 'mcp_server';
  serverUrl: string;
  authToken?: string; // Stored in SecureStore
  capabilities: string[];
}
