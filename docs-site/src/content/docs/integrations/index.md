---
title: Integrations
description: Connect ThumbCode with external services.
---

# Integrations

ThumbCode integrates with various external services for git hosting and AI capabilities.

## Git Providers

### GitHub

GitHub is the primary git provider for ThumbCode.

**Features:**
- Device Flow OAuth authentication
- Repository cloning and pushing
- Branch management
- Pull request creation (coming soon)

**Setup:**
1. Go to Settings → Credentials
2. Tap "Connect GitHub"
3. Enter the device code at github.com/login/device
4. Return to the app

See [Quick Start](/thumbcode/quick-start/) for detailed setup instructions.

### GitLab (Planned)

GitLab support is planned for a future release.

### Bitbucket (Planned)

Bitbucket support is planned for a future release.

## AI Providers

ThumbCode supports multiple AI providers for agent capabilities.

### Anthropic (Claude)

Claude is the primary AI model for ThumbCode agents.

**Supported Models:**
- Claude 3.5 Sonnet
- Claude 3 Haiku
- Claude 3 Opus

**Setup:**
1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Go to Settings → Credentials
3. Enter your API key (starts with `sk-ant-`)

### OpenAI (GPT)

OpenAI models are available as an alternative.

**Supported Models:**
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

**Setup:**
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Go to Settings → Credentials
3. Enter your API key (starts with `sk-`)

## MCP Servers (Advanced)

ThumbCode supports Model Context Protocol (MCP) servers for extended capabilities.

**What are MCP Servers?**

MCP servers provide additional tools and context to AI agents, enabling capabilities like:
- Database access
- External API integrations
- Custom tool execution

**Setup:**

MCP server configuration is for advanced users. See the [MCP documentation](https://github.com/anthropics/anthropic-cookbook/tree/main/mcp) for details.

## Security Notes

- All credentials are stored in hardware-backed secure storage
- Credentials never leave your device
- ThumbCode has no server that stores your keys
- You can revoke access at any time by removing credentials
