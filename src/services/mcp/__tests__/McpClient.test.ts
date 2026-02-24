/**
 * McpClient Tests
 *
 * Verifies:
 * - Connection lifecycle (connect, disconnect)
 * - Tool discovery via AI SDK
 * - Tool execution routing through SDK tools
 * - Status tracking
 * - Error handling
 * - Multi-server management
 * - Transport selection (stdio / HTTP / SSE)
 */

import type { McpServerConfig } from '@/state';
import { type MockInstance, vi } from 'vitest';
import { McpClient } from '../McpClient';

// Mock the AI SDK MCP module
const mockTools = vi.fn();
const mockListTools = vi.fn();
const mockClose = vi.fn().mockResolvedValue(undefined);

vi.mock('@ai-sdk/mcp', () => ({
  createMCPClient: vi.fn().mockImplementation(() =>
    Promise.resolve({
      tools: mockTools,
      listTools: mockListTools,
      close: mockClose,
    })
  ),
}));

// Mock the stdio transport module
const MockStdioTransport = vi.fn();
vi.mock('@ai-sdk/mcp/mcp-stdio', () => ({
  Experimental_StdioMCPTransport: MockStdioTransport,
}));

function createMockServerConfig(overrides?: Partial<McpServerConfig>): McpServerConfig {
  return {
    id: 'test-server-1',
    name: 'Test Server',
    description: 'A test MCP server',
    command: 'npx',
    args: ['-y', '@test/mcp-server'],
    env: {},
    status: 'disconnected',
    capabilities: [],
    category: 'general',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Set up mock SDK responses with two tools. */
function setupMockToolResponses() {
  const mockExecuteReadDocs = vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'Documentation for react v18' }],
  });
  const mockExecuteSearchCode = vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'Found 3 matches' }],
  });

  mockTools.mockResolvedValue({
    read_docs: { execute: mockExecuteReadDocs },
    search_code: { execute: mockExecuteSearchCode },
  });

  mockListTools.mockResolvedValue({
    tools: [
      {
        name: 'read_docs',
        description: 'Read documentation for a library',
        inputSchema: {
          type: 'object',
          properties: {
            library: { type: 'string', description: 'Library name' },
            version: { type: 'string', description: 'Version number' },
          },
          required: ['library'],
        },
      },
      {
        name: 'search_code',
        description: 'Search code in a repository',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            language: { type: 'string', description: 'Language filter', enum: ['ts', 'js', 'py'] },
          },
          required: ['query'],
        },
      },
    ],
  });

  return { mockExecuteReadDocs, mockExecuteSearchCode };
}

describe('McpClient', () => {
  let client: McpClient;

  beforeEach(() => {
    client = new McpClient();
    vi.clearAllMocks();
    setupMockToolResponses();
  });

  describe('connect', () => {
    it('connects to a server and sets status to connected', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      expect(client.getStatus(config.id)).toBe('connected');
    });

    it('stores the connection with connectedAt timestamp', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const connection = client.getConnection(config.id);
      expect(connection).toBeDefined();
      expect(connection?.connectedAt).toBeDefined();
      expect(connection?.serverId).toBe(config.id);
    });

    it('discovers tools during connection', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const toolNames = client.listTools(config.id);
      expect(toolNames).toEqual(['read_docs', 'search_code']);
    });

    it('uses StdioMCPTransport for stdio transport (default)', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      expect(MockStdioTransport).toHaveBeenCalledWith({
        command: 'npx',
        args: ['-y', '@test/mcp-server'],
        env: {},
      });
    });

    it('uses HTTP transport config when transport is http', async () => {
      const { createMCPClient } = await import('@ai-sdk/mcp');

      const config = createMockServerConfig({
        transport: 'http',
        url: 'https://mcp.example.com/api',
      });
      await client.connect(config);

      expect(createMCPClient).toHaveBeenCalledWith({
        transport: { type: 'http', url: 'https://mcp.example.com/api' },
      });
    });

    it('uses SSE transport config when transport is sse', async () => {
      const { createMCPClient } = await import('@ai-sdk/mcp');

      const config = createMockServerConfig({
        transport: 'sse',
        url: 'https://mcp.example.com/sse',
      });
      await client.connect(config);

      expect(createMCPClient).toHaveBeenCalledWith({
        transport: { type: 'sse', url: 'https://mcp.example.com/sse' },
      });
    });

    it('throws when HTTP/SSE transport has no URL', async () => {
      const config = createMockServerConfig({ transport: 'http' });
      await expect(client.connect(config)).rejects.toThrow('URL required for http transport');
    });

    it('sets error status on connection failure', async () => {
      const { createMCPClient } = await import('@ai-sdk/mcp');
      (createMCPClient as unknown as MockInstance).mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const config = createMockServerConfig();
      await expect(client.connect(config)).rejects.toThrow('Connection refused');

      expect(client.getStatus(config.id)).toBe('error');
      const conn = client.getConnection(config.id);
      expect(conn?.error).toBe('Connection refused');
    });
  });

  describe('disconnect', () => {
    it('disconnects a connected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      expect(client.getStatus(config.id)).toBe('connected');

      client.disconnect(config.id);
      expect(client.getStatus(config.id)).toBe('disconnected');
    });

    it('removes connection from tracked connections', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      client.disconnect(config.id);
      expect(client.getConnection(config.id)).toBeUndefined();
    });

    it('calls close() on the SDK client', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      client.disconnect(config.id);
      expect(mockClose).toHaveBeenCalled();
    });

    it('handles disconnecting a non-existent server gracefully', () => {
      expect(() => client.disconnect('nonexistent')).not.toThrow();
    });
  });

  describe('listTools', () => {
    it('returns empty array for disconnected server', () => {
      expect(client.listTools('nonexistent')).toEqual([]);
    });

    it('returns tool names from connected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      const tools = client.listTools(config.id);
      expect(tools).toEqual(['read_docs', 'search_code']);
    });

    it('returns a copy of tool names (not the internal reference)', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const tools1 = client.listTools(config.id);
      const tools2 = client.listTools(config.id);
      expect(tools1).not.toBe(tools2);
      expect(tools1).toEqual(tools2);
    });
  });

  describe('listAllTools', () => {
    it('returns tools from all connected servers', async () => {
      const config1 = createMockServerConfig({ id: 'server-1' });
      const config2 = createMockServerConfig({ id: 'server-2' });
      await client.connect(config1);
      await client.connect(config2);

      const allTools = client.listAllTools();
      expect(allTools).toEqual(['read_docs', 'search_code', 'read_docs', 'search_code']);
    });

    it('returns empty array when no servers connected', () => {
      expect(client.listAllTools()).toEqual([]);
    });
  });

  describe('getServerTools', () => {
    it('returns raw tool definitions from connected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const serverTools = client.getServerTools(config.id);
      expect(serverTools).toHaveLength(2);
      expect(serverTools[0].name).toBe('read_docs');
      expect(serverTools[0].description).toBe('Read documentation for a library');
      expect(serverTools[0].inputSchema.type).toBe('object');
    });

    it('returns empty array for disconnected server', () => {
      expect(client.getServerTools('nonexistent')).toEqual([]);
    });
  });

  describe('executeTool', () => {
    it('returns error for non-existent server', async () => {
      const result = await client.executeTool('nonexistent', 'some_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Server not found');
    });

    it('returns error for disconnected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      client.disconnect(config.id);

      const result = await client.executeTool(config.id, 'some_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Server not found');
    });

    it('returns error for non-existent tool on connected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const result = await client.executeTool(config.id, 'nonexistent_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool not found');
    });

    it('executes a tool and returns text content', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const result = await client.executeTool(config.id, 'read_docs', { library: 'react' });
      expect(result.success).toBe(true);
      expect(result.content).toBe('Documentation for react v18');
    });

    it('handles tool execution errors', async () => {
      const mockExecute = vi.fn().mockRejectedValue(new Error('Timeout'));
      mockTools.mockResolvedValueOnce({
        failing_tool: { execute: mockExecute },
      });
      mockListTools.mockResolvedValueOnce({
        tools: [
          {
            name: 'failing_tool',
            description: 'A tool that fails',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      });

      const config = createMockServerConfig({ id: 'fail-server' });
      await client.connect(config);

      const result = await client.executeTool('fail-server', 'failing_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Timeout');
    });

    it('handles isError flag in SDK response', async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Something went wrong' }],
        isError: true,
      });
      mockTools.mockResolvedValueOnce({
        error_tool: { execute: mockExecute },
      });
      mockListTools.mockResolvedValueOnce({
        tools: [
          {
            name: 'error_tool',
            description: 'Returns an error',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      });

      const config = createMockServerConfig({ id: 'err-server' });
      await client.connect(config);

      const result = await client.executeTool('err-server', 'error_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });

    it('handles toolResult variant from SDK', async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        toolResult: { count: 42, items: ['a', 'b'] },
      });
      mockTools.mockResolvedValueOnce({
        struct_tool: { execute: mockExecute },
      });
      mockListTools.mockResolvedValueOnce({
        tools: [
          {
            name: 'struct_tool',
            description: 'Returns structured data',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      });

      const config = createMockServerConfig({ id: 'struct-server' });
      await client.connect(config);

      const result = await client.executeTool('struct-server', 'struct_tool', {});
      expect(result.success).toBe(true);
      expect(result.content).toEqual({ count: 42, items: ['a', 'b'] });
    });
  });

  describe('getStatus', () => {
    it('returns disconnected for unknown server', () => {
      expect(client.getStatus('unknown')).toBe('disconnected');
    });

    it('returns connected after successful connection', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      expect(client.getStatus(config.id)).toBe('connected');
    });
  });

  describe('hasConnections', () => {
    it('returns false when no servers connected', () => {
      expect(client.hasConnections()).toBe(false);
    });

    it('returns true when at least one server is connected', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      expect(client.hasConnections()).toBe(true);
    });

    it('returns false after all servers disconnected', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      client.disconnect(config.id);
      expect(client.hasConnections()).toBe(false);
    });
  });

  describe('disconnectAll', () => {
    it('disconnects all servers', async () => {
      const config1 = createMockServerConfig({ id: 'server-1' });
      const config2 = createMockServerConfig({ id: 'server-2' });
      await client.connect(config1);
      await client.connect(config2);

      expect(client.hasConnections()).toBe(true);

      client.disconnectAll();
      expect(client.hasConnections()).toBe(false);
      expect(client.getConnections()).toEqual([]);
    });
  });

  describe('getConnections', () => {
    it('returns all tracked connections', async () => {
      const config1 = createMockServerConfig({ id: 'server-1' });
      const config2 = createMockServerConfig({ id: 'server-2' });
      await client.connect(config1);
      await client.connect(config2);

      const connections = client.getConnections();
      expect(connections).toHaveLength(2);
    });

    it('returns empty array when no connections', () => {
      expect(client.getConnections()).toEqual([]);
    });
  });
});
