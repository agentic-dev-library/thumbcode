/**
 * McpClient Tests
 *
 * Verifies:
 * - Connection lifecycle (connect, disconnect)
 * - Tool discovery and listing
 * - Tool execution routing
 * - Status tracking
 * - Error handling
 * - Multi-server management
 */

import type { McpServerConfig } from '@thumbcode/state';
import { McpClient } from '../McpClient';

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

describe('McpClient', () => {
  let client: McpClient;

  beforeEach(() => {
    client = new McpClient();
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

      const tools = client.listTools(config.id);
      // Stub returns empty tools
      expect(tools).toEqual([]);
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

    it('handles disconnecting a non-existent server gracefully', () => {
      expect(() => client.disconnect('nonexistent')).not.toThrow();
    });
  });

  describe('listTools', () => {
    it('returns empty array for disconnected server', () => {
      expect(client.listTools('nonexistent')).toEqual([]);
    });

    it('returns tools from connected server', async () => {
      const config = createMockServerConfig();
      await client.connect(config);
      const tools = client.listTools(config.id);
      expect(Array.isArray(tools)).toBe(true);
    });

    it('returns a copy of tools array (not the internal reference)', async () => {
      const config = createMockServerConfig();
      await client.connect(config);

      const tools1 = client.listTools(config.id);
      const tools2 = client.listTools(config.id);
      expect(tools1).not.toBe(tools2);
    });
  });

  describe('listAllTools', () => {
    it('returns tools from all connected servers', async () => {
      const config1 = createMockServerConfig({ id: 'server-1' });
      const config2 = createMockServerConfig({ id: 'server-2' });
      await client.connect(config1);
      await client.connect(config2);

      const allTools = client.listAllTools();
      expect(Array.isArray(allTools)).toBe(true);
    });

    it('returns empty array when no servers connected', () => {
      expect(client.listAllTools()).toEqual([]);
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
