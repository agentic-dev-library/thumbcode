# CredentialService API

The `CredentialService` provides secure credential storage using hardware-backed encryption via `expo-secure-store`. It manages API keys and tokens for AI providers, GitHub, and other services.

## Overview

```typescript
import { CredentialService } from '@thumbcode/core';

// Store a credential
await CredentialService.store('anthropic', 'sk-ant-api03-...');

// Retrieve a credential
const credential = await CredentialService.retrieve('anthropic');
```

## Features

- Hardware-backed encryption (Keychain on iOS, Keystore on Android)
- Biometric authentication support
- Automatic validation of credential formats
- Type-safe credential management

## Credential Types

ThumbCode supports the following credential types:

| Type | Key Format | Description |
|------|------------|-------------|
| `anthropic` | `sk-ant-*` | Anthropic API key for Claude |
| `openai` | `sk-*` | OpenAI API key |
| `github` | `ghp_*` or `github_pat_*` | GitHub Personal Access Token |
| `mcp_signing_secret` | Any string | MCP server signing secret |

## Methods

### store

```typescript
static async store(
  type: CredentialType,
  secret: string
): Promise<StoreResult>
```

Validates and stores a credential securely.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `CredentialType` | Type of credential |
| `secret` | `string` | The credential value |

#### Returns

```typescript
interface StoreResult {
  isValid: boolean;
  message?: string;
}
```

#### Example

```typescript
const result = await CredentialService.store('anthropic', 'sk-ant-api03-xxxxx');

if (result.isValid) {
  console.log('Credential stored successfully');
} else {
  console.error('Invalid credential:', result.message);
}
```

### retrieve

```typescript
static async retrieve(
  type: CredentialType
): Promise<RetrieveResult>
```

Retrieves a stored credential.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `CredentialType` | Type of credential to retrieve |

#### Returns

```typescript
interface RetrieveResult {
  secret: string | null;
  exists: boolean;
}
```

#### Example

```typescript
const credential = await CredentialService.retrieve('github');

if (credential.exists && credential.secret) {
  // Use the credential
  const headers = {
    Authorization: `Bearer ${credential.secret}`
  };
} else {
  // Prompt user to configure credential
  console.log('GitHub token not configured');
}
```

### delete

```typescript
static async delete(type: CredentialType): Promise<void>
```

Removes a stored credential.

#### Example

```typescript
await CredentialService.delete('openai');
console.log('OpenAI key removed');
```

### validateCredential

```typescript
static async validateCredential(
  type: CredentialType,
  secret: string
): Promise<ValidationResult>
```

Validates a credential without storing it.

#### Returns

```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string;
}
```

#### Example

```typescript
const validation = await CredentialService.validateCredential(
  'anthropic',
  userInput
);

if (validation.isValid) {
  // Proceed with storing
  await CredentialService.store('anthropic', userInput);
} else {
  // Show error to user
  setError(validation.message);
}
```

### hasCredential

```typescript
static async hasCredential(type: CredentialType): Promise<boolean>
```

Checks if a credential exists without retrieving it.

#### Example

```typescript
const hasGitHub = await CredentialService.hasCredential('github');

if (!hasGitHub) {
  navigation.navigate('GitHubSetup');
}
```

### listConfiguredCredentials

```typescript
static async listConfiguredCredentials(): Promise<CredentialType[]>
```

Returns a list of all configured credential types.

#### Example

```typescript
const configured = await CredentialService.listConfiguredCredentials();
// ['anthropic', 'github']

const missing = ['anthropic', 'openai', 'github'].filter(
  type => !configured.includes(type)
);
console.log('Missing credentials:', missing);
```

## Validation Rules

### Anthropic Keys

- Must start with `sk-ant-`
- Minimum length: 40 characters

### OpenAI Keys

- Must start with `sk-`
- Minimum length: 40 characters

### GitHub Tokens

- Classic tokens: Must start with `ghp_`
- Fine-grained tokens: Must start with `github_pat_`
- Minimum length: 30 characters

## Security

### Storage Security

Credentials are stored using `expo-secure-store`:

- **iOS**: Stored in the Keychain with `kSecAttrAccessibleWhenUnlocked`
- **Android**: Stored in EncryptedSharedPreferences backed by Android Keystore

### Access Control

```typescript
// Require biometric authentication for access
await CredentialService.store('github', token, {
  requireAuthentication: true
});
```

### Web Platform

On web, credentials are stored in `localStorage` with encryption. For production web apps, consider additional security measures.

## Error Handling

```typescript
import { CredentialError, ErrorCodes } from '@thumbcode/core';

try {
  await CredentialService.retrieve('anthropic');
} catch (error) {
  if (error instanceof CredentialError) {
    switch (error.code) {
      case ErrorCodes.CREDENTIAL_NOT_FOUND:
        console.log('Credential not configured');
        break;
      case ErrorCodes.CREDENTIAL_INVALID:
        console.log('Invalid credential format');
        break;
      case ErrorCodes.AUTH_CANCELLED:
        console.log('Biometric authentication cancelled');
        break;
    }
  }
}
```

## Usage with Other Services

### With GitService

```typescript
import { GitService, CredentialService } from '@thumbcode/core';

// Credentials are automatically used by GitService
await CredentialService.store('github', 'ghp_xxxx');

const git = new GitService();
await git.push(); // Uses stored GitHub token
```

### With ChatService

```typescript
import { ChatService, CredentialService } from '@thumbcode/core';

// Store API keys
await CredentialService.store('anthropic', 'sk-ant-xxxx');

// ChatService retrieves credentials automatically
const chat = new ChatService();
await chat.sendMessage({
  provider: 'anthropic',
  messages: [{ role: 'user', content: 'Hello' }]
});
```

## Best Practices

1. **Validate before storing**: Always use `validateCredential` before `store` to provide immediate feedback.

2. **Check credentials on app launch**: Verify required credentials exist during initialization.

3. **Handle missing credentials gracefully**: Guide users to setup screens when credentials are missing.

4. **Never log credentials**: Avoid logging credential values, even in development.

5. **Provide clear feedback**: Show users which credentials are configured and their status.

## Type Definitions

```typescript
type CredentialType =
  | 'anthropic'
  | 'openai'
  | 'github'
  | 'mcp_signing_secret';

interface StoreResult {
  isValid: boolean;
  message?: string;
}

interface RetrieveResult {
  secret: string | null;
  exists: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface StoreOptions {
  requireAuthentication?: boolean;
}
```

## See Also

- [GitHub Integration](../integrations/github.md) - Setting up GitHub tokens
- [Anthropic/OpenAI Setup](../integrations/anthropic-openai.md) - Configuring AI providers
- [ChatService](./chat-service.md) - Using credentials with AI services
