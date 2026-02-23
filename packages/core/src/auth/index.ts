/**
 * Authentication Services
 *
 * OAuth and authentication flows for external services.
 */

export { DeviceFlowHandler } from './DeviceFlowHandler';
export { GitHubAuthService } from './GitHubAuthService';
export { PollingService } from './PollingService';
export { TokenManager } from './TokenManager';
export type {
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
