/**
 * Tool Execution Services
 *
 * Bridges agent tool definitions to actual git service implementations.
 */

export { ToolExecutionBridge } from './ToolExecutionBridge';
export type {
  BranchServiceLike,
  CloneServiceLike,
  CommitServiceLike,
  DiffServiceLike,
  FileSystemLike,
  ToolBridgeDependencies,
  ToolResult,
} from './types';
