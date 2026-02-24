/**
 * MCP Tool Bridge
 *
 * Converts MCP tools into the agent tool format (ToolDefinition).
 * Creates tool handlers that route execution through the McpClient.
 */

import type { ToolDefinition, ToolProperty } from '../ai/types';
import type { McpClient } from './McpClient';
import type { McpTool, McpToolProperty } from './types';

/**
 * An MCP tool converted to agent format with routing metadata.
 */
export interface BridgedMcpTool {
  definition: ToolDefinition;
  serverId: string;
  originalName: string;
}

/**
 * Converts MCP tools from a specific server into agent ToolDefinitions.
 */
export function convertMcpTools(mcpTools: McpTool[], serverId: string): BridgedMcpTool[] {
  return mcpTools.map((tool) => ({
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
      bridged.push(...convertMcpTools(connection.tools, connection.serverId));
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
 * Convert a single MCP tool to an agent ToolDefinition.
 * Prefixes the tool name with "mcp_<serverId>_" to avoid collisions.
 */
function mcpToolToDefinition(tool: McpTool, serverId: string): ToolDefinition {
  const sanitizedServerId = serverId.replace(/[^a-zA-Z0-9]/g, '_');
  const prefixedName = `mcp_${sanitizedServerId}_${tool.name}`;

  const properties: Record<string, ToolProperty> = {};
  for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
    properties[key] = mcpPropertyToToolProperty(prop);
  }

  return {
    name: prefixedName,
    description: `[MCP] ${tool.description}`,
    input_schema: {
      type: 'object',
      properties,
      required: tool.inputSchema.required,
    },
  };
}

/**
 * Convert an MCP property schema to a ToolProperty.
 */
function mcpPropertyToToolProperty(prop: McpToolProperty): ToolProperty {
  return {
    type: prop.type,
    description: prop.description,
    ...(prop.enum ? { enum: prop.enum } : {}),
  };
}
