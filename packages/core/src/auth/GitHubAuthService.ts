/**
 * GitHub Auth Service
 *
 * Implements GitHub Device Flow OAuth authentication.
 * This flow is ideal for mobile apps where users authenticate
 * on a separate device (their phone's browser).
 *
 * Device Flow Steps:
 * 1. Request device code from GitHub
 * 2. Display user_code for user to enter at github.com/login/device
 * 3. Poll for access token while user authenticates
 * 4. Store token securely using CredentialService
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

import { GITHUB_OAUTH } from '@thumbcode/config';
import { CredentialService } from '../credentials';
import type {
  AccessTokenResponse,
  DeviceCodeResponse,
  DeviceFlowError,
  DeviceFlowOptions,
  DeviceFlowState,
  GitHubUser,
  PollResult,
  StartFlowResult,
  TokenErrorResponse,
} from './types';

/**
 * GitHub Auth Service for Device Flow authentication
 */
class GitHubAuthServiceClass {
  private state: DeviceFlowState = 'idle';
  private deviceCode: string | null = null;
  private pollInterval: number = GITHUB_OAUTH.pollInterval;
  private pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pollAttempt: number = 0;
  private abortController: AbortController | null = null;

  /**
   * Get the current state of the Device Flow
   */
  getState(): DeviceFlowState {
    return this.state;
  }

  /**
   * Start the Device Flow by requesting a device code
   *
   * @param options - Device flow options including client ID and callbacks
   * @returns Result with device code info or error
   */
  async startDeviceFlow(options: DeviceFlowOptions): Promise<StartFlowResult> {
    const { clientId, scopes = GITHUB_OAUTH.scopes, onStateChange, onError } = options;

    if (!clientId) {
      const error = 'GitHub Client ID is required. Set EXPO_PUBLIC_GITHUB_CLIENT_ID in your environment.';
      onError?.(error);
      return { success: false, error };
    }

    this.setState('requesting_code', onStateChange);
    this.abortController = new AbortController();

    try {
      const response = await fetch(GITHUB_OAUTH.deviceCodeUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          scope: scopes,
        }).toString(),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = `Failed to request device code: ${response.status} ${errorText}`;
        this.setState('error', onStateChange);
        onError?.(error);
        return { success: false, error };
      }

      const data: DeviceCodeResponse = await response.json();

      // Store device code for polling
      this.deviceCode = data.device_code;
      // Use GitHub's suggested interval (with our minimum as fallback)
      this.pollInterval = Math.max(data.interval * 1000, GITHUB_OAUTH.pollInterval);

      this.setState('awaiting_user', onStateChange);
      options.onUserCode?.(data.user_code, data.verification_uri);

      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request was cancelled' };
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to start device flow';
      this.setState('error', onStateChange);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Poll for access token completion
   *
   * @param options - Device flow options including client ID and callbacks
   * @returns Final poll result with access token or error
   */
  async pollForToken(options: DeviceFlowOptions): Promise<PollResult> {
    const { clientId, onStateChange, onPollAttempt, onError } = options;

    if (!this.deviceCode) {
      const error = 'No device code available. Call startDeviceFlow first.';
      onError?.(error);
      return { authorized: false, shouldContinue: false, error };
    }

    this.setState('polling', onStateChange);
    this.pollAttempt = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        this.pollAttempt++;
        onPollAttempt?.(this.pollAttempt, GITHUB_OAUTH.maxPollAttempts);

        // Check if we've exceeded max attempts
        if (this.pollAttempt > GITHUB_OAUTH.maxPollAttempts) {
          this.setState('error', onStateChange);
          const error = 'Authorization timed out. Please try again.';
          onError?.(error, 'expired_token');
          resolve({
            authorized: false,
            shouldContinue: false,
            error,
            errorCode: 'expired_token',
          });
          return;
        }

        try {
          const result = await this.checkForToken(clientId);

          if (result.authorized) {
            this.setState('success', onStateChange);
            this.cleanup();

            // Store the token securely
            if (result.accessToken) {
              await CredentialService.store('github', result.accessToken, {
                skipValidation: false, // Validate before storing
              });
            }

            resolve(result);
            return;
          }

          if (!result.shouldContinue) {
            this.setState('error', onStateChange);
            this.cleanup();
            onError?.(result.error || 'Authorization failed', result.errorCode);
            resolve(result);
            return;
          }

          // Continue polling after interval
          this.pollTimeoutId = setTimeout(poll, this.pollInterval);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Poll request failed';
          this.setState('error', onStateChange);
          this.cleanup();
          onError?.(errorMessage);
          resolve({
            authorized: false,
            shouldContinue: false,
            error: errorMessage,
          });
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Check if the user has authorized the app
   *
   * @param clientId - GitHub OAuth App client ID
   * @returns Poll result indicating authorization state
   */
  private async checkForToken(clientId: string): Promise<PollResult> {
    const response = await fetch(GITHUB_OAUTH.accessTokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: this.deviceCode!,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }).toString(),
    });

    const data = await response.json();

    // Check for error response
    if ('error' in data) {
      const errorData = data as TokenErrorResponse;

      switch (errorData.error) {
        case 'authorization_pending':
          // User hasn't completed auth yet - keep polling
          return { authorized: false, shouldContinue: true };

        case 'slow_down':
          // Increase poll interval and continue
          this.pollInterval += 5000;
          return { authorized: false, shouldContinue: true };

        case 'expired_token':
          return {
            authorized: false,
            shouldContinue: false,
            error: 'The device code has expired. Please start over.',
            errorCode: 'expired_token',
          };

        case 'access_denied':
          return {
            authorized: false,
            shouldContinue: false,
            error: 'You denied the authorization request.',
            errorCode: 'access_denied',
          };

        default:
          return {
            authorized: false,
            shouldContinue: false,
            error: errorData.error_description || `Authorization error: ${errorData.error}`,
            errorCode: errorData.error,
          };
      }
    }

    // Success - we have an access token
    const tokenData = data as AccessTokenResponse;
    return {
      authorized: true,
      shouldContinue: false,
      accessToken: tokenData.access_token,
      scopes: tokenData.scope.split(' ').map((s) => s.trim()),
    };
  }

  /**
   * Cancel an ongoing Device Flow
   */
  cancel(): void {
    this.abortController?.abort();
    this.cleanup();
    this.state = 'idle';
  }

  /**
   * Clean up polling resources
   */
  private cleanup(): void {
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = null;
    }
    this.deviceCode = null;
    this.pollAttempt = 0;
  }

  /**
   * Update state and notify callback
   */
  private setState(
    state: DeviceFlowState,
    callback?: (state: DeviceFlowState) => void
  ): void {
    this.state = state;
    callback?.(state);
  }

  /**
   * Check if user is currently authenticated with GitHub
   *
   * @returns Whether a valid GitHub token exists
   */
  async isAuthenticated(): Promise<boolean> {
    const { secret } = await CredentialService.retrieve('github');
    if (!secret) return false;

    // Validate the token is still valid
    const validation = await CredentialService.validateCredential('github', secret);
    return validation.isValid;
  }

  /**
   * Get the current GitHub user info
   *
   * @returns User info if authenticated, null otherwise
   */
  async getCurrentUser(): Promise<GitHubUser | null> {
    const { secret } = await CredentialService.retrieve('github');
    if (!secret) return null;

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${secret}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) return null;

      const user = await response.json();
      return {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Sign out by removing the stored GitHub token
   *
   * @returns Whether sign out was successful
   */
  async signOut(): Promise<boolean> {
    return CredentialService.delete('github');
  }
}

// Export singleton instance
export const GitHubAuthService = new GitHubAuthServiceClass();
