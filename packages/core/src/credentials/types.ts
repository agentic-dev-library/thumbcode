/**
 * Credential Types
 *
 * Type definitions for credential management.
 */

/**
 * Supported credential providers
 */
export type CredentialType =
  | 'github'
  | 'anthropic'
  | 'openai'
  | 'gitlab'
  | 'bitbucket'
  | 'mcp_server'
  | 'mcp_signing_secret';

/**
 * Credential stored in SecureStore
 */
export interface SecureCredential {
  /** The actual secret value */
  secret: string;
  /** When the credential was stored */
  storedAt: string;
  /** Type of credential */
  type: CredentialType;
}

/**
 * Result of credential validation
 */
export interface ValidationResult {
  /** Whether the credential is valid */
  isValid: boolean;
  /** Human-readable message */
  message?: string;
  /** When the credential expires (if applicable) */
  expiresAt?: Date;
  /** Additional metadata from validation */
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
  /** Whether authentication succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of retrieving a credential
 */
export interface RetrieveResult {
  /** The secret value (null if not found) */
  secret: string | null;
  /** Additional metadata */
  metadata?: {
    storedAt: string;
    type: CredentialType;
  };
}
