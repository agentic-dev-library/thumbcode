/**
 * MCP Service Types
 *
 * Types for the Model Context Protocol client and tool bridge.
 * These types define the interface between MCP servers and the agent tool system.
 */

/**
 * Transport configuration for connecting to an MCP server.
 */
export interface McpTransportConfig {
  type: 'stdio';
  command: string;
  args: string[];
  env: Record<string, string>;
}

/**
 * An MCP tool as reported by an MCP server.
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, McpToolProperty>;
    required?: string[];
  };
}

/**
 * Property schema for an MCP tool parameter.
 */
export interface McpToolProperty {
  type: string;
  description: string;
  enum?: string[];
}

/**
 * Result from executing an MCP tool.
 */
export interface McpToolResult {
  success: boolean;
  content: unknown;
  error?: string;
}

/**
 * Connection state for an MCP server.
 */
export interface McpConnection {
  serverId: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: McpTool[];
  error?: string;
  connectedAt?: string;
}
