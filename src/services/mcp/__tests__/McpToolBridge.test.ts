/**
 * McpToolBridge Tests
 *
 * Verifies:
 * - MCP tool to ToolDefinition conversion (from SDK format)
 * - Tool name prefixing for collision avoidance
 * - Property schema mapping from JSON Schema
 * - Tool routing through client
 * - isMcpTool detection
 */

import type { ListToolsResult } from '@ai-sdk/mcp';
import { vi } from 'vitest';
import { McpClient } from '../McpClient';
import {
  convertAllMcpTools,
  convertMcpTools,
  executeMcpTool,
  getMcpToolDefinitions,
  isMcpTool,
} from '../McpToolBridge';

/** Create mock SDK tool definitions matching the ListToolsResult format. */
function createMockServerTools(): ListToolsResult['tools'] {
  return [
    {
      name: 'read_docs',
      description: 'Read documentation for a library',
      inputSchema: {
        type: 'object' as const,
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
        type: 'object' as const,
        properties: {
          query: { type: 'string', description: 'Search query' },
          language: { type: 'string', description: 'Language filter', enum: ['ts', 'js', 'py'] },
        },
        required: ['query'],
      },
    },
  ];
}

// Mock the AI SDK so McpClient can be instantiated in bridge tests
vi.mock('@ai-sdk/mcp', () => ({
  createMCPClient: vi.fn(),
}));
vi.mock('@ai-sdk/mcp/mcp-stdio', () => ({
  Experimental_StdioMCPTransport: vi.fn(),
}));

describe('convertMcpTools', () => {
  it('converts SDK tool definitions to BridgedMcpTool format', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'context7');

    expect(bridged).toHaveLength(2);
    expect(bridged[0].serverId).toBe('context7');
    expect(bridged[0].originalName).toBe('read_docs');
  });

  it('prefixes tool names with mcp_<serverId>_', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'context7');

    expect(bridged[0].definition.name).toBe('mcp_context7_read_docs');
    expect(bridged[1].definition.name).toBe('mcp_context7_search_code');
  });

  it('sanitizes server ID in tool name (replaces special chars)', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'mcp-123-test');

    expect(bridged[0].definition.name).toBe('mcp_mcp_123_test_read_docs');
  });

  it('prefixes description with [MCP]', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'ctx7');

    expect(bridged[0].definition.description).toBe('[MCP] Read documentation for a library');
  });

  it('maps properties to ToolProperty format', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'ctx7');

    const props = bridged[0].definition.input_schema.properties;
    expect(props.library).toEqual({ type: 'string', description: 'Library name' });
    expect(props.version).toEqual({ type: 'string', description: 'Version number' });
  });

  it('preserves required fields', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'ctx7');

    expect(bridged[0].definition.input_schema.required).toEqual(['library']);
    expect(bridged[1].definition.input_schema.required).toEqual(['query']);
  });

  it('preserves enum values in properties', () => {
    const serverTools = createMockServerTools();
    const bridged = convertMcpTools(serverTools, 'ctx7');

    const langProp = bridged[1].definition.input_schema.properties.language;
    expect(langProp.enum).toEqual(['ts', 'js', 'py']);
  });

  it('returns empty array for empty tools list', () => {
    const bridged = convertMcpTools([], 'ctx7');
    expect(bridged).toEqual([]);
  });

  it('handles tools with no properties', () => {
    const tools: ListToolsResult['tools'] = [
      {
        name: 'ping',
        description: 'Ping the server',
        inputSchema: { type: 'object' as const },
      },
    ];
    const bridged = convertMcpTools(tools, 'ctx7');
    expect(bridged[0].definition.input_schema.properties).toEqual({});
  });

  it('falls back to tool name when description is missing', () => {
    const tools: ListToolsResult['tools'] = [
      {
        name: 'my_tool',
        inputSchema: { type: 'object' as const },
      },
    ];
    const bridged = convertMcpTools(tools, 'ctx7');
    expect(bridged[0].definition.description).toBe('[MCP] my_tool');
  });
});

describe('isMcpTool', () => {
  it('returns true for MCP bridged tool names', () => {
    const bridged = convertMcpTools(createMockServerTools(), 'ctx7');
    expect(isMcpTool(bridged, 'mcp_ctx7_read_docs')).toBe(true);
  });

  it('returns false for non-MCP tool names', () => {
    const bridged = convertMcpTools(createMockServerTools(), 'ctx7');
    expect(isMcpTool(bridged, 'read_file')).toBe(false);
  });

  it('returns false for empty bridged tools list', () => {
    expect(isMcpTool([], 'mcp_ctx7_read_docs')).toBe(false);
  });
});

describe('executeMcpTool', () => {
  it('returns error for unknown tool name', async () => {
    const client = new McpClient();
    const bridged = convertMcpTools(createMockServerTools(), 'ctx7');

    const result = await executeMcpTool(client, bridged, 'unknown_tool', {});
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toContain('not found');
  });

  it('routes execution through the correct server', async () => {
    const client = new McpClient();
    // executeTool on a client with no connections returns "Server not found"
    const bridged = convertMcpTools(createMockServerTools(), 'ctx7');

    const result = await executeMcpTool(client, bridged, 'mcp_ctx7_read_docs', {
      library: 'react',
    });
    const parsed = JSON.parse(result);
    // Server 'ctx7' is not connected, so execution fails at the client level
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
