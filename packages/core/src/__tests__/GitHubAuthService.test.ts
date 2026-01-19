/**
 * GitHubAuthService Tests
 *
 * Tests for the GitHub Device Flow authentication service.
 */

import { GitHubAuthService } from '../auth/GitHubAuthService';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock CredentialService
jest.mock('../credentials/CredentialService', () => ({
  CredentialService: {
    store: jest.fn().mockResolvedValue({ isValid: true }),
    retrieve: jest.fn().mockResolvedValue({ secret: null }),
    validateCredential: jest.fn().mockResolvedValue({ isValid: false }),
    delete: jest.fn().mockResolvedValue(true),
  },
}));

describe('GitHubAuthService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Reset the service state
    GitHubAuthService.cancel();
  });

  it('should be defined', () => {
    expect(GitHubAuthService).toBeDefined();
  });

  describe('getState', () => {
    it('should return idle state initially', () => {
      expect(GitHubAuthService.getState()).toBe('idle');
    });
  });

  describe('startDeviceFlow', () => {
    it('should fail without clientId', async () => {
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Client ID is required');
    });

    it('should request device code from GitHub', async () => {
      const mockResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const onUserCode = jest.fn();
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
        onUserCode,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(onUserCode).toHaveBeenCalledWith('TEST-1234', 'https://github.com/login/device');
      expect(GitHubAuthService.getState()).toBe('awaiting_user');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      const onError = jest.fn();
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
        onError,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('401');
      expect(onError).toHaveBeenCalled();
      expect(GitHubAuthService.getState()).toBe('error');
    });

    it('should call onStateChange callback', async () => {
      const mockResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const onStateChange = jest.fn();
      await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
        onStateChange,
      });

      expect(onStateChange).toHaveBeenCalledWith('requesting_code');
      expect(onStateChange).toHaveBeenCalledWith('awaiting_user');
    });
  });

  describe('cancel', () => {
    it('should reset state to idle', async () => {
      const mockResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
      });

      expect(GitHubAuthService.getState()).toBe('awaiting_user');

      GitHubAuthService.cancel();

      expect(GitHubAuthService.getState()).toBe('idle');
    });
  });

  describe('pollForToken', () => {
    it('should fail without device code', async () => {
      const onError = jest.fn();
      const result = await GitHubAuthService.pollForToken({
        clientId: 'test-client-id',
        onError,
      });

      expect(result.authorized).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.error).toContain('No device code');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle authorization_pending response', async () => {
      // First, start the device flow
      const deviceCodeResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 1, // Short interval for testing
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(deviceCodeResponse),
      });

      await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
      });

      // Mock pending response followed by success
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              error: 'authorization_pending',
              error_description: 'User has not yet authorized',
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'test-access-token',
              token_type: 'bearer',
              scope: 'repo,user',
            }),
        });

      const onPollAttempt = jest.fn();
      const result = await GitHubAuthService.pollForToken({
        clientId: 'test-client-id',
        onPollAttempt,
      });

      expect(result.authorized).toBe(true);
      expect(result.accessToken).toBe('test-access-token');
      expect(onPollAttempt).toHaveBeenCalled();
    }, 10000);

    it('should handle access_denied response', async () => {
      // First, start the device flow
      const deviceCodeResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(deviceCodeResponse),
      });

      await GitHubAuthService.startDeviceFlow({
        clientId: 'test-client-id',
      });

      // Mock access denied
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            error: 'access_denied',
            error_description: 'User denied access',
          }),
      });

      const result = await GitHubAuthService.pollForToken({
        clientId: 'test-client-id',
      });

      expect(result.authorized).toBe(false);
      expect(result.shouldContinue).toBe(false);
      expect(result.errorCode).toBe('access_denied');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', async () => {
      const result = await GitHubAuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should call CredentialService.delete', async () => {
      const { CredentialService } = jest.requireMock('../credentials/CredentialService');

      await GitHubAuthService.signOut();

      expect(CredentialService.delete).toHaveBeenCalledWith('github');
    });
  });
});
