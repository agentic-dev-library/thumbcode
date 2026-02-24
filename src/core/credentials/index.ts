/**
 * Credential Service Exports
 *
 * Provides secure credential management using Expo SecureStore.
 *
 * Usage:
 * ```typescript
 * import { CredentialService } from '@thumbcode/core/credentials';
 *
 * // Store a credential
 * await CredentialService.store('github', token);
 *
 * // Retrieve a credential
 * const { secret } = await CredentialService.retrieve('github');
 *
 * // Validate a credential
 * const result = await CredentialService.validateCredential('github', token);
 * ```
 */

export { CredentialService } from './CredentialService';
export { KeyStorage } from './KeyStorage';
export { KeyValidator } from './KeyValidator';
// Types
export type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  SecureCredential,
  StoreOptions,
  ValidationResult,
} from './types';
// Validation utilities
export { validateAnthropicKey, validateGitHubToken } from './validation';
