# GitHub Integration

GitHub integration enables ThumbCode to clone, commit, push, and manage repositories directly from your mobile device.

## Overview

ThumbCode uses GitHub Personal Access Tokens (PATs) for authentication. All git operations are performed locally using isomorphic-git, with GitHub as the remote.

## Requirements

- GitHub account
- Personal Access Token with required scopes
- Repository access (public or private with appropriate permissions)

## Creating a Personal Access Token

### Fine-Grained Token (Recommended)

Fine-grained tokens provide more granular permissions and are the recommended approach.

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta)

2. Click **Generate new token**

3. Configure the token:
   - **Token name**: `ThumbCode Mobile`
   - **Expiration**: Choose based on your preference (90 days recommended)
   - **Repository access**: Select repositories you want to access

4. Set permissions:

   | Permission | Access | Required For |
   |------------|--------|--------------|
   | Contents | Read and write | Clone, commit, push |
   | Metadata | Read | Repository info |
   | Pull requests | Read and write | PR operations |
   | Issues | Read and write | Issue management |

5. Click **Generate token** and copy it immediately

### Classic Token

If fine-grained tokens aren't available in your organization:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens)

2. Click **Generate new token (classic)**

3. Select scopes:
   - `repo` - Full control of private repositories
   - `workflow` - If you need to trigger GitHub Actions

4. Click **Generate token** and copy it

## Configuring in ThumbCode

### During Onboarding

When you first open ThumbCode, the onboarding flow will guide you through GitHub setup:

1. Navigate to the GitHub setup screen
2. Paste your Personal Access Token
3. ThumbCode validates the token format
4. Token is stored securely in the device keychain

### After Onboarding

To update or add a GitHub token:

1. Go to **Settings > Integrations > GitHub**
2. Tap **Configure Token**
3. Enter your new token
4. Tap **Save**

### Programmatic Configuration

```typescript
import { CredentialService } from '@thumbcode/core';

// Store GitHub token
const result = await CredentialService.store('github', 'ghp_xxxxxxxxxxxx');

if (result.isValid) {
  console.log('GitHub token saved');
} else {
  console.error('Invalid token:', result.message);
}
```

## Validation

ThumbCode validates GitHub tokens by:

1. **Format check**: Token must start with `ghp_` (classic) or `github_pat_` (fine-grained)
2. **API validation**: Optional call to GitHub API to verify token works

```typescript
// Validate without storing
const validation = await CredentialService.validateCredential(
  'github',
  tokenInput
);

if (!validation.isValid) {
  showError(validation.message);
}
```

## Usage

Once configured, GitHub authentication is automatic:

```typescript
import { GitService } from '@thumbcode/core';

const git = new GitService();

// Clone a repository (uses stored token automatically)
await git.clone({
  url: 'https://github.com/owner/repo.git',
  dir: '/projects/repo'
});

// Push changes (uses stored token automatically)
await git.push();
```

## Token Scopes Reference

### Minimum Required Scopes

| Scope | Purpose |
|-------|---------|
| `repo` (classic) or `Contents: Read/Write` (fine-grained) | Read/write code |
| `metadata` (fine-grained) | Repository metadata |

### Optional Scopes

| Scope | Purpose |
|-------|---------|
| `workflow` | Trigger GitHub Actions |
| `pull_requests` | Create/manage PRs |
| `issues` | Create/manage issues |
| `discussions` | Access discussions |

## Security Best Practices

1. **Use fine-grained tokens**: More secure than classic tokens
2. **Set expiration**: Don't use tokens without expiration
3. **Minimum scopes**: Only grant necessary permissions
4. **Rotate regularly**: Update tokens every 90 days
5. **One token per device**: Use separate tokens for each device

## Device Flow Authentication

ThumbCode also supports GitHub Device Flow for OAuth authentication:

```typescript
import { GitHubAuth } from '@thumbcode/core';

// Start device flow
const auth = await GitHubAuth.startDeviceFlow({
  clientId: 'your-oauth-app-client-id',
  scopes: ['repo']
});

// Show user the code
console.log(`Enter code ${auth.userCode} at ${auth.verificationUri}`);

// Poll for completion
const token = await auth.waitForAuthorization();

// Store the token
await CredentialService.store('github', token);
```

## Troubleshooting

### Token Not Working

**Symptoms**: Push/pull fails with authentication error

**Solutions**:
1. Verify token hasn't expired
2. Check token has required scopes
3. Regenerate token if needed

### Repository Access Denied

**Symptoms**: Can't clone or push to specific repository

**Solutions**:
1. Verify you have access to the repository
2. For fine-grained tokens, ensure repository is selected
3. Check organization SSO requirements

### Rate Limiting

**Symptoms**: Operations fail with rate limit error

**Solutions**:
1. Wait for rate limit to reset (usually 1 hour)
2. Consider using authenticated requests (higher limits)
3. Cache API responses where possible

## Token Storage

Tokens are stored securely:

- **iOS**: Keychain (kSecClassGenericPassword)
- **Android**: EncryptedSharedPreferences

```typescript
// Tokens are never stored in plain text
// Access requires device unlock
const credential = await CredentialService.retrieve('github');
```

## Related

- [GitService API](../api/git-service.md) - Git operations documentation
- [CredentialService API](../api/credential-service.md) - Credential management
- [Security](../development/security.md) - Security implementation details
