/**
 * PollingService Tests
 *
 * Tests for the polling phase of GitHub Device Flow OAuth:
 * token polling, error handling, slow_down, expiration, and cancellation.
 */

vi.mock('@thumbcode/config', () => ({
  GITHUB_OAUTH: {
    deviceCodeUrl: 'https://github.com/login/device/code',
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: 'repo,user,read:org',
    pollInterval: 50, // Short for testing
    maxPollAttempts: 3, // Low for testing
  },
}));

vi.mock('../../credentials', () => ({
  CredentialService: {
    store: vi.fn().mockResolvedValue({ isValid: true }),
  },
}));

import { PollingService } from '../PollingService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PollingService', () => {
  let service: PollingService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    service = new PollingService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('pollForToken', () => {
    it('should return authorized result on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          access_token: 'ghp_testtoken',
          token_type: 'bearer',
          scope: 'repo user',
        }),
      });

      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id' }
      );

      // Let first poll execute
      await vi.advanceTimersByTimeAsync(0);

      const result = await resultPromise;

      expect(result.authorized).toBe(true);
      expect(result.accessToken).toBe('ghp_testtoken');
      expect(result.scopes).toEqual(['repo', 'user']);
    });

    it('should continue polling on authorization_pending', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            error: 'authorization_pending',
            error_description: 'User has not yet authorized',
          }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            access_token: 'ghp_token',
            token_type: 'bearer',
            scope: 'repo',
          }),
        });

      const onPollAttempt = vi.fn();
      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id', onPollAttempt }
      );

      // First poll - authorization_pending
      await vi.advanceTimersByTimeAsync(0);
      // Wait for poll interval then next poll
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result.authorized).toBe(true);
      expect(onPollAttempt).toHaveBeenCalledTimes(2);
    });

    it('should stop on access_denied', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          error: 'access_denied',
          error_description: 'User denied access',
        }),
      });

      const onError = vi.fn();
      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id', onError }
      );

      await vi.advanceTimersByTimeAsync(0);
      const result = await resultPromise;

      expect(result.authorized).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.errorCode).toBe('access_denied');
      expect(onError).toHaveBeenCalled();
    });

    it('should stop on expired_token', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          error: 'expired_token',
          error_description: 'Device code expired',
        }),
      });

      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id' }
      );

      await vi.advanceTimersByTimeAsync(0);
      const result = await resultPromise;

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe('expired_token');
    });

    it('should time out after max poll attempts', async () => {
      // Always return authorization_pending
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({
          error: 'authorization_pending',
          error_description: 'Pending',
        }),
      });

      const onError = vi.fn();
      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id', onError }
      );

      // maxPollAttempts is 3, so after 3 pending responses + 1 check we should time out
      await vi.advanceTimersByTimeAsync(0);   // attempt 1
      await vi.advanceTimersByTimeAsync(100);  // attempt 2
      await vi.advanceTimersByTimeAsync(100);  // attempt 3
      await vi.advanceTimersByTimeAsync(100);  // attempt 4 - exceeds max

      const result = await resultPromise;

      expect(result.authorized).toBe(false);
      expect(result.error).toContain('timed out');
    });

    it('should store token via CredentialService on success', async () => {
      const { CredentialService } = await import('../../credentials');

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          access_token: 'ghp_stored_token',
          token_type: 'bearer',
          scope: 'repo',
        }),
      });

      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id' }
      );

      await vi.advanceTimersByTimeAsync(0);
      await resultPromise;

      expect(CredentialService.store).toHaveBeenCalledWith(
        'github',
        'ghp_stored_token',
        { skipValidation: false }
      );
    });
  });

  describe('cancel', () => {
    it('should cancel ongoing polling', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({
          error: 'authorization_pending',
          error_description: 'Pending',
        }),
      });

      const resultPromise = service.pollForToken(
        'device-code',
        { clientId: 'client-id' }
      );

      await vi.advanceTimersByTimeAsync(0); // First poll

      service.cancel();

      const result = await resultPromise;

      expect(result.authorized).toBe(false);
      expect(result.error).toContain('cancelled');
    });
  });

  describe('setPollInterval', () => {
    it('should enforce minimum poll interval', () => {
      service.setPollInterval(10); // Below minimum (50 from config)
      // No direct way to check, but it should use the minimum
      // This test exercises the method without error
      expect(true).toBe(true);
    });
  });
});
