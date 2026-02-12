/**
 * GitHub Auth Service - Unified Facade
 *
 * Thin facade that delegates to focused auth modules:
 * - DeviceFlowHandler: device code request, flow initiation
 * - PollingService: token polling with retry and backoff
 * - TokenManager: auth status, user info, sign-out
 */

import { GITHUB_OAUTH } from '@thumbcode/config';
import { DeviceFlowHandler } from './DeviceFlowHandler';
import { PollingService } from './PollingService';
import { TokenManager } from './TokenManager';
import type {
  DeviceFlowOptions,
  DeviceFlowState,
  GitHubUser,
  PollResult,
  StartFlowResult,
} from './types';

class GitHubAuthServiceClass {
  private deviceFlowHandler: DeviceFlowHandler;
  private pollingService: PollingService;
  private tokenManager: TokenManager;

  private state: DeviceFlowState = 'idle';
  private deviceCode: string | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    this.deviceFlowHandler = new DeviceFlowHandler();
    this.pollingService = new PollingService();
    this.tokenManager = new TokenManager();
  }

  getState(): DeviceFlowState {
    return this.state;
  }

  // Device Flow initiation (delegated to DeviceFlowHandler)
  async startDeviceFlow(options: DeviceFlowOptions): Promise<StartFlowResult> {
    this.abortController = new AbortController();

    const result = await this.deviceFlowHandler.startDeviceFlow(
      options,
      this.abortController.signal,
      (newState) => this.setState(newState, options.onStateChange)
    );

    if (result.success && result.data) {
      this.deviceCode = result.data.device_code;
      this.pollingService.setPollInterval(
        Math.max(result.data.interval * 1000, GITHUB_OAUTH.pollInterval)
      );
    }

    return result;
  }

  // Token polling (delegated to PollingService)
  async pollForToken(options: DeviceFlowOptions): Promise<PollResult> {
    if (!this.deviceCode) {
      const error = 'No device code available. Call startDeviceFlow first.';
      options.onError?.(error);
      return { authorized: false, shouldContinue: false, error };
    }

    const result = await this.pollingService.pollForToken(
      this.deviceCode,
      options,
      this.abortController?.signal,
      (newState) => this.setState(newState, options.onStateChange)
    );

    if (result.authorized || !result.shouldContinue) {
      this.deviceCode = null;
    }

    return result;
  }

  cancel(): void {
    this.abortController?.abort();
    this.pollingService.cancel();
    this.deviceCode = null;
    this.state = 'idle';
  }

  // Token management (delegated to TokenManager)
  async isAuthenticated(): Promise<boolean> {
    return this.tokenManager.isAuthenticated();
  }

  async getCurrentUser(): Promise<GitHubUser | null> {
    return this.tokenManager.getCurrentUser();
  }

  async signOut(): Promise<boolean> {
    return this.tokenManager.signOut();
  }

  private setState(
    state: DeviceFlowState,
    callback?: (state: DeviceFlowState) => void
  ): void {
    this.state = state;
    callback?.(state);
  }
}

// Export singleton instance
export const GitHubAuthService = new GitHubAuthServiceClass();
