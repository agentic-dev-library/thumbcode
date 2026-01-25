/**
 * @thumbcode/core
 *
 * Core services for ThumbCode including Git operations, credential management,
 * and authentication flows.
 */

// Auth service
export { GitHubAuthService } from './auth';
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
} from './auth';

// Git service
export { GitService } from './git';
export type {
  BranchInfo,
  BranchOptions,
  CheckoutOptions,
  CloneOptions,
  CommitInfo,
  CommitOptions,
  DiffResult,
  DiffStats,
  FetchOptions,
  FileDiff,
  FileStatus,
  GitAuthor,
  GitCredentials,
  GitFileStatus,
  GitResult,
  ProgressCallback,
  ProgressEvent,
  PullOptions,
  PushOptions,
  RemoteInfo,
  RepositoryStatus,
  StageOptions,
} from './git';

// Credential service
export { CredentialService, validateAnthropicKey, validateGitHubToken } from './credentials';
export type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  SecureCredential,
  StoreOptions,
  ValidationResult,
} from './credentials';

// GitHub API
export { GitHubApiService } from './github';
