/**
 * MCP Client
 *
 * Manages connections to MCP (Model Context Protocol) servers.
 * Tracks server connections, available tools, and routes tool execution
 * through the appropriate server.
 *
 * Currently implements a mock/stub transport layer. The interface is
 * designed for future integration with the actual MCP SDK stdio transport.
 */

import type { McpServerConfig } from '@thumbcode/state';
import type { McpConnection, McpTool, McpToolResult, McpTransportConfig } from './types';

export class McpClient {
  private connections: Map<string, McpConnection> = new Map();

  /**
   * Connect to an MCP server using its configuration.
   * Establishes a transport connection and discovers available tools.
   */
  async connect(config: McpServerConfig): Promise<void> {
    const transportConfig: McpTransportConfig = {
      type: 'stdio',
      command: config.command,
      args: config.args,
      env: config.env,
    };

    try {
      // Discover tools from the server
      const tools = await this.discoverTools(transportConfig);

      this.connections.set(config.id, {
        serverId: config.id,
        status: 'connected',
        tools,
        connectedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.connections.set(config.id, {
        serverId: config.id,
        status: 'error',
        tools: [],
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server and clean up resources.
   */
  disconnect(serverId: string): void {
    const connection = this.connections.get(serverId);
    if (connection) {
      this.connections.set(serverId, {
        ...connection,
        status: 'disconnected',
        tools: [],
      });
    }
    this.connections.delete(serverId);
  }

  /**
   * List tools available from a connected server.
   */
  listTools(serverId: string): McpTool[] {
    const connection = this.connections.get(serverId);
    if (!connection || connection.status !== 'connected') {
      return [];
    }
    return [...connection.tools];
  }

  /**
   * List tools from all connected servers.
   */
  listAllTools(): McpTool[] {
    const tools: McpTool[] = [];
    for (const connection of this.connections.values()) {
      if (connection.status === 'connected') {
        tools.push(...connection.tools);
      }
    }
    return tools;
  }

  /**
   * Execute a tool on a connected MCP server.
   */
  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<McpToolResult> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      return { success: false, content: null, error: `Server not found: ${serverId}` };
    }

    if (connection.status !== 'connected') {
      return { success: false, content: null, error: `Server not connected: ${serverId}` };
    }

    const tool = connection.tools.find((t) => t.name === toolName);
    if (!tool) {
      return {
        success: false,
        content: null,
        error: `Tool not found: ${toolName} on server ${serverId}`,
      };
    }

    try {
      const result = await this.invokeServerTool(serverId, toolName, args);
      return result;
    } catch (error) {
      return {
        success: false,
        content: null,
        error: error instanceof Error ? error.message : `Tool execution failed: ${toolName}`,
      };
    }
  }

  /**
   * Get the connection status of a server.
   */
  getStatus(serverId: string): 'connected' | 'disconnected' | 'error' {
    const connection = this.connections.get(serverId);
    if (!connection) {
      return 'disconnected';
    }
    return connection.status;
  }

  /**
   * Get connection details for a server.
   */
  getConnection(serverId: string): McpConnection | undefined {
    return this.connections.get(serverId);
  }

  /**
   * Get all active connections.
   */
  getConnections(): McpConnection[] {
    return [...this.connections.values()];
  }

  /**
   * Check if any servers are connected.
   */
  hasConnections(): boolean {
    for (const connection of this.connections.values()) {
      if (connection.status === 'connected') {
        return true;
      }
    }
    return false;
  }

  /**
   * Disconnect all servers and clean up.
   */
  disconnectAll(): void {
    for (const serverId of this.connections.keys()) {
      this.disconnect(serverId);
    }
    this.connections.clear();
  }

  /**
   * Discover available tools from an MCP server.
   * Stub implementation - returns mock tools based on the transport config.
   * Will be replaced with actual MCP SDK tool discovery.
   */
  private async discoverTools(_config: McpTransportConfig): Promise<McpTool[]> {
    // Stub: simulate async tool discovery
    await Promise.resolve();

    // Return empty tools by default. Real implementation will query the server.
    return [];
  }

  /**
   * Invoke a tool on an MCP server.
   * Stub implementation - simulates tool execution.
   * Will be replaced with actual MCP SDK tool invocation.
   */
  private async invokeServerTool(
    _serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<McpToolResult> {
    // Stub: simulate async tool invocation
    await Promise.resolve();

    return {
      success: true,
      content: { tool: toolName, args, message: 'Stub execution result' },
    };
  }
}
