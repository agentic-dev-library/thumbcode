/**
 * Polling Service
 *
 * Handles the polling phase of GitHub Device Flow OAuth:
 * repeatedly checks for token authorization with error retry and backoff.
 */

import { GITHUB_OAUTH } from '@/config';
import { CredentialService } from '../credentials';
import type {
  AccessTokenResponse,
  DeviceFlowOptions,
  DeviceFlowState,
  PollResult,
  TokenErrorResponse,
} from './types';

export class PollingService {
  private pollInterval: number = GITHUB_OAUTH.pollInterval;
  private pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pollAttempt: number = 0;
  private consecutiveErrors: number = 0;
  private pollResolve: ((result: PollResult) => void) | null = null;
  private isCancelled = false;

  /**
   * Set the poll interval (e.g., from GitHub's suggested interval)
   */
  setPollInterval(intervalMs: number): void {
    this.pollInterval = Math.max(intervalMs, GITHUB_OAUTH.pollInterval);
  }

  /**
   * Poll for access token completion
   */
  async pollForToken(
    deviceCode: string,
    options: DeviceFlowOptions,
    abortSignal?: AbortSignal,
    onSetState?: (state: DeviceFlowState) => void
  ): Promise<PollResult> {
    const { clientId, onPollAttempt, onError } = options;

    onSetState?.('polling');
    this.pollAttempt = 0;
    this.consecutiveErrors = 0;
    this.isCancelled = false;

    return new Promise((resolve) => {
      this.pollResolve = resolve;

      const poll = async () => {
        if (this.isCancelled) {
          resolve({ authorized: false, shouldContinue: false, error: 'Authorization cancelled.' });
          return;
        }

        this.pollAttempt++;
        onPollAttempt?.(this.pollAttempt, GITHUB_OAUTH.maxPollAttempts);

        if (this.pollAttempt > GITHUB_OAUTH.maxPollAttempts) {
          onSetState?.('error');
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
          const result = await this.checkForToken(clientId, deviceCode, abortSignal);

          this.consecutiveErrors = 0;

          if (this.isCancelled) {
            resolve({
              authorized: false,
              shouldContinue: false,
              error: 'Authorization cancelled.',
            });
            return;
          }

          if (result.authorized) {
            onSetState?.('success');
            this.cleanup();

            // Store the token securely
            if (result.accessToken) {
              await CredentialService.store('github', result.accessToken, {
                skipValidation: false,
              });
            }

            resolve(result);
            return;
          }

          if (!result.shouldContinue) {
            onSetState?.('error');
            this.cleanup();
            onError?.(result.error || 'Authorization failed', result.errorCode);
            resolve(result);
            return;
          }

          // Continue polling after interval
          this.pollTimeoutId = setTimeout(poll, this.pollInterval);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            this.cleanup();
            resolve({ authorized: false, shouldContinue: false, error: 'Polling cancelled' });
            return;
          }

          this.consecutiveErrors++;
          const maxConsecutiveErrors = 3;

          if (this.consecutiveErrors < maxConsecutiveErrors) {
            console.warn(
              `Poll attempt failed (${this.consecutiveErrors}/${maxConsecutiveErrors}). Retrying...`
            );
            this.pollTimeoutId = setTimeout(poll, this.pollInterval);
            return;
          }

          const errorMessage = error instanceof Error ? error.message : 'Poll request failed';
          onSetState?.('error');
          this.cleanup();
          onError?.(errorMessage);
          resolve({
            authorized: false,
            shouldContinue: false,
            error: errorMessage,
          });
        }
      };

      poll();
    });
  }

  /**
   * Check if the user has authorized the app
   */
  private async checkForToken(
    clientId: string,
    deviceCode: string,
    abortSignal?: AbortSignal
  ): Promise<PollResult> {
    const response = await fetch(GITHUB_OAUTH.accessTokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }).toString(),
      signal: abortSignal,
    });

    const data = await response.json();

    if ('error' in data) {
      const errorData = data as TokenErrorResponse;

      switch (errorData.error) {
        case 'authorization_pending':
          return { authorized: false, shouldContinue: true };

        case 'slow_down':
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

    const tokenData = data as AccessTokenResponse;
    return {
      authorized: true,
      shouldContinue: false,
      accessToken: tokenData.access_token,
      scopes: tokenData.scope.split(' ').map((s) => s.trim()),
    };
  }

  /**
   * Cancel ongoing polling
   */
  cancel(): void {
    this.isCancelled = true;
    this.pollResolve?.({
      authorized: false,
      shouldContinue: false,
      error: 'Authorization cancelled.',
    });
    this.cleanup();
  }

  /**
   * Clean up polling resources
   */
  private cleanup(): void {
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = null;
    }
    this.pollAttempt = 0;
    this.consecutiveErrors = 0;
    this.pollResolve = null;
  }
}
