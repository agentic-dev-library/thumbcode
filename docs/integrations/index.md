# Integration Guides

ThumbCode integrates with external services for version control, AI capabilities, and extended functionality. This section covers how to set up and configure each integration.

## Available Integrations

| Service | Purpose | Required |
|---------|---------|----------|
| [GitHub](./github.md) | Version control, repository hosting | Yes |
| [Anthropic/OpenAI](./anthropic-openai.md) | AI-powered agents | Yes (one) |
| [MCP Server](./mcp-server.md) | Extended capabilities | Optional |

## BYOK Model

ThumbCode operates on a **Bring Your Own Keys (BYOK)** model:

- **No server required**: All API calls are made directly from your device
- **Your keys, your data**: Credentials are stored locally with hardware encryption
- **Full control**: You manage your own API usage and billing

## Quick Setup

### Minimum Requirements

To use ThumbCode, you need:
1. A **GitHub Personal Access Token** for repository operations
2. Either an **Anthropic API key** OR an **OpenAI API key** for AI agents

### Setup Order

We recommend setting up integrations in this order:

1. **GitHub** - Required for all git operations
2. **Anthropic or OpenAI** - Required for agent functionality
3. **MCP Server** - Optional, for extended capabilities

## Configuration Status

Check your integration status in the app:

```typescript
import { CredentialService } from '@thumbcode/core';

async function checkIntegrations() {
  const status = {
    github: await CredentialService.hasCredential('github'),
    anthropic: await CredentialService.hasCredential('anthropic'),
    openai: await CredentialService.hasCredential('openai'),
  };

  console.log('Integrations:', status);
  // { github: true, anthropic: true, openai: false }
}
```

## Security

All credentials are stored securely:

- **iOS**: Keychain with hardware encryption
- **Android**: EncryptedSharedPreferences + Android Keystore
- **Web**: Encrypted localStorage

See the [Security documentation](../development/security.md) for details.

## Troubleshooting

### Common Issues

**Token validation fails**
- Ensure your token has the required scopes/permissions
- Check that the token hasn't expired
- Verify the token format (e.g., `ghp_` for GitHub)

**Network errors**
- Check your internet connection
- Ensure the service is accessible from your region
- Try toggling airplane mode

**Rate limiting**
- Each service has its own rate limits
- Consider upgrading your API tier if needed
- Implement caching where possible

## Next Steps

Follow the individual integration guides:
- [GitHub Setup](./github.md)
- [Anthropic/OpenAI Setup](./anthropic-openai.md)
- [MCP Server Setup](./mcp-server.md)
