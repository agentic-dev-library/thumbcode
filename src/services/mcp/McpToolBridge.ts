/**
 * MCP Tool Bridge
 *
 * Converts MCP server tools into the agent tool format (ToolDefinition).
 * Creates tool handlers that route execution through the McpClient,
 * which delegates to the Vercel AI SDK for actual MCP communication.
 */

import type { ListToolsResult } from '@ai-sdk/mcp';
import type { ToolDefinition, ToolProperty } from '../ai/types';
import type { McpClient } from './McpClient';

/**
 * An MCP tool converted to agent format with routing metadata.
 */
export interface BridgedMcpTool {
  definition: ToolDefinition;
  serverId: string;
  originalName: string;
}

/** A single raw tool definition from the MCP server. */
type ServerToolDef = ListToolsResult['tools'][number];

/**
 * Converts MCP tools from a specific server into agent ToolDefinitions.
 * Takes the raw tool definitions from the SDK and adds name prefixing.
 */
export function convertMcpTools(
  serverTools: ListToolsResult['tools'],
  serverId: string
): BridgedMcpTool[] {
  return serverTools.map((tool) => ({
    definition: mcpToolToDefinition(tool, serverId),
    serverId,
    originalName: tool.name,
  }));
}

/**
 * Converts all MCP tools from all connected servers via the client.
 */
export function convertAllMcpTools(client: McpClient): BridgedMcpTool[] {
  const bridged: BridgedMcpTool[] = [];
  for (const connection of client.getConnections()) {
    if (connection.status === 'connected') {
      const serverTools = client.getServerTools(connection.serverId);
      bridged.push(...convertMcpTools(serverTools, connection.serverId));
    }
  }
  return bridged;
}

/**
 * Get just the ToolDefinition array for use with agents.
 */
export function getMcpToolDefinitions(client: McpClient): ToolDefinition[] {
  return convertAllMcpTools(client).map((b) => b.definition);
}

/**
 * Execute an MCP tool by its prefixed name.
 * Returns the tool output as a string for the agent.
 */
export async function executeMcpTool(
  client: McpClient,
  bridgedTools: BridgedMcpTool[],
  toolName: string,
  input: Record<string, unknown>
): Promise<string> {
  const bridged = bridgedTools.find((b) => b.definition.name === toolName);
  if (!bridged) {
    return JSON.stringify({ success: false, error: `MCP tool not found: ${toolName}` });
  }

  const result = await client.executeTool(bridged.serverId, bridged.originalName, input);

  if (!result.success) {
    return JSON.stringify({ success: false, error: result.error });
  }

  return typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
}

/**
 * Check if a tool name belongs to an MCP bridged tool.
 */
export function isMcpTool(bridgedTools: BridgedMcpTool[], toolName: string): boolean {
  return bridgedTools.some((b) => b.definition.name === toolName);
}

/**
 * Convert a single MCP server tool definition to an agent ToolDefinition.
 * Prefixes the tool name with "mcp_<serverId>_" to avoid collisions.
 * Properties are extracted from the JSON Schema inputSchema provided by the MCP server.
 */
function mcpToolToDefinition(tool: ServerToolDef, serverId: string): ToolDefinition {
  const sanitizedServerId = serverId.replace(/[^a-zA-Z0-9]/g, '_');
  const prefixedName = `mcp_${sanitizedServerId}_${tool.name}`;

  const properties: Record<string, ToolProperty> = {};
  const rawProps = (tool.inputSchema.properties ?? {}) as Record<string, Record<string, unknown>>;

  for (const [key, prop] of Object.entries(rawProps)) {
    properties[key] = {
      type: (prop.type as string) ?? 'string',
      description: (prop.description as string) ?? '',
      ...(prop.enum ? { enum: prop.enum as string[] } : {}),
    };
  }

  const schema = tool.inputSchema as { required?: string[] };

  return {
    name: prefixedName,
    description: `[MCP] ${tool.description ?? tool.name}`,
    input_schema: {
      type: 'object',
      properties,
      required: schema.required,
    },
  };
}
