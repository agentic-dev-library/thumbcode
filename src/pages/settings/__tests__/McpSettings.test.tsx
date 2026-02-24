/**
 * McpSettings Page Tests
 *
 * Verifies the MCP settings page renders connected servers,
 * curated suggestions, and the custom server form.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { McpSettings } from '../McpSettings';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockAddServer = vi.fn(() => 'mcp-test-1');
const mockRemoveServer = vi.fn();

// Track the servers state for dynamic test scenarios
let mockServers: Array<{
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  status: string;
  capabilities: string[];
  category: string;
  createdAt: string;
}> = [];

vi.mock('@/state', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  CURATED_SUGGESTIONS: [
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
  ],
  selectServers: (state: Record<string, unknown>) => state.servers,
  useMcpStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      servers: mockServers,
      addServer: mockAddServer,
      removeServer: mockRemoveServer,
    };
    return selector(state);
  }),
}));

describe('McpSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServers = [];
  });

  it('renders the page heading and description', () => {
    render(<McpSettings />);
    expect(screen.getByText('MCP Servers')).toBeInTheDocument();
    expect(
      screen.getByText('Extend agent capabilities with Model Context Protocol servers')
    ).toBeInTheDocument();
  });

  it('renders suggested servers section', () => {
    render(<McpSettings />);
    expect(screen.getByText('SUGGESTED SERVERS')).toBeInTheDocument();
    expect(screen.getByText('Context7')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Playwright')).toBeInTheDocument();
  });

  it('renders suggestion descriptions', () => {
    render(<McpSettings />);
    expect(screen.getByText('Live library documentation lookup')).toBeInTheDocument();
    expect(screen.getByText('Repository and PR management')).toBeInTheDocument();
  });

  it('shows env key requirements for suggestions that need them', () => {
    render(<McpSettings />);
    expect(screen.getByText('GITHUB_TOKEN')).toBeInTheDocument();
  });

  it('renders Connect buttons for each suggestion', () => {
    render(<McpSettings />);
    const connectButtons = screen.getAllByText('Connect');
    expect(connectButtons.length).toBe(3);
  });

  it('calls addServer when Connect button is clicked', () => {
    render(<McpSettings />);
    const connectButtons = screen.getAllByText('Connect');
    fireEvent.click(connectButtons[0]);
    expect(mockAddServer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Context7',
        command: 'npx',
        category: 'docs',
      })
    );
  });

  it('does not show connected servers section when no servers configured', () => {
    render(<McpSettings />);
    expect(screen.queryByText('CONNECTED SERVERS')).not.toBeInTheDocument();
  });

  it('shows connected servers section when servers exist', () => {
    mockServers = [
      {
        id: 'mcp-1',
        name: 'Context7',
        description: 'Live docs',
        command: 'npx',
        args: [],
        env: {},
        status: 'connected',
        capabilities: ['query-docs', 'resolve-library'],
        category: 'docs',
        createdAt: new Date().toISOString(),
      },
    ];

    render(<McpSettings />);
    expect(screen.getByText('CONNECTED SERVERS')).toBeInTheDocument();
    expect(screen.getByText('2 tools')).toBeInTheDocument();
  });

  it('calls removeServer when remove button is clicked', () => {
    mockServers = [
      {
        id: 'mcp-1',
        name: 'Context7',
        description: 'Live docs',
        command: 'npx',
        args: [],
        env: {},
        status: 'connected',
        capabilities: [],
        category: 'docs',
        createdAt: new Date().toISOString(),
      },
    ];

    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('remove-server-mcp-1'));
    expect(mockRemoveServer).toHaveBeenCalledWith('mcp-1');
  });

  it('shows Add Custom Server button', () => {
    render(<McpSettings />);
    expect(screen.getByTestId('add-custom-server')).toBeInTheDocument();
  });

  it('shows custom server form when Add Custom Server is clicked', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('add-custom-server'));
    expect(screen.getByTestId('custom-server-form')).toBeInTheDocument();
    expect(screen.getByTestId('custom-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('custom-command-input')).toBeInTheDocument();
  });

  it('validates custom server form requires name', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('add-custom-server'));
    fireEvent.click(screen.getByTestId('save-custom-server'));
    expect(screen.getByText('Server name is required')).toBeInTheDocument();
  });

  it('validates custom server form requires command', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('add-custom-server'));
    fireEvent.change(screen.getByTestId('custom-name-input'), {
      target: { value: 'My Server' },
    });
    fireEvent.click(screen.getByTestId('save-custom-server'));
    expect(screen.getByText('Command is required')).toBeInTheDocument();
  });

  it('adds custom server when form is valid', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('add-custom-server'));
    fireEvent.change(screen.getByTestId('custom-name-input'), {
      target: { value: 'My Server' },
    });
    fireEvent.change(screen.getByTestId('custom-command-input'), {
      target: { value: 'npx my-server' },
    });
    fireEvent.click(screen.getByTestId('save-custom-server'));
    expect(mockAddServer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Server',
        command: 'npx my-server',
      })
    );
  });

  it('cancels custom server form', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByTestId('add-custom-server'));
    expect(screen.getByTestId('custom-server-form')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cancel-custom-server'));
    expect(screen.queryByTestId('custom-server-form')).not.toBeInTheDocument();
  });

  it('navigates back to settings when clicking back button', () => {
    render(<McpSettings />);
    fireEvent.click(screen.getByLabelText('Back to settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('renders category badges for suggestions', () => {
    render(<McpSettings />);
    expect(screen.getAllByText('Docs')).toHaveLength(1);
    expect(screen.getAllByText('Code')).toHaveLength(1);
    expect(screen.getAllByText('Testing')).toHaveLength(1);
  });
});
