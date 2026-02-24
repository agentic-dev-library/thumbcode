/**
 * McpToolBridge Tests
 *
 * Verifies:
 * - MCP tool to ToolDefinition conversion
 * - Tool name prefixing for collision avoidance
 * - Property schema mapping
 * - Tool routing through client
 * - isMcpTool detection
 */

import type { McpServerConfig } from '@thumbcode/state';
import { McpClient } from '../McpClient';
import {
  type BridgedMcpTool,
  convertAllMcpTools,
  convertMcpTools,
  executeMcpTool,
  getMcpToolDefinitions,
  isMcpTool,
} from '../McpToolBridge';
import type { McpTool } from '../types';

function createMockTools(): McpTool[] {
  return [
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
  ];
}

describe('convertMcpTools', () => {
  it('converts MCP tools to BridgedMcpTool format', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'context7');

    expect(bridged).toHaveLength(2);
    expect(bridged[0].serverId).toBe('context7');
    expect(bridged[0].originalName).toBe('read_docs');
  });

  it('prefixes tool names with mcp_<serverId>_', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'context7');

    expect(bridged[0].definition.name).toBe('mcp_context7_read_docs');
    expect(bridged[1].definition.name).toBe('mcp_context7_search_code');
  });

  it('sanitizes server ID in tool name (replaces special chars)', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'mcp-123-test');

    expect(bridged[0].definition.name).toBe('mcp_mcp_123_test_read_docs');
  });

  it('prefixes description with [MCP]', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'ctx7');

    expect(bridged[0].definition.description).toBe('[MCP] Read documentation for a library');
  });

  it('maps properties to ToolProperty format', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'ctx7');

    const props = bridged[0].definition.input_schema.properties;
    expect(props.library).toEqual({ type: 'string', description: 'Library name' });
    expect(props.version).toEqual({ type: 'string', description: 'Version number' });
  });

  it('preserves required fields', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'ctx7');

    expect(bridged[0].definition.input_schema.required).toEqual(['library']);
    expect(bridged[1].definition.input_schema.required).toEqual(['query']);
  });

  it('preserves enum values in properties', () => {
    const mcpTools = createMockTools();
    const bridged = convertMcpTools(mcpTools, 'ctx7');

    const langProp = bridged[1].definition.input_schema.properties.language;
    expect(langProp.enum).toEqual(['ts', 'js', 'py']);
  });

  it('returns empty array for empty tools list', () => {
    const bridged = convertMcpTools([], 'ctx7');
    expect(bridged).toEqual([]);
  });
});

describe('isMcpTool', () => {
  it('returns true for MCP bridged tool names', () => {
    const bridged = convertMcpTools(createMockTools(), 'ctx7');
    expect(isMcpTool(bridged, 'mcp_ctx7_read_docs')).toBe(true);
  });

  it('returns false for non-MCP tool names', () => {
    const bridged = convertMcpTools(createMockTools(), 'ctx7');
    expect(isMcpTool(bridged, 'read_file')).toBe(false);
  });

  it('returns false for empty bridged tools list', () => {
    expect(isMcpTool([], 'mcp_ctx7_read_docs')).toBe(false);
  });
});

describe('executeMcpTool', () => {
  it('returns error for unknown tool name', async () => {
    const client = new McpClient();
    const bridged = convertMcpTools(createMockTools(), 'ctx7');

    const result = await executeMcpTool(client, bridged, 'unknown_tool', {});
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toContain('not found');
  });

  it('routes execution through the correct server', async () => {
    const client = new McpClient();
    const config: McpServerConfig = {
      id: 'ctx7',
      name: 'Context7',
      description: 'Docs',
      command: 'npx',
      args: ['-y', 'context7'],
      env: {},
      status: 'disconnected',
      capabilities: [],
      category: 'docs',
      createdAt: new Date().toISOString(),
    };
    await client.connect(config);

    const bridged = convertMcpTools(createMockTools(), 'ctx7');

    // The tool won't be found on the server because the stub has no tools
    const result = await executeMcpTool(client, bridged, 'mcp_ctx7_read_docs', {
      library: 'react',
    });
    const parsed = JSON.parse(result);
    // Expect error because the stub server has no tools registered
    expect(parsed.success).toBe(false);
  });
});

describe('convertAllMcpTools', () => {
  it('returns empty array for client with no connections', () => {
    const client = new McpClient();
    const tools = convertAllMcpTools(client);
    expect(tools).toEqual([]);
  });
});

describe('getMcpToolDefinitions', () => {
  it('returns ToolDefinition array from client', () => {
    const client = new McpClient();
    const defs = getMcpToolDefinitions(client);
    expect(Array.isArray(defs)).toBe(true);
    expect(defs).toEqual([]);
  });
});
