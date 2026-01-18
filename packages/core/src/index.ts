/**
 * @thumbcode/core
 *
 * Core services for ThumbCode including Git operations and credential management.
 */

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
