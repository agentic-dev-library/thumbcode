/**
 * MCP Store Tests
 */

import { act, renderHook } from '@testing-library/react';
import {
  CURATED_SUGGESTIONS,
  selectConnectedServers,
  selectDisconnectedServers,
  selectErrorServers,
  selectServerCount,
  selectServers,
  selectServersByCategory,
  useMcpStore,
} from '../mcpStore';

// Reset store before each test
beforeEach(() => {
  useMcpStore.setState({
    servers: [],
    lastError: null,
  });
});

describe('McpStore', () => {
  describe('addServer', () => {
    it('should add a server to the store', () => {
      const { result } = renderHook(() => useMcpStore());

      act(() => {
        result.current.addServer({
          name: 'Context7',
          description: 'Live docs',
          command: 'npx',
          args: ['-y', '@upstash/context7-mcp@latest'],
          env: {},
          capabilities: [],
          category: 'docs',
        });
      });

      expect(result.current.servers).toHaveLength(1);
      expect(result.current.servers[0].name).toBe('Context7');
      expect(result.current.servers[0].status).toBe('disconnected');
      expect(result.current.servers[0].createdAt).toBeDefined();
    });

    it('should return the new server ID', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Test Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      expect(serverId).toMatch(/^mcp-/);
    });
  });

  describe('removeServer', () => {
    it('should remove a server by ID', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Test Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      expect(result.current.servers).toHaveLength(1);

      act(() => {
        result.current.removeServer(serverId);
      });

      expect(result.current.servers).toHaveLength(0);
    });
  });

  describe('updateStatus', () => {
    it('should update server connection status', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Test Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      expect(result.current.servers[0].status).toBe('disconnected');

      act(() => {
        result.current.updateStatus(serverId, 'connected');
      });

      expect(result.current.servers[0].status).toBe('connected');
    });

    it('should set error status', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Broken Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      act(() => {
        result.current.updateStatus(serverId, 'error');
      });

      expect(result.current.servers[0].status).toBe('error');
    });
  });

  describe('updateServer', () => {
    it('should update server properties', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Test Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      act(() => {
        result.current.updateServer(serverId, {
          capabilities: ['read_file', 'write_file'],
          description: 'Updated description',
        });
      });

      expect(result.current.servers[0].capabilities).toEqual(['read_file', 'write_file']);
      expect(result.current.servers[0].description).toBe('Updated description');
    });
  });

  describe('query methods', () => {
    it('getServersByCategory should return servers for a category', () => {
      const { result } = renderHook(() => useMcpStore());

      act(() => {
        result.current.addServer({
          name: 'Docs Server',
          description: 'Docs',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'docs',
        });
        result.current.addServer({
          name: 'Code Server',
          description: 'Code',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'code',
        });
      });

      const docsServers = result.current.getServersByCategory('docs');
      expect(docsServers).toHaveLength(1);
      expect(docsServers[0].name).toBe('Docs Server');
    });

    it('getServerById should return the correct server', () => {
      const { result } = renderHook(() => useMcpStore());

      let serverId = '';
      act(() => {
        serverId = result.current.addServer({
          name: 'Test Server',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
      });

      const server = result.current.getServerById(serverId);
      expect(server?.name).toBe('Test Server');

      const nonexistent = result.current.getServerById('fake-id');
      expect(nonexistent).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useMcpStore());

      act(() => {
        result.current.setError('Connection failed');
      });

      expect(result.current.lastError).toBe('Connection failed');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.lastError).toBeNull();
    });
  });

  describe('bulk operations', () => {
    it('clearAllServers should remove all servers', () => {
      const { result } = renderHook(() => useMcpStore());

      act(() => {
        result.current.addServer({
          name: 'Server 1',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'general',
        });
        result.current.addServer({
          name: 'Server 2',
          description: 'Test',
          command: 'npx',
          args: [],
          env: {},
          capabilities: [],
          category: 'code',
        });
      });

      expect(result.current.servers).toHaveLength(2);

      act(() => {
        result.current.clearAllServers();
      });

      expect(result.current.servers).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      useMcpStore.setState({
        servers: [
          {
            id: 'mcp-1',
            name: 'Context7',
            description: 'Docs',
            command: 'npx',
            args: [],
            env: {},
            status: 'connected',
            capabilities: ['query-docs'],
            category: 'docs',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mcp-2',
            name: 'GitHub',
            description: 'Code',
            command: 'npx',
            args: [],
            env: {},
            status: 'disconnected',
            capabilities: [],
            category: 'code',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mcp-3',
            name: 'Broken',
            description: 'Error',
            command: 'npx',
            args: [],
            env: {},
            status: 'error',
            capabilities: [],
            category: 'testing',
            createdAt: new Date().toISOString(),
          },
        ],
        lastError: null,
      });
    });

    it('selectServers should return all servers', () => {
      const servers = selectServers(useMcpStore.getState());
      expect(servers).toHaveLength(3);
    });

    it('selectServersByCategory should filter by category', () => {
      const docsServers = selectServersByCategory('docs')(useMcpStore.getState());
      expect(docsServers).toHaveLength(1);
      expect(docsServers[0].name).toBe('Context7');
    });

    it('selectConnectedServers should filter connected servers', () => {
      const connected = selectConnectedServers(useMcpStore.getState());
      expect(connected).toHaveLength(1);
      expect(connected[0].status).toBe('connected');
    });

    it('selectDisconnectedServers should filter disconnected servers', () => {
      const disconnected = selectDisconnectedServers(useMcpStore.getState());
      expect(disconnected).toHaveLength(1);
      expect(disconnected[0].name).toBe('GitHub');
    });

    it('selectErrorServers should filter servers with errors', () => {
      const errors = selectErrorServers(useMcpStore.getState());
      expect(errors).toHaveLength(1);
      expect(errors[0].name).toBe('Broken');
    });

    it('selectServerCount should return total count', () => {
      const count = selectServerCount(useMcpStore.getState());
      expect(count).toBe(3);
    });
  });
});

describe('CURATED_SUGGESTIONS', () => {
  it('should have 5 suggestions', () => {
    expect(CURATED_SUGGESTIONS).toHaveLength(5);
  });

  it('should have required fields for each suggestion', () => {
    for (const suggestion of CURATED_SUGGESTIONS) {
      expect(suggestion.id).toBeTruthy();
      expect(suggestion.name).toBeTruthy();
      expect(suggestion.description).toBeTruthy();
      expect(suggestion.command).toBeTruthy();
      expect(suggestion.args).toBeDefined();
      expect(suggestion.envKeys).toBeDefined();
      expect(suggestion.category).toBeTruthy();
      expect(suggestion.icon).toBeTruthy();
      expect(suggestion.installHint).toBeTruthy();
    }
  });

  it('should include Context7, GitHub, 21st.dev Magic, Playwright, and Sequential Thinking', () => {
    const names = CURATED_SUGGESTIONS.map((s) => s.name);
    expect(names).toContain('Context7');
    expect(names).toContain('GitHub');
    expect(names).toContain('21st.dev Magic');
    expect(names).toContain('Playwright');
    expect(names).toContain('Sequential Thinking');
  });

  it('should have unique IDs', () => {
    const ids = CURATED_SUGGESTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid categories', () => {
    const validCategories = ['docs', 'code', 'design', 'testing', 'general'];
    for (const suggestion of CURATED_SUGGESTIONS) {
      expect(validCategories).toContain(suggestion.category);
    }
  });
});
