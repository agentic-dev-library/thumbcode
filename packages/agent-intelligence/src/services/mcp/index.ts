/**
 * MCP Services
 *
 * Model Context Protocol client and tool bridge for integrating
 * external MCP servers into the agent tool system.
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
export type { McpConnection, McpTool, McpToolProperty, McpToolResult, McpTransportConfig } from './types';
