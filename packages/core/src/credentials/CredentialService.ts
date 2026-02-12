/**
 * Credential Service
 *
 * Coordinates credential modules for secure key management:
 * - KeyValidator: API key validation against provider endpoints
 * - KeyStorage: secure storage, retrieval, biometric auth
 */

import type * as LocalAuthentication from 'expo-local-authentication';
import { KeyStorage } from './KeyStorage';
import { KeyValidator } from './KeyValidator';
import type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  StoreOptions,
  ValidationResult,
} from './types';

class CredentialServiceClass {
  private validator: KeyValidator;
  private storage: KeyStorage;

  constructor() {
    this.validator = new KeyValidator();
    this.storage = new KeyStorage(this.validator);
  }

  // Biometric authentication (delegated to KeyStorage)
  async isBiometricAvailable(): Promise<boolean> {
    return this.storage.isBiometricAvailable();
  }

  async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return this.storage.getBiometricTypes();
  }

  async authenticateWithBiometrics(promptMessage?: string): Promise<BiometricResult> {
    return this.storage.authenticateWithBiometrics(promptMessage);
  }

  // Storage operations (delegated to KeyStorage)
  async store(
    type: CredentialType,
    secret: string,
    options: StoreOptions = {}
  ): Promise<ValidationResult> {
    return this.storage.store(type, secret, options);
  }

  async retrieve(type: CredentialType, options: RetrieveOptions = {}): Promise<RetrieveResult> {
    return this.storage.retrieve(type, options);
  }

  async delete(type: CredentialType): Promise<boolean> {
    return this.storage.delete(type);
  }

  async exists(type: CredentialType): Promise<boolean> {
    return this.storage.exists(type);
  }

  async getStoredCredentialTypes(): Promise<CredentialType[]> {
    return this.storage.getStoredCredentialTypes();
  }

  // Validation operations (delegated to KeyValidator)
  async validateCredential(type: CredentialType, secret: string): Promise<ValidationResult> {
    return this.validator.validateCredential(type, secret);
  }

  maskSecret(secret: string, type: CredentialType): string {
    return this.validator.maskSecret(secret, type);
  }

  async validateAllStored(): Promise<Map<CredentialType, ValidationResult>> {
    return this.storage.validateAllStored();
  }
}

// Export singleton instance
export const CredentialService = new CredentialServiceClass();
