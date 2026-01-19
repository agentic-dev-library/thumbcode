/**
 * Services Exports
 *
 * Application-specific services. For core services (Git, Credentials, Security),
 * import directly from @thumbcode/core.
 *
 * @example
 * // Chat service (app-specific)
 * import { ChatService } from '@/services/chat';
 *
 * // Core services (from packages)
 * import { GitService, CredentialService } from '@thumbcode/core';
 */

// Re-export core services for backwards compatibility
// NOTE: Prefer importing directly from @thumbcode/core
export {
  type BiometricResult,
  type BranchInfo,
  type BranchOptions,
  type CheckoutOptions,
  type CloneOptions,
  type CommitInfo,
  type CommitOptions,
  CredentialService,
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
  type RetrieveOptions,
  type StageOptions,
  type StoreOptions,
  type ValidationResult,
} from '@thumbcode/core';
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
