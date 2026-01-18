# ChatService API

The `ChatService` provides a unified interface for communicating with AI providers (Anthropic and OpenAI). It handles message formatting, streaming, and error handling across providers.

## Overview

```typescript
import { ChatService } from '@thumbcode/core';

const chatService = new ChatService();

const response = await chatService.sendMessage({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Explain this code...' }
  ]
});
```

## Features

- Unified API for Anthropic and OpenAI
- Streaming support for real-time responses
- Automatic credential retrieval
- Conversation history management
- Token usage tracking

## Initialization

```typescript
const chatService = new ChatService(options?: ChatServiceOptions);
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultProvider` | `'anthropic' \| 'openai'` | `'anthropic'` | Default provider |
| `defaultModel` | `string` | - | Default model to use |
| `maxTokens` | `number` | `4096` | Maximum tokens in response |
| `temperature` | `number` | `0.7` | Sampling temperature |

## Methods

### sendMessage

```typescript
async sendMessage(options: SendMessageOptions): Promise<ChatResponse>
```

Sends a message and returns the complete response.

#### SendMessageOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `provider` | `'anthropic' \| 'openai'` | Yes | AI provider |
| `model` | `string` | No | Model to use |
| `messages` | `Message[]` | Yes | Conversation messages |
| `systemPrompt` | `string` | No | System instructions |
| `maxTokens` | `number` | No | Max response tokens |
| `temperature` | `number` | No | Sampling temperature |
| `tools` | `Tool[]` | No | Available tools |

#### Example

```typescript
const response = await chatService.sendMessage({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  systemPrompt: 'You are a helpful coding assistant.',
  messages: [
    { role: 'user', content: 'How do I create a React component?' }
  ],
  maxTokens: 2000,
  temperature: 0.5
});

console.log(response.content);
console.log(`Tokens used: ${response.usage.totalTokens}`);
```

### streamMessage

```typescript
async streamMessage(
  options: SendMessageOptions,
  onChunk: (chunk: StreamChunk) => void
): Promise<ChatResponse>
```

Streams the response for real-time display.

#### StreamChunk

```typescript
interface StreamChunk {
  type: 'text' | 'tool_use' | 'done';
  content?: string;
  toolCall?: ToolCall;
}
```

#### Example

```typescript
let fullResponse = '';

const response = await chatService.streamMessage(
  {
    provider: 'anthropic',
    messages: [{ role: 'user', content: 'Write a poem' }]
  },
  (chunk) => {
    if (chunk.type === 'text') {
      fullResponse += chunk.content;
      setDisplayText(fullResponse);
    }
  }
);

console.log('Stream complete:', response.content);
```

### createConversation

```typescript
createConversation(options?: ConversationOptions): Conversation
```

Creates a managed conversation with history.

#### Example

```typescript
const conversation = chatService.createConversation({
  provider: 'anthropic',
  systemPrompt: 'You are a code reviewer.'
});

// First message
const response1 = await conversation.send('Review this function: ...');

// Follow-up (includes history)
const response2 = await conversation.send('What about error handling?');

// Get full history
const history = conversation.getHistory();
```

## Message Types

### User Message

```typescript
{
  role: 'user',
  content: 'Your message here'
}
```

### Assistant Message

```typescript
{
  role: 'assistant',
  content: 'AI response'
}
```

### System Message

```typescript
// Typically passed via systemPrompt option
systemPrompt: 'You are a helpful assistant...'
```

## Tool Use

ChatService supports tool calling for both providers.

### Defining Tools

```typescript
const tools: Tool[] = [
  {
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file'
        }
      },
      required: ['path']
    }
  }
];
```

### Using Tools

```typescript
const response = await chatService.sendMessage({
  provider: 'anthropic',
  messages: [{ role: 'user', content: 'Read the config.json file' }],
  tools
});

if (response.toolCalls.length > 0) {
  for (const call of response.toolCalls) {
    if (call.name === 'read_file') {
      const fileContent = await readFile(call.arguments.path);

      // Send tool result back
      const followUp = await chatService.sendMessage({
        provider: 'anthropic',
        messages: [
          ...response.messages,
          {
            role: 'tool',
            toolCallId: call.id,
            content: fileContent
          }
        ],
        tools
      });
    }
  }
}
```

## Providers and Models

### Anthropic

| Model | Description | Context |
|-------|-------------|---------|
| `claude-3-5-sonnet-20241022` | Balanced performance | 200K |
| `claude-3-opus-20240229` | Highest capability | 200K |
| `claude-3-haiku-20240307` | Fastest, most economical | 200K |

### OpenAI

| Model | Description | Context |
|-------|-------------|---------|
| `gpt-4o` | Latest multimodal | 128K |
| `gpt-4-turbo` | High capability | 128K |
| `gpt-3.5-turbo` | Fast, economical | 16K |

## Response Structure

```typescript
interface ChatResponse {
  id: string;
  content: string;
  role: 'assistant';
  model: string;
  provider: 'anthropic' | 'openai';
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  toolCalls: ToolCall[];
  finishReason: 'stop' | 'max_tokens' | 'tool_use';
}
```

## Error Handling

```typescript
import { ChatError, ErrorCodes } from '@thumbcode/core';

try {
  await chatService.sendMessage({
    provider: 'anthropic',
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof ChatError) {
    switch (error.code) {
      case ErrorCodes.AUTH_REQUIRED:
        console.log('API key not configured');
        break;
      case ErrorCodes.RATE_LIMITED:
        console.log('Rate limited, please wait');
        break;
      case ErrorCodes.CONTEXT_LENGTH_EXCEEDED:
        console.log('Message too long');
        break;
      case ErrorCodes.NETWORK_ERROR:
        console.log('Network unavailable');
        break;
    }
  }
}
```

## Configuration

### Set Default Provider

```typescript
chatService.setDefaultProvider('openai');
chatService.setDefaultModel('gpt-4o');
```

### Get Available Providers

```typescript
const providers = await chatService.getAvailableProviders();
// Returns providers with configured credentials
// e.g., ['anthropic'] if only Anthropic key is set
```

## Best Practices

1. **Use streaming for long responses**: Provides better UX with real-time feedback.

2. **Manage conversation context**: Use `createConversation` for multi-turn interactions.

3. **Handle rate limits**: Implement exponential backoff for rate limit errors.

4. **Monitor token usage**: Track usage to manage costs.

5. **Provide system prompts**: Clear instructions improve response quality.

6. **Cache responses when appropriate**: Avoid redundant API calls.

## Type Definitions

```typescript
type Provider = 'anthropic' | 'openai';

interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
}

interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ChatServiceOptions {
  defaultProvider?: Provider;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
}
```

## See Also

- [CredentialService](./credential-service.md) - Managing API keys
- [Anthropic/OpenAI Setup](../integrations/anthropic-openai.md) - Provider configuration
- [AgentOrchestrator](./agent-orchestrator.md) - Using chat with agents
