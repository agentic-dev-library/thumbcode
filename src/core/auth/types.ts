/**
 * GitHub Auth Types
 *
 * Type definitions for GitHub Device Flow authentication.
 */

/**
 * Response from GitHub's device code endpoint
 */
export interface DeviceCodeResponse {
  /** Device verification code for polling */
  device_code: string;
  /** User-facing code to enter on GitHub */
  user_code: string;
  /** URL where user enters the code */
  verification_uri: string;
  /** Seconds until codes expire */
  expires_in: number;
  /** Minimum seconds between poll requests */
  interval: number;
}

/**
 * Response from GitHub's access token endpoint
 */
export interface AccessTokenResponse {
  /** The OAuth access token */
  access_token: string;
  /** Token type (usually "bearer") */
  token_type: string;
  /** Granted scopes */
  scope: string;
}

/**
 * Error response from GitHub's token endpoint during polling
 */
export interface TokenErrorResponse {
  /** Error code */
  error: DeviceFlowError;
  /** Human-readable error description */
  error_description: string;
  /** Error documentation URL */
  error_uri?: string;
}

/**
 * Possible Device Flow error states
 */
export type DeviceFlowError =
  | 'authorization_pending' // User hasn't completed auth yet
  | 'slow_down' // Polling too fast
  | 'expired_token' // Device code expired
  | 'unsupported_grant_type' // Invalid grant_type
  | 'incorrect_client_credentials' // Invalid client_id
  | 'incorrect_device_code' // Invalid device_code
  | 'access_denied'; // User denied authorization

/**
 * Current state of the Device Flow
 */
export type DeviceFlowState =
  | 'idle'
  | 'requesting_code'
  | 'awaiting_user'
  | 'polling'
  | 'success'
  | 'error';

/**
 * Result of starting the Device Flow
 */
export interface StartFlowResult {
  /** Whether the request succeeded */
  success: boolean;
  /** Device code response if successful */
  data?: DeviceCodeResponse;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of polling for authorization
 */
export interface PollResult {
  /** Whether authorization is complete */
  authorized: boolean;
  /** Whether to continue polling */
  shouldContinue: boolean;
  /** Access token if authorized */
  accessToken?: string;
  /** Token scopes */
  scopes?: string[];
  /** Error message if failed */
  error?: string;
  /** Error code from GitHub */
  errorCode?: DeviceFlowError;
}

/**
 * GitHub user info from validation
 */
export interface GitHubUser {
  /** GitHub username */
  login: string;
  /** Display name */
  name: string | null;
  /** Avatar URL */
  avatar_url: string;
  /** User ID */
  id: number;
}

/**
 * Options for the Device Flow
 */
export interface DeviceFlowOptions {
  /** GitHub OAuth App client ID */
  clientId: string;
  /** Requested OAuth scopes */
  scopes?: string;
  /** Callback when user code is ready */
  onUserCode?: (userCode: string, verificationUri: string) => void;
  /** Callback on state change */
  onStateChange?: (state: DeviceFlowState) => void;
  /** Callback on poll attempt */
  onPollAttempt?: (attempt: number, maxAttempts: number) => void;
  /** Callback on error */
  onError?: (error: string, errorCode?: DeviceFlowError) => void;
}
