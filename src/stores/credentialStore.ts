/**
 * Credential Store
 *
 * Manages credential METADATA only - not actual secrets.
 * Actual secrets (API keys, tokens) are stored in Expo SecureStore.
 * This store tracks which credentials exist and their status.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Supported credential providers
export type CredentialProvider = 'anthropic' | 'openai' | 'github' | 'custom';

// Credential status
export type CredentialStatus = 'valid' | 'invalid' | 'expired' | 'unknown';

// Credential metadata (NOT the actual secret)
export interface CredentialMetadata {
  id: string;
  provider: CredentialProvider;
  name: string;
  // SecureStore key where the actual credential is stored
  secureStoreKey: string;
  status: CredentialStatus;
  lastValidatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  // For display purposes only - partial masked value
  maskedValue?: string;
  // Additional provider-specific metadata
  metadata?: {
    // GitHub specific
    scopes?: string[];
    username?: string;
    // API specific
    rateLimit?: number;
    remainingCalls?: number;
  };
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  expiresAt?: string;
  metadata?: CredentialMetadata['metadata'];
}

interface CredentialState {
  // State
  credentials: CredentialMetadata[];
  isValidating: boolean;
  lastError: string | null;

  // Actions
  addCredential: (credential: Omit<CredentialMetadata, 'id' | 'createdAt' | 'status'>) => string;
  removeCredential: (credentialId: string) => void;
  updateCredential: (credentialId: string, updates: Partial<CredentialMetadata>) => void;

  // Validation actions
  setCredentialStatus: (credentialId: string, status: CredentialStatus) => void;
  setValidationResult: (credentialId: string, result: ValidationResult) => void;
  setValidating: (isValidating: boolean) => void;

  // Query actions
  getCredentialByProvider: (provider: CredentialProvider) => CredentialMetadata | undefined;
  getCredentialById: (credentialId: string) => CredentialMetadata | undefined;
  hasValidCredential: (provider: CredentialProvider) => boolean;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Bulk operations
  clearAllCredentials: () => void;
  invalidateAll: () => void;
}

export const useCredentialStore = create<CredentialState>()(
  devtools(
    persist(
      immer((set, get) => ({
        credentials: [],
        isValidating: false,
        lastError: null,

        addCredential: (credential) => {
          const credentialId = `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          set((state) => {
            // Remove existing credential for same provider if it exists
            state.credentials = state.credentials.filter((c) => c.provider !== credential.provider);
            state.credentials.push({
              ...credential,
              id: credentialId,
              createdAt: new Date().toISOString(),
              status: 'unknown',
            });
          });
          return credentialId;
        },

        removeCredential: (credentialId) =>
          set((state) => {
            state.credentials = state.credentials.filter((c) => c.id !== credentialId);
          }),

        updateCredential: (credentialId, updates) =>
          set((state) => {
            const credential = state.credentials.find((c) => c.id === credentialId);
            if (credential) {
              Object.assign(credential, updates);
            }
          }),

        setCredentialStatus: (credentialId, status) =>
          set((state) => {
            const credential = state.credentials.find((c) => c.id === credentialId);
            if (credential) {
              credential.status = status;
              if (status === 'valid') {
                credential.lastValidatedAt = new Date().toISOString();
              }
            }
          }),

        setValidationResult: (credentialId, result) =>
          set((state) => {
            const credential = state.credentials.find((c) => c.id === credentialId);
            if (credential) {
              credential.status = result.isValid ? 'valid' : 'invalid';
              credential.lastValidatedAt = new Date().toISOString();
              if (result.expiresAt) {
                credential.expiresAt = result.expiresAt;
              }
              if (result.metadata) {
                credential.metadata = { ...credential.metadata, ...result.metadata };
              }
            }
          }),

        setValidating: (isValidating) =>
          set((state) => {
            state.isValidating = isValidating;
          }),

        getCredentialByProvider: (provider) => {
          return get().credentials.find((c) => c.provider === provider);
        },

        getCredentialById: (credentialId) => {
          return get().credentials.find((c) => c.id === credentialId);
        },

        hasValidCredential: (provider) => {
          const credential = get().credentials.find((c) => c.provider === provider);
          return credential?.status === 'valid';
        },

        setError: (error) =>
          set((state) => {
            state.lastError = error;
          }),

        clearError: () =>
          set((state) => {
            state.lastError = null;
          }),

        clearAllCredentials: () =>
          set((state) => {
            state.credentials = [];
          }),

        invalidateAll: () =>
          set((state) => {
            state.credentials.forEach((credential) => {
              credential.status = 'unknown';
            });
          }),
      })),
      {
        name: 'thumbcode-credential-metadata',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'CredentialStore' }
  )
);

// Selectors for optimal re-renders
export const selectCredentials = (state: CredentialState) => state.credentials;
export const selectCredentialByProvider =
  (provider: CredentialProvider) => (state: CredentialState) =>
    state.credentials.find((c) => c.provider === provider);
export const selectValidCredentials = (state: CredentialState) =>
  state.credentials.filter((c) => c.status === 'valid');
export const selectInvalidCredentials = (state: CredentialState) =>
  state.credentials.filter((c) => c.status === 'invalid' || c.status === 'expired');
export const selectIsValidating = (state: CredentialState) => state.isValidating;
export const selectHasGitHubCredential = (state: CredentialState) =>
  state.credentials.some((c) => c.provider === 'github' && c.status === 'valid');
export const selectHasAICredential = (state: CredentialState) =>
  state.credentials.some(
    (c) => (c.provider === 'anthropic' || c.provider === 'openai') && c.status === 'valid'
  );
export const selectCredentialsNeedingValidation = (state: CredentialState) =>
  state.credentials.filter((c) => c.status === 'unknown');
