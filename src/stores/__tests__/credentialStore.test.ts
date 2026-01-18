/**
 * Credential Store Tests
 */

import { act, renderHook } from '@testing-library/react-native';
import {
  selectCredentialByProvider,
  selectCredentials,
  selectHasAICredential,
  selectHasGitHubCredential,
  selectInvalidCredentials,
  selectValidCredentials,
  useCredentialStore,
} from '../credentialStore';

// Reset store before each test
beforeEach(() => {
  useCredentialStore.setState({
    credentials: [],
    isValidating: false,
    lastError: null,
  });
});

describe('CredentialStore', () => {
  describe('addCredential', () => {
    it('should add a credential to the store', () => {
      const { result } = renderHook(() => useCredentialStore());

      act(() => {
        result.current.addCredential({
          provider: 'anthropic',
          name: 'Anthropic API Key',
          secureStoreKey: 'anthropic-api-key',
          maskedValue: 'sk-ant-****',
        });
      });

      expect(result.current.credentials).toHaveLength(1);
      expect(result.current.credentials[0].provider).toBe('anthropic');
      expect(result.current.credentials[0].status).toBe('unknown');
    });

    it('should replace existing credential for same provider', () => {
      const { result } = renderHook(() => useCredentialStore());

      act(() => {
        result.current.addCredential({
          provider: 'github',
          name: 'Old GitHub Token',
          secureStoreKey: 'github-token-old',
        });
      });

      expect(result.current.credentials).toHaveLength(1);

      act(() => {
        result.current.addCredential({
          provider: 'github',
          name: 'New GitHub Token',
          secureStoreKey: 'github-token-new',
        });
      });

      expect(result.current.credentials).toHaveLength(1);
      expect(result.current.credentials[0].name).toBe('New GitHub Token');
    });
  });

  describe('removeCredential', () => {
    it('should remove a credential by ID', () => {
      const { result } = renderHook(() => useCredentialStore());

      let credId: string;
      act(() => {
        credId = result.current.addCredential({
          provider: 'openai',
          name: 'OpenAI Key',
          secureStoreKey: 'openai-key',
        });
      });

      expect(result.current.credentials).toHaveLength(1);

      act(() => {
        result.current.removeCredential(credId!);
      });

      expect(result.current.credentials).toHaveLength(0);
    });
  });

  describe('setCredentialStatus', () => {
    it('should update credential status', () => {
      const { result } = renderHook(() => useCredentialStore());

      let credId: string;
      act(() => {
        credId = result.current.addCredential({
          provider: 'anthropic',
          name: 'Anthropic Key',
          secureStoreKey: 'anthropic-key',
        });
      });

      act(() => {
        result.current.setCredentialStatus(credId!, 'valid');
      });

      expect(result.current.credentials[0].status).toBe('valid');
      expect(result.current.credentials[0].lastValidatedAt).toBeDefined();
    });
  });

  describe('setValidationResult', () => {
    it('should update credential with validation result', () => {
      const { result } = renderHook(() => useCredentialStore());

      let credId: string;
      act(() => {
        credId = result.current.addCredential({
          provider: 'github',
          name: 'GitHub Token',
          secureStoreKey: 'github-token',
        });
      });

      act(() => {
        result.current.setValidationResult(credId!, {
          isValid: true,
          expiresAt: '2025-12-31T23:59:59Z',
          metadata: {
            scopes: ['repo', 'read:user'],
            username: 'testuser',
          },
        });
      });

      const cred = result.current.credentials[0];
      expect(cred.status).toBe('valid');
      expect(cred.expiresAt).toBe('2025-12-31T23:59:59Z');
      expect(cred.metadata?.scopes).toEqual(['repo', 'read:user']);
      expect(cred.metadata?.username).toBe('testuser');
    });

    it('should set invalid status on validation failure', () => {
      const { result } = renderHook(() => useCredentialStore());

      let credId: string;
      act(() => {
        credId = result.current.addCredential({
          provider: 'openai',
          name: 'OpenAI Key',
          secureStoreKey: 'openai-key',
        });
      });

      act(() => {
        result.current.setValidationResult(credId!, {
          isValid: false,
          message: 'Invalid API key',
        });
      });

      expect(result.current.credentials[0].status).toBe('invalid');
    });
  });

  describe('query methods', () => {
    it('getCredentialByProvider should return the correct credential', () => {
      const { result } = renderHook(() => useCredentialStore());

      act(() => {
        result.current.addCredential({
          provider: 'anthropic',
          name: 'Anthropic',
          secureStoreKey: 'anthropic-key',
        });
        result.current.addCredential({
          provider: 'github',
          name: 'GitHub',
          secureStoreKey: 'github-key',
        });
      });

      const anthropicCred = result.current.getCredentialByProvider('anthropic');
      expect(anthropicCred?.provider).toBe('anthropic');

      const githubCred = result.current.getCredentialByProvider('github');
      expect(githubCred?.provider).toBe('github');

      const nonexistent = result.current.getCredentialByProvider('custom');
      expect(nonexistent).toBeUndefined();
    });

    it('hasValidCredential should return correct boolean', () => {
      const { result } = renderHook(() => useCredentialStore());

      let credId: string;
      act(() => {
        credId = result.current.addCredential({
          provider: 'github',
          name: 'GitHub',
          secureStoreKey: 'github-key',
        });
      });

      expect(result.current.hasValidCredential('github')).toBe(false);

      act(() => {
        result.current.setCredentialStatus(credId!, 'valid');
      });

      expect(result.current.hasValidCredential('github')).toBe(true);
    });
  });

  describe('bulk operations', () => {
    it('clearAllCredentials should remove all credentials', () => {
      const { result } = renderHook(() => useCredentialStore());

      act(() => {
        result.current.addCredential({
          provider: 'anthropic',
          name: 'Anthropic',
          secureStoreKey: 'anthropic-key',
        });
        result.current.addCredential({
          provider: 'github',
          name: 'GitHub',
          secureStoreKey: 'github-key',
        });
      });

      expect(result.current.credentials).toHaveLength(2);

      act(() => {
        result.current.clearAllCredentials();
      });

      expect(result.current.credentials).toHaveLength(0);
    });

    it('invalidateAll should set all credentials to unknown', () => {
      const { result } = renderHook(() => useCredentialStore());

      act(() => {
        const id1 = result.current.addCredential({
          provider: 'anthropic',
          name: 'Anthropic',
          secureStoreKey: 'anthropic-key',
        });
        const id2 = result.current.addCredential({
          provider: 'github',
          name: 'GitHub',
          secureStoreKey: 'github-key',
        });
        result.current.setCredentialStatus(id1, 'valid');
        result.current.setCredentialStatus(id2, 'valid');
      });

      expect(result.current.credentials.every((c) => c.status === 'valid')).toBe(true);

      act(() => {
        result.current.invalidateAll();
      });

      expect(result.current.credentials.every((c) => c.status === 'unknown')).toBe(true);
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      useCredentialStore.setState({
        credentials: [
          {
            id: '1',
            provider: 'anthropic',
            name: 'Anthropic',
            secureStoreKey: 'key1',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            provider: 'github',
            name: 'GitHub',
            secureStoreKey: 'key2',
            status: 'invalid',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            provider: 'openai',
            name: 'OpenAI',
            secureStoreKey: 'key3',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });
    });

    it('selectCredentials should return all credentials', () => {
      const creds = selectCredentials(useCredentialStore.getState());
      expect(creds).toHaveLength(3);
    });

    it('selectCredentialByProvider should return credential for provider', () => {
      const cred = selectCredentialByProvider('github')(useCredentialStore.getState());
      expect(cred?.name).toBe('GitHub');
    });

    it('selectValidCredentials should filter valid credentials', () => {
      const valid = selectValidCredentials(useCredentialStore.getState());
      expect(valid).toHaveLength(2);
      expect(valid.every((c) => c.status === 'valid')).toBe(true);
    });

    it('selectInvalidCredentials should filter invalid credentials', () => {
      const invalid = selectInvalidCredentials(useCredentialStore.getState());
      expect(invalid).toHaveLength(1);
      expect(invalid[0].provider).toBe('github');
    });

    it('selectHasGitHubCredential should check for valid GitHub credential', () => {
      expect(selectHasGitHubCredential(useCredentialStore.getState())).toBe(false);

      useCredentialStore.setState({
        credentials: [
          {
            id: '1',
            provider: 'github',
            name: 'GitHub',
            secureStoreKey: 'key',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      expect(selectHasGitHubCredential(useCredentialStore.getState())).toBe(true);
    });

    it('selectHasAICredential should check for valid AI provider credential', () => {
      expect(selectHasAICredential(useCredentialStore.getState())).toBe(true);

      useCredentialStore.setState({
        credentials: [
          {
            id: '1',
            provider: 'github',
            name: 'GitHub',
            secureStoreKey: 'key',
            status: 'valid',
            createdAt: new Date().toISOString(),
          },
        ],
        isValidating: false,
        lastError: null,
      });

      expect(selectHasAICredential(useCredentialStore.getState())).toBe(false);
    });
  });
});
