/**
 * MCP Client
 *
 * Manages connections to MCP (Model Context Protocol) servers via the
 * Vercel AI SDK (@ai-sdk/mcp). Handles transport creation, tool discovery,
 * and tool execution for stdio, HTTP, and SSE transports.
 *
 * The SDK client handles the MCP protocol details — this class manages
 * the connection lifecycle and converts results to our internal format.
 */

import type { ListToolsResult, MCPClient, MCPClientConfig } from '@ai-sdk/mcp';
import { createMCPClient } from '@ai-sdk/mcp';
import type { McpServerConfig } from '@thumbcode/state';
import type { McpConnection, McpToolResult } from './types';

/**
 * Internal connection state including SDK references.
 * The public McpConnection is exposed via getConnection/getConnections.
 */
interface InternalConnection {
  connection: McpConnection;
  sdkClient: MCPClient | null;
  sdkTools: Record<string, { execute: (args: unknown) => Promise<unknown> }>;
  rawToolDefs: ListToolsResult['tools'];
}

export class McpClient {
  private connections: Map<string, InternalConnection> = new Map();

  /**
   * Connect to an MCP server using its configuration.
   * Creates the appropriate transport (stdio/HTTP/SSE), initializes the
   * SDK client, and discovers available tools.
   */
  async connect(config: McpServerConfig): Promise<void> {
    const transportType = config.transport ?? 'stdio';

    try {
      const transport = await this.createTransport(transportType, config);
      const sdkClient = await createMCPClient({ transport });

      const [sdkTools, toolList] = await Promise.all([sdkClient.tools(), sdkClient.listTools()]);

      this.connections.set(config.id, {
        connection: {
          serverId: config.id,
          status: 'connected',
          toolNames: toolList.tools.map((t) => t.name),
          connectedAt: new Date().toISOString(),
        },
        sdkClient,
        sdkTools: sdkTools as unknown as Record<
          string,
          { execute: (args: unknown) => Promise<unknown> }
        >,
        rawToolDefs: toolList.tools,
      });
    } catch (error) {
      this.connections.set(config.id, {
        connection: {
          serverId: config.id,
          status: 'error',
          toolNames: [],
          error: error instanceof Error ? error.message : 'Connection failed',
        },
        sdkClient: null,
        sdkTools: {},
        rawToolDefs: [],
      });
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server and clean up SDK resources.
   */
  disconnect(serverId: string): void {
    const internal = this.connections.get(serverId);
    if (internal?.sdkClient) {
      internal.sdkClient.close().catch(() => {});
    }
    this.connections.delete(serverId);
  }

  /**
   * List tool names available from a connected server.
   */
  listTools(serverId: string): string[] {
    const internal = this.connections.get(serverId);
    if (!internal || internal.connection.status !== 'connected') {
      return [];
    }
    return [...internal.connection.toolNames];
  }

  /**
   * List tool names from all connected servers.
   */
  listAllTools(): string[] {
    const toolNames: string[] = [];
    for (const internal of this.connections.values()) {
      if (internal.connection.status === 'connected') {
        toolNames.push(...internal.connection.toolNames);
      }
    }
    return toolNames;
  }

  /**
   * Get the raw MCP tool definitions for a server.
   * Used by McpToolBridge to convert into agent ToolDefinitions.
   */
  getServerTools(serverId: string): ListToolsResult['tools'] {
    const internal = this.connections.get(serverId);
    if (!internal || internal.connection.status !== 'connected') {
      return [];
    }
    return [...internal.rawToolDefs];
  }

  /**
   * Execute a tool on a connected MCP server via the SDK.
   */
  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<McpToolResult> {
    const internal = this.connections.get(serverId);
    if (!internal) {
      return { success: false, content: null, error: `Server not found: ${serverId}` };
    }

    if (internal.connection.status !== 'connected') {
      return { success: false, content: null, error: `Server not connected: ${serverId}` };
    }

    const tool = internal.sdkTools[toolName];
    if (!tool) {
      return {
        success: false,
        content: null,
        error: `Tool not found: ${toolName} on server ${serverId}`,
      };
    }

    try {
      const result = await tool.execute(args);
      return this.convertCallToolResult(result);
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
    const internal = this.connections.get(serverId);
    if (!internal) {
      return 'disconnected';
    }
    return internal.connection.status;
  }

  /**
   * Get public connection details for a server.
   */
  getConnection(serverId: string): McpConnection | undefined {
    return this.connections.get(serverId)?.connection;
  }

  /**
   * Get all public connections.
   */
  getConnections(): McpConnection[] {
    return [...this.connections.values()].map((ic) => ic.connection);
  }

  /**
   * Check if any servers are connected.
   */
  hasConnections(): boolean {
    for (const internal of this.connections.values()) {
      if (internal.connection.status === 'connected') {
        return true;
      }
    }
    return false;
  }

  /**
   * Disconnect all servers and clean up.
   */
  disconnectAll(): void {
    for (const internal of this.connections.values()) {
      if (internal.sdkClient) {
        internal.sdkClient.close().catch(() => {});
      }
    }
    this.connections.clear();
  }

  /**
   * Create the appropriate transport based on configuration.
   * Stdio transport is dynamically imported to avoid Node.js dependencies
   * in browser/Capacitor environments.
   */
  private async createTransport(
    transportType: string,
    config: McpServerConfig
  ): Promise<MCPClientConfig['transport']> {
    if (transportType === 'http' || transportType === 'sse') {
      if (!config.url) {
        throw new Error(`URL required for ${transportType} transport`);
      }
      return { type: transportType, url: config.url };
    }

    // Default: stdio — dynamically import to avoid bundling Node.js modules
    const { Experimental_StdioMCPTransport } = await import('@ai-sdk/mcp/mcp-stdio');
    return new Experimental_StdioMCPTransport({
      command: config.command,
      args: config.args,
      env: config.env,
    });
  }

  /**
   * Convert a CallToolResult from the SDK into our McpToolResult format.
   * The SDK returns either { content: [...], isError? } or { toolResult: unknown }.
   */
  private convertCallToolResult(result: unknown): McpToolResult {
    if (result === null || result === undefined) {
      return { success: true, content: null };
    }

    const res = result as Record<string, unknown>;

    // Handle { toolResult: unknown } variant
    if ('toolResult' in res) {
      return { success: true, content: res.toolResult };
    }

    // Handle { content: [...], isError?: boolean } variant
    if ('content' in res && Array.isArray(res.content)) {
      const textContent = (res.content as Array<{ type: string; text?: string }>)
        .filter((c) => c.type === 'text' && c.text)
        .map((c) => c.text)
        .join('\n');

      if (res.isError) {
        return {
          success: false,
          content: res.content,
          error: textContent || 'Tool execution returned error',
        };
      }

      return { success: true, content: textContent || res.content };
    }

    // Fallback: return raw result
    return { success: true, content: result };
  }
}
