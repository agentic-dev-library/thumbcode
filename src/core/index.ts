/**
 * @thumbcode/core
 *
 * Core services for ThumbCode including Git operations, credential management,
 * and authentication flows.
 */

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
// Auth service
export { GitHubAuthService } from './auth';
export type {
  BiometricResult,
  CredentialType,
  RetrieveOptions,
  RetrieveResult,
  SecureCredential,
  StoreOptions,
  ValidationResult,
} from './credentials';
// Credential service
export { CredentialService, validateAnthropicKey, validateGitHubToken } from './credentials';
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
// Git services
export { GitBranchService, GitCloneService, GitCommitService, GitDiffService } from './git';

// GitHub API
export { GitHubApiService } from './github';
export type { GitHubCommit, GitHubContent } from './github/GitHubApiService';

// Security
export {
  certificatePinningService,
  requestSigningService,
  runtimeSecurityService,
} from './security';
