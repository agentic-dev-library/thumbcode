/**
 * DeviceFlowHandler Tests
 *
 * Tests for the initial phase of GitHub Device Flow OAuth:
 * requesting device code, error handling, and abort support.
 */

vi.mock('@thumbcode/config', () => ({
  GITHUB_OAUTH: {
    deviceCodeUrl: 'https://github.com/login/device/code',
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: 'repo,user,read:org',
    pollInterval: 100,
    maxPollAttempts: 60,
  },
}));

import { DeviceFlowHandler } from '../DeviceFlowHandler';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DeviceFlowHandler', () => {
  let handler: DeviceFlowHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new DeviceFlowHandler();
  });

  describe('startDeviceFlow', () => {
    const mockDeviceCodeResponse = {
      device_code: 'test-device-code',
      user_code: 'ABCD-1234',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    };

    it('should request a device code successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeviceCodeResponse),
      });

      const result = await handler.startDeviceFlow({
        clientId: 'test-client-id',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeviceCodeResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/device/code',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should fail when clientId is empty', async () => {
      const onError = vi.fn();
      const result = await handler.startDeviceFlow({
        clientId: '',
        onError,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Client ID is required');
      expect(onError).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should call onUserCode callback with user code and verification URI', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeviceCodeResponse),
      });

      const onUserCode = vi.fn();
      await handler.startDeviceFlow({
        clientId: 'test-client-id',
        onUserCode,
      });

      expect(onUserCode).toHaveBeenCalledWith(
        'ABCD-1234',
        'https://github.com/login/device'
      );
    });

    it('should call onSetState with state transitions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeviceCodeResponse),
      });

      const onSetState = vi.fn();
      await handler.startDeviceFlow(
        { clientId: 'test-client-id' },
        undefined,
        onSetState
      );

      expect(onSetState).toHaveBeenCalledWith('requesting_code');
      expect(onSetState).toHaveBeenCalledWith('awaiting_user');
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      const onError = vi.fn();
      const onSetState = vi.fn();
      const result = await handler.startDeviceFlow(
        { clientId: 'test-client-id', onError },
        undefined,
        onSetState
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('401');
      expect(onError).toHaveBeenCalled();
      expect(onSetState).toHaveBeenCalledWith('error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const onError = vi.fn();
      const result = await handler.startDeviceFlow({
        clientId: 'test-client-id',
        onError,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle abort signal', async () => {
      const abortError = Object.assign(new Error('Aborted'), { name: 'AbortError' });
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await handler.startDeviceFlow(
        { clientId: 'test-client-id' },
        new AbortController().signal
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request was cancelled');
    });

    it('should use custom scopes when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeviceCodeResponse),
      });

      await handler.startDeviceFlow({
        clientId: 'test-client-id',
        scopes: 'repo',
      });

      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toContain('scope=repo');
    });
  });
});
