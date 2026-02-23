/**
 * Tool Execution Services
 *
 * Bridges agent tool definitions to actual git service implementations.
 */

export { ToolExecutionBridge } from './ToolExecutionBridge';
export type {
  BranchServiceLike,
  CloneServiceLike,
  CommitResult,
  CommitServiceLike,
  DiffServiceLike,
  FileSystemLike,
  StagedChange,
  ToolBridgeDependencies,
  ToolResult,
} from './types';
