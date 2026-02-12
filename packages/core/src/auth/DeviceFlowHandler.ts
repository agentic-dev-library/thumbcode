/**
 * Device Flow Handler
 *
 * Handles the initial phase of GitHub Device Flow OAuth:
 * requesting a device code and preparing for user authorization.
 */

import { GITHUB_OAUTH } from '@thumbcode/config';
import type {
  DeviceCodeResponse,
  DeviceFlowOptions,
  DeviceFlowState,
  StartFlowResult,
} from './types';

export class DeviceFlowHandler {
  /**
   * Start the Device Flow by requesting a device code from GitHub
   */
  async startDeviceFlow(
    options: DeviceFlowOptions,
    abortSignal?: AbortSignal,
    onSetState?: (state: DeviceFlowState) => void
  ): Promise<StartFlowResult> {
    const { clientId, scopes = GITHUB_OAUTH.scopes, onError } = options;

    if (!clientId) {
      const error = 'GitHub Client ID is required. Set EXPO_PUBLIC_GITHUB_CLIENT_ID in your environment.';
      onError?.(error);
      return { success: false, error };
    }

    onSetState?.('requesting_code');

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
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = `Failed to request device code: ${response.status} ${errorText}`;
        onSetState?.('error');
        onError?.(error);
        return { success: false, error };
      }

      const data: DeviceCodeResponse = await response.json();

      onSetState?.('awaiting_user');
      options.onUserCode?.(data.user_code, data.verification_uri);

      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request was cancelled' };
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to start device flow';
      onSetState?.('error');
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}
