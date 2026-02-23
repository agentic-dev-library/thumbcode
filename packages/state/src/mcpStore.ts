/**
 * MCP Store
 *
 * Manages MCP (Model Context Protocol) server registry.
 * Tracks configured servers, their connection status, and capabilities.
 * Provides curated suggestions for popular MCP servers.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// MCP server category
export type McpCategory = 'docs' | 'code' | 'design' | 'testing' | 'general';

// MCP server connection status
export type McpServerStatus = 'connected' | 'disconnected' | 'error';

// Configured MCP server
export interface McpServerConfig {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  status: McpServerStatus;
  capabilities: string[];
  icon?: string;
  category: McpCategory;
  createdAt: string;
}

// Suggested MCP server for one-tap setup
export interface McpSuggestion {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  envKeys: string[];
  category: McpCategory;
  icon: string;
  installHint: string;
}

// Curated list of recommended MCP servers
export const CURATED_SUGGESTIONS: McpSuggestion[] = [
  {
    id: 'context7',
    name: 'Context7',
    description: 'Live library documentation lookup',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
    envKeys: [],
    category: 'docs',
    icon: 'book-open',
    installHint: 'npx -y @upstash/context7-mcp@latest',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository and PR management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envKeys: ['GITHUB_TOKEN'],
    category: 'code',
    icon: 'git-branch',
    installHint: 'npx -y @modelcontextprotocol/server-github',
  },
  {
    id: '21st-dev-magic',
    name: '21st.dev Magic',
    description: 'AI UI component generation',
    command: 'npx',
    args: ['-y', '@21st-dev/magic@latest'],
    envKeys: [],
    category: 'design',
    icon: 'sparkles',
    installHint: 'npx -y @21st-dev/magic@latest',
  },
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation and testing',
    command: 'npx',
    args: ['-y', '@anthropic-ai/mcp-playwright@latest'],
    envKeys: [],
    category: 'testing',
    icon: 'monitor-play',
    installHint: 'npx -y @anthropic-ai/mcp-playwright@latest',
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Enhanced reasoning chains',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    envKeys: [],
    category: 'general',
    icon: 'brain',
    installHint: 'npx -y @modelcontextprotocol/server-sequential-thinking',
  },
];

interface McpState {
  // State
  servers: McpServerConfig[];
  lastError: string | null;

  // Actions
  addServer: (server: Omit<McpServerConfig, 'id' | 'createdAt' | 'status'>) => string;
  removeServer: (serverId: string) => void;
  updateStatus: (serverId: string, status: McpServerStatus) => void;
  updateServer: (serverId: string, updates: Partial<McpServerConfig>) => void;

  // Query actions
  getServersByCategory: (category: McpCategory) => McpServerConfig[];
  getServerById: (serverId: string) => McpServerConfig | undefined;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Bulk operations
  clearAllServers: () => void;
}

export const useMcpStore = create<McpState>()(
  devtools(
    persist(
      immer((set, get) => ({
        servers: [],
        lastError: null,

        addServer: (server) => {
          const serverId = `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          set((state) => {
            state.servers.push({
              ...server,
              id: serverId,
              createdAt: new Date().toISOString(),
              status: 'disconnected',
            });
          });
          return serverId;
        },

        removeServer: (serverId) =>
          set((state) => {
            state.servers = state.servers.filter((s) => s.id !== serverId);
          }),

        updateStatus: (serverId, status) =>
          set((state) => {
            const server = state.servers.find((s) => s.id === serverId);
            if (server) {
              server.status = status;
            }
          }),

        updateServer: (serverId, updates) =>
          set((state) => {
            const server = state.servers.find((s) => s.id === serverId);
            if (server) {
              Object.assign(server, updates);
            }
          }),

        getServersByCategory: (category) => {
          return get().servers.filter((s) => s.category === category);
        },

        getServerById: (serverId) => {
          return get().servers.find((s) => s.id === serverId);
        },

        setError: (error) =>
          set((state) => {
            state.lastError = error;
          }),

        clearError: () =>
          set((state) => {
            state.lastError = null;
          }),

        clearAllServers: () =>
          set((state) => {
            state.servers = [];
          }),
      })),
      {
        name: 'thumbcode-mcp-servers',
      }
    ),
    { name: 'McpStore' }
  )
);

// Selectors for optimal re-renders
export const selectServers = (state: McpState) => state.servers;
export const selectServersByCategory =
  (category: McpCategory) => (state: McpState) =>
    state.servers.filter((s) => s.category === category);
export const selectConnectedServers = (state: McpState) =>
  state.servers.filter((s) => s.status === 'connected');
export const selectDisconnectedServers = (state: McpState) =>
  state.servers.filter((s) => s.status === 'disconnected');
export const selectErrorServers = (state: McpState) =>
  state.servers.filter((s) => s.status === 'error');
export const selectServerCount = (state: McpState) => state.servers.length;
export const selectMcpError = (state: McpState) => state.lastError;
