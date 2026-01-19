/**
 * Authentication Services
 *
 * OAuth and authentication flows for external services.
 */

export { GitHubAuthService } from './GitHubAuthService';
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
