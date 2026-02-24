/**
 * MCP Service Types
 *
 * Types for the Model Context Protocol client and tool bridge.
 * These types define the interface between MCP servers and the agent tool system.
 *
 * Tool schemas and transport are handled by @ai-sdk/mcp — these types
 * cover our internal result format and public connection state.
 */

/**
 * Transport types supported by MCP connections.
 * - stdio: spawns a child process (Node.js only)
 * - http: Streamable HTTP transport
 * - sse: Server-Sent Events transport
 */
export type McpTransportType = 'stdio' | 'http' | 'sse';

/**
 * Result from executing an MCP tool.
 */
export interface McpToolResult {
  success: boolean;
  content: unknown;
  error?: string;
}

/**
 * Connection state for an MCP server (public view).
 * SDK client and tool executables are stored privately in McpClient.
 */
export interface McpConnection {
  serverId: string;
  status: 'connected' | 'disconnected' | 'error';
  toolNames: string[];
  error?: string;
  connectedAt?: string;
}
