/**
 * Services Exports
 *
 * All ThumbCode services are exported from here.
 */

// Chat service for human-agent collaboration
export {
  type ApprovalMessage,
  type ChatEvent,
  type ChatEventType,
  ChatService,
  type ChatThread,
  type CodeMessage,
  type Message,
  type SendMessageOptions,
  type StreamingResponse,
} from './chat';
// Credential management service
export {
  type BiometricResult,
  CredentialService,
  type RetrieveOptions,
  type StoreOptions,
  type ValidationResult,
} from './credentials';

// Git operations service
export {
  type BranchInfo,
  type BranchOptions,
  type CheckoutOptions,
  type CloneOptions,
  type CommitInfo,
  type CommitOptions,
  type DiffResult,
  type FetchOptions,
  type FileStatus,
  type GitAuthor,
  type GitCredentials,
  type GitResult,
  GitService,
  type ProgressCallback,
  type ProgressEvent,
  type PullOptions,
  type PushOptions,
  type RemoteInfo,
  type RepositoryState,
  type StageOptions,
} from './git';
