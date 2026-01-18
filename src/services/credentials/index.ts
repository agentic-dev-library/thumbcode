/**
 * Credentials Service Exports
 *
 * Provides secure credential management for ThumbCode.
 *
 * Usage:
 * ```typescript
 * import { CredentialService } from '@/services/credentials';
 *
 * // Store a GitHub token
 * await CredentialService.store('github', {
 *   name: 'My GitHub Token',
 *   secret: 'ghp_xxxxxxxxxxxx',
 * });
 *
 * // Retrieve with biometric auth
 * const { secret } = await CredentialService.retrieve('github', {
 *   requireBiometric: true,
 * });
 *
 * // Validate all credentials
 * const results = await CredentialService.revalidateAll();
 * ```
 */

export {
  type BiometricResult,
  CredentialService,
  type RetrieveOptions,
  type StoreOptions,
  type ValidationResult,
} from './CredentialService';
