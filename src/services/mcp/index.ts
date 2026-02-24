/**
 * MCP Services
 *
 * Model Context Protocol client and tool bridge for integrating
 * external MCP servers into the agent tool system.
 * Powered by @ai-sdk/mcp for transport and protocol handling.
 */

export { McpClient } from './McpClient';
export type { BridgedMcpTool } from './McpToolBridge';
export {
  convertAllMcpTools,
  convertMcpTools,
  executeMcpTool,
  getMcpToolDefinitions,
  isMcpTool,
} from './McpToolBridge';
export type { McpConnection, McpToolResult, McpTransportType } from './types';
