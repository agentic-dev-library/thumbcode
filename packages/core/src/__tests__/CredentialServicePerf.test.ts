import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { secureFetch } from '../api/api';
import { CredentialService } from '../credentials/CredentialService';

// Mock secureFetch
vi.mock('../api/api', () => ({
  secureFetch: vi.fn(),
}));

describe('CredentialService Performance', () => {
  const mockDelay = 100;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Native Environment for perf test
    vi.stubGlobal('window', {
      Capacitor: {
        isNativePlatform: () => true,
      },
    });

    // Mock SecureStoragePlugin to return items for specific keys
    (SecureStoragePlugin.get as Mock).mockImplementation(async ({ key }: { key: string }) => {
      if (key.includes('github')) {
        return {
          value: JSON.stringify({
            secret: 'ghp_000000000000000000000000000000000000',
            storedAt: '2023-01-01',
            type: 'github',
          }),
        };
      }
      if (key.includes('anthropic')) {
        return {
          value: JSON.stringify({
            secret: 'sk-ant-test',
            storedAt: '2023-01-01',
            type: 'anthropic',
          }),
        };
      }
      if (key.includes('openai')) {
        return {
          value: JSON.stringify({ secret: 'sk-test', storedAt: '2023-01-01', type: 'openai' }),
        };
      }
      throw new Error('Key not found');
    });

    // Mock secureFetch to simulate network delay
    (secureFetch as Mock).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, mockDelay));
      return {
        ok: true,
        status: 200,
        json: async () => ({ login: 'testuser' }), // For GitHub
        headers: { get: () => null },
      };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('measures validateAllStored performance', async () => {
    const start = Date.now();
    const results = await CredentialService.validateAllStored();
    const end = Date.now();
    const duration = end - start;

    // Should be significantly faster than sequential (3 * 100ms)
    // Parallel should be around 100ms + overhead
    expect(duration).toBeLessThan(200);

    expect(results.size).toBe(3);
    expect(results.get('github')?.isValid).toBe(true);
    expect(results.get('anthropic')?.isValid).toBe(true);
    expect(results.get('openai')?.isValid).toBe(true);
  });
});
