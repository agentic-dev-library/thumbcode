# Anthropic & OpenAI Integration

ThumbCode uses AI providers to power its development agents. You can use Anthropic (Claude) or OpenAI (GPT), or both.

## Overview

At least one AI provider is required for ThumbCode's agent functionality. Both providers offer different models with varying capabilities and costs.

## Anthropic (Claude)

### Getting an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Name your key (e.g., "ThumbCode Mobile")
6. Copy the key (starts with `sk-ant-`)

### Key Format

Anthropic keys follow this format:
- Prefix: `sk-ant-`
- Example: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Available Models

| Model | Strengths | Context | Best For |
|-------|-----------|---------|----------|
| `claude-3-5-sonnet-20241022` | Balanced | 200K | Most tasks |
| `claude-3-opus-20240229` | Highest capability | 200K | Complex tasks |
| `claude-3-haiku-20240307` | Fastest | 200K | Quick tasks |

### Pricing Considerations

Anthropic charges per token:
- Input tokens: Varies by model
- Output tokens: Varies by model

Check [anthropic.com/pricing](https://www.anthropic.com/pricing) for current rates.

## OpenAI (GPT)

### Getting an API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Name your key (e.g., "ThumbCode Mobile")
6. Copy the key (starts with `sk-`)

### Key Format

OpenAI keys follow this format:
- Prefix: `sk-`
- Example: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Available Models

| Model | Strengths | Context | Best For |
|-------|-----------|---------|----------|
| `gpt-4o` | Multimodal, fast | 128K | Most tasks |
| `gpt-4-turbo` | High capability | 128K | Complex tasks |
| `gpt-3.5-turbo` | Fast, economical | 16K | Simple tasks |

### Pricing Considerations

OpenAI charges per token:
- Input tokens: Varies by model
- Output tokens: Varies by model

Check [openai.com/pricing](https://openai.com/pricing) for current rates.

## Configuration in ThumbCode

### During Onboarding

The onboarding flow guides you through AI provider setup:

1. Navigate to the API Keys screen
2. Enter your Anthropic key, OpenAI key, or both
3. Keys are validated automatically
4. Keys are stored securely in device keychain

### After Onboarding

To update or add API keys:

1. Go to **Settings > Integrations > AI Providers**
2. Tap **Anthropic** or **OpenAI**
3. Enter your API key
4. Tap **Save**

### Programmatic Configuration

```typescript
import { CredentialService } from '@thumbcode/core';

// Store Anthropic key
await CredentialService.store('anthropic', 'sk-ant-api03-...');

// Store OpenAI key
await CredentialService.store('openai', 'sk-...');

// Check which providers are configured
const hasAnthropic = await CredentialService.hasCredential('anthropic');
const hasOpenAI = await CredentialService.hasCredential('openai');
```

## Choosing a Provider

### When to Use Anthropic (Claude)

- **Larger context**: 200K tokens vs 128K for GPT-4
- **Detailed reasoning**: Claude excels at step-by-step explanations
- **Coding tasks**: Strong performance on code generation
- **Consistency**: More predictable outputs

### When to Use OpenAI (GPT)

- **Multimodal**: GPT-4o can process images
- **Speed**: Generally faster response times
- **Ecosystem**: More third-party integrations
- **Familiarity**: Widely used and documented

## Setting Default Provider

```typescript
import { ChatService } from '@thumbcode/core';

const chatService = new ChatService({
  defaultProvider: 'anthropic',
  defaultModel: 'claude-3-5-sonnet-20241022'
});
```

## Using Both Providers

ThumbCode can use both providers for different tasks:

```typescript
import { AgentOrchestrator } from '@thumbcode/core';

const orchestrator = new AgentOrchestrator();

// Configure different models for different agents
orchestrator.configure({
  agentModels: {
    architect: { provider: 'anthropic', model: 'claude-3-opus-20240229' },
    implementer: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
    reviewer: { provider: 'openai', model: 'gpt-4o' }
  }
});
```

## Usage and Billing

### Monitoring Usage

Each provider has their own usage dashboard:
- Anthropic: [console.anthropic.com/usage](https://console.anthropic.com/usage)
- OpenAI: [platform.openai.com/usage](https://platform.openai.com/usage)

### Setting Limits

Consider setting spending limits in each provider's dashboard to avoid unexpected charges.

### Estimating Costs

A typical coding session might use:
- 10-50K input tokens (code context)
- 5-20K output tokens (responses)

Calculate costs using each provider's pricing.

## Security

### Key Storage

API keys are stored securely:
- **iOS**: Keychain with hardware encryption
- **Android**: EncryptedSharedPreferences + Keystore

### Best Practices

1. **Use separate keys**: Create keys specifically for ThumbCode
2. **Set spending limits**: Prevent unexpected charges
3. **Rotate keys**: Update keys every few months
4. **Monitor usage**: Check for unusual activity

## Troubleshooting

### Invalid Key Error

**Symptoms**: Key validation fails

**Solutions**:
1. Check key format (`sk-ant-` for Anthropic, `sk-` for OpenAI)
2. Ensure key hasn't been revoked
3. Regenerate key if needed

### Rate Limiting

**Symptoms**: Requests fail with rate limit error

**Solutions**:
1. Wait and retry (usually resets in minutes)
2. Upgrade your API tier if consistently hitting limits
3. Reduce request frequency

### Context Length Exceeded

**Symptoms**: Request fails with context error

**Solutions**:
1. Reduce the size of your messages
2. Summarize conversation history
3. Use a model with larger context

## API Reference

### Validate Key

```typescript
const validation = await CredentialService.validateCredential(
  'anthropic', // or 'openai'
  apiKey
);

if (validation.isValid) {
  await CredentialService.store('anthropic', apiKey);
}
```

### Check Provider Availability

```typescript
import { ChatService } from '@thumbcode/core';

const chat = new ChatService();
const providers = await chat.getAvailableProviders();
// ['anthropic'] if only Anthropic is configured
// ['anthropic', 'openai'] if both are configured
```

## Related

- [ChatService API](../api/chat-service.md) - AI communication
- [AgentOrchestrator API](../api/agent-orchestrator.md) - Multi-agent coordination
- [CredentialService API](../api/credential-service.md) - Credential management
