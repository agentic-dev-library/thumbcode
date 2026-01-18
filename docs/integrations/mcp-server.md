# MCP Server Integration

The Model Context Protocol (MCP) enables ThumbCode to extend its agent capabilities with additional tools and context providers.

## Overview

MCP servers provide additional capabilities to ThumbCode's AI agents:
- **Custom Tools**: Execute specialized operations (database queries, API calls, etc.)
- **Context Providers**: Supply additional context to agents (documentation, codebase info, etc.)
- **Resource Access**: Access external resources not available through standard APIs

## How MCP Works

```
┌─────────────┐     ┌────────────┐     ┌────────────┐
│  ThumbCode  │────▶│ MCP Client │────▶│ MCP Server │
│   Agents    │     │  (built-in)│     │  (custom)  │
└─────────────┘     └────────────┘     └────────────┘
                          │
                          ▼
                    ┌────────────┐
                    │   Tools    │
                    │  Resources │
                    │   Prompts  │
                    └────────────┘
```

MCP servers expose:
- **Tools**: Functions agents can call (e.g., `search_docs`, `query_database`)
- **Resources**: Data agents can read (e.g., documentation, configuration files)
- **Prompts**: Reusable prompt templates for common tasks

## Requirements

- MCP server running and accessible
- Server endpoint URL
- Optional: Authentication credentials

## Configuration

### During Onboarding

MCP configuration is optional during onboarding. You can add servers later:

1. Complete AI provider setup first
2. Navigate to MCP configuration (optional step)
3. Add server details if available

### After Onboarding

To configure MCP servers:

1. Go to **Settings > Integrations > MCP Servers**
2. Tap **Add Server**
3. Enter server details:
   - **Name**: Descriptive name (e.g., "Company Docs")
   - **Endpoint**: Server URL
   - **Authentication**: If required
4. Tap **Connect**

### Programmatic Configuration

```typescript
import { MCPService } from '@thumbcode/core';

const mcp = new MCPService();

// Add a server
await mcp.addServer({
  name: 'company-docs',
  endpoint: 'http://localhost:3100',
  transport: 'stdio', // or 'http'
  auth: {
    type: 'bearer',
    token: 'your-token'
  }
});

// List configured servers
const servers = await mcp.listServers();

// Remove a server
await mcp.removeServer('company-docs');
```

## Transport Types

MCP supports multiple transport mechanisms:

### HTTP Transport

Standard HTTP-based communication:

```typescript
await mcp.addServer({
  name: 'remote-server',
  endpoint: 'https://mcp.example.com/v1',
  transport: 'http',
  auth: {
    type: 'bearer',
    token: process.env.MCP_TOKEN
  }
});
```

### Stdio Transport

For local servers communicating via standard input/output:

```typescript
await mcp.addServer({
  name: 'local-server',
  transport: 'stdio',
  command: 'node',
  args: ['./mcp-server.js']
});
```

**Note**: Stdio transport requires the server to be running on the same device or accessible via a bridge.

## Using MCP Tools

Once configured, agents can use MCP tools automatically:

```typescript
import { AgentOrchestrator } from '@thumbcode/core';

const orchestrator = new AgentOrchestrator();

// Agents automatically discover and use available MCP tools
const task = await orchestrator.assignTask({
  description: 'Search our documentation for authentication patterns',
  type: 'research'
});

// The agent may call MCP tools like:
// - search_docs({ query: 'authentication patterns' })
// - get_resource({ uri: 'docs://auth/overview.md' })
```

### Tool Discovery

```typescript
// List available tools from all servers
const tools = await mcp.listTools();

tools.forEach(tool => {
  console.log(`${tool.name}: ${tool.description}`);
  console.log('  From server:', tool.server);
  console.log('  Parameters:', tool.inputSchema);
});
```

### Direct Tool Invocation

```typescript
// Call a specific tool
const result = await mcp.callTool({
  server: 'company-docs',
  tool: 'search_docs',
  arguments: {
    query: 'user authentication',
    limit: 10
  }
});

console.log('Search results:', result.content);
```

## Using MCP Resources

Resources provide read-only access to data:

```typescript
// List available resources
const resources = await mcp.listResources();

// Read a specific resource
const content = await mcp.readResource({
  server: 'company-docs',
  uri: 'docs://api/authentication.md'
});

console.log('Documentation:', content.text);
```

## Server Examples

### Documentation Server

Provides access to project documentation:

```typescript
await mcp.addServer({
  name: 'project-docs',
  endpoint: 'http://localhost:3100',
  transport: 'http'
});

// Tools available:
// - search_docs: Search documentation
// - get_page: Get specific page
// - list_sections: List documentation sections
```

### Database Query Server

Enables safe database queries:

```typescript
await mcp.addServer({
  name: 'db-reader',
  endpoint: 'http://localhost:3101',
  transport: 'http',
  auth: {
    type: 'bearer',
    token: process.env.DB_MCP_TOKEN
  }
});

// Tools available:
// - query: Execute read-only SQL queries
// - describe_table: Get table schema
// - list_tables: List available tables
```

### Context7 Integration

For up-to-date library documentation:

```typescript
await mcp.addServer({
  name: 'context7',
  endpoint: 'https://api.context7.com/mcp',
  transport: 'http',
  auth: {
    type: 'bearer',
    token: process.env.CONTEXT7_TOKEN
  }
});

// Tools available:
// - resolve-library-id: Find library documentation
// - get-library-docs: Fetch documentation for a library
```

## Security Considerations

### Network Access

MCP servers may require network access:

- **Local servers**: Run on the same device
- **Remote servers**: Require internet connectivity
- **VPN servers**: May need VPN connection

### Authentication

Store MCP credentials securely:

```typescript
import { CredentialService } from '@thumbcode/core';

// Store MCP server credentials
await CredentialService.store('mcp-company-docs', serverToken);

// Retrieve for use
const token = await CredentialService.retrieve('mcp-company-docs');
```

### Permission Scoping

When configuring MCP servers:

1. **Least privilege**: Only enable servers agents need
2. **Read-only when possible**: Prefer read-only tools
3. **Audit logging**: Enable if available on the server

## Error Handling

```typescript
import { MCPError, ErrorCodes } from '@thumbcode/core';

try {
  await mcp.callTool({
    server: 'company-docs',
    tool: 'search_docs',
    arguments: { query: 'test' }
  });
} catch (error) {
  if (error instanceof MCPError) {
    switch (error.code) {
      case ErrorCodes.MCP_SERVER_UNAVAILABLE:
        console.log('Server is not responding');
        break;
      case ErrorCodes.MCP_TOOL_NOT_FOUND:
        console.log('Tool does not exist');
        break;
      case ErrorCodes.MCP_AUTH_FAILED:
        console.log('Authentication failed');
        break;
      case ErrorCodes.MCP_TIMEOUT:
        console.log('Request timed out');
        break;
    }
  }
}
```

## Server Health Monitoring

```typescript
// Check server status
const status = await mcp.getServerStatus('company-docs');

console.log('Connected:', status.connected);
console.log('Last ping:', status.lastPing);
console.log('Tool count:', status.toolCount);

// Reconnect if needed
if (!status.connected) {
  await mcp.reconnect('company-docs');
}
```

## Building Custom MCP Servers

For custom integrations, you can build your own MCP server:

```typescript
// Example: Simple documentation server
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'my-docs-server',
  version: '1.0.0'
});

// Register a tool
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'search_docs',
    description: 'Search documentation',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  }]
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'search_docs') {
    const results = await searchDocumentation(request.params.arguments.query);
    return { content: [{ type: 'text', text: JSON.stringify(results) }] };
  }
});

// Start the server
await server.connect(transport);
```

See the [MCP SDK documentation](https://github.com/modelcontextprotocol/typescript-sdk) for more details.

## Troubleshooting

### Server Not Connecting

**Symptoms**: Server shows as disconnected

**Solutions**:
1. Verify the endpoint URL is correct
2. Check network connectivity
3. Ensure the server is running
4. Verify authentication credentials

### Tool Calls Failing

**Symptoms**: Tool calls return errors

**Solutions**:
1. Check tool name and parameters
2. Verify server has the tool registered
3. Check server logs for errors
4. Ensure proper permissions

### Slow Response Times

**Symptoms**: MCP operations take a long time

**Solutions**:
1. Check network latency to server
2. Optimize server-side operations
3. Consider caching responses
4. Use local servers when possible

## API Reference

### MCPService

```typescript
class MCPService {
  // Server management
  addServer(config: ServerConfig): Promise<void>;
  removeServer(name: string): Promise<void>;
  listServers(): Promise<ServerInfo[]>;
  getServerStatus(name: string): Promise<ServerStatus>;
  reconnect(name: string): Promise<void>;

  // Tools
  listTools(server?: string): Promise<Tool[]>;
  callTool(params: ToolCallParams): Promise<ToolResult>;

  // Resources
  listResources(server?: string): Promise<Resource[]>;
  readResource(params: ResourceParams): Promise<ResourceContent>;
}
```

### Types

```typescript
interface ServerConfig {
  name: string;
  endpoint?: string;
  transport: 'http' | 'stdio';
  command?: string;
  args?: string[];
  auth?: {
    type: 'bearer' | 'basic';
    token?: string;
    username?: string;
    password?: string;
  };
}

interface Tool {
  name: string;
  description: string;
  server: string;
  inputSchema: JSONSchema;
}

interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}
```

## Related

- [ChatService API](../api/chat-service.md) - AI communication
- [AgentOrchestrator API](../api/agent-orchestrator.md) - Agent coordination
- [Anthropic/OpenAI Setup](./anthropic-openai.md) - AI provider configuration
