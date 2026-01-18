# Environment Configuration Guide

This guide explains how to configure your ThumbCode development environment.

## Quick Start

Run the automated setup script:

```bash
./scripts/setup.sh
# or
pnpm setup
```

This will:
1. Check for required tools (Node.js 18+, pnpm)
2. Create `.env.local` from `.env.example`
3. Install dependencies
4. Run initial type checks

## Environment Files

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.env.example` | Template with all variables documented | ✅ Yes |
| `.env.local` | Your local development config | ❌ No |
| `.env.staging` | Staging environment (CI/CD) | ❌ No |
| `.env.production` | Production environment (CI/CD) | ❌ No |

> **Important**: Never commit files containing actual secrets. Only `.env.example` should be in git.

## Environment Variables

### Core Settings

```bash
# App environment: development | staging | production
EXPO_PUBLIC_APP_ENV=development

# Enable development tools (React DevTools, debug logging)
EXPO_PUBLIC_ENABLE_DEV_TOOLS=true
```

### GitHub Integration

```bash
# GitHub OAuth App Client ID (required for GitHub auth)
# Create at: https://github.com/settings/developers
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-client-id
```

To create a GitHub OAuth App:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL to: `thumbcode://auth/callback`
4. Copy the Client ID

### EAS Build Configuration

```bash
# Expo project ID (required for EAS builds)
# Find at: https://expo.dev/accounts/[owner]/projects/[project]
EXPO_PROJECT_ID=your-project-id

# Expo account username
EXPO_OWNER=thumbcode
```

### App Store Submission (Production Only)

For iOS App Store:
```bash
EXPO_APPLE_ID=your-apple-id@email.com
EXPO_ASC_APP_ID=123456789
EXPO_APPLE_TEAM_ID=ABCD1234
```

For Google Play Store:
```bash
EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH=./path/to/service-account.json
```

## Using Environment Variables in Code

### Runtime Access

Use the `env` module for type-safe environment access:

```typescript
import { env, validateEnvironment } from '@/lib/env';

// Access values
console.log(env.appEnv); // 'development' | 'staging' | 'production'
console.log(env.isDev);  // true
console.log(env.githubClientId); // 'your-client-id'

// Validate at startup
const { isValid, missing, warnings } = validateEnvironment();
if (!isValid) {
  console.error('Missing env vars:', missing);
}
```

### Feature Flags

```typescript
import { isFeatureEnabled } from '@/lib/env';

if (isFeatureEnabled('devTools')) {
  // Show debug panel
}

if (isFeatureEnabled('analytics')) {
  // Initialize analytics (production only)
}
```

### In app.config.ts

Environment variables are automatically available in the dynamic Expo config:

```typescript
// app.config.ts
export default ({ config }) => ({
  ...config,
  extra: {
    githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
  },
});
```

## Environment-Specific Builds

### Development

```bash
# Start with development config
EXPO_PUBLIC_APP_ENV=development pnpm dev
```

### Staging

```bash
# Build for staging
EXPO_PUBLIC_APP_ENV=staging eas build --profile preview
```

### Production

```bash
# Build for production
EXPO_PUBLIC_APP_ENV=production eas build --profile production
```

## EAS Secrets Management

For CI/CD builds, configure secrets in EAS:

```bash
# Set a secret
eas secret:create --name EXPO_PUBLIC_GITHUB_CLIENT_ID --value "your-client-id"

# List secrets
eas secret:list

# Delete a secret
eas secret:delete EXPO_PUBLIC_GITHUB_CLIENT_ID
```

See [EAS Secrets Documentation](https://docs.expo.dev/build-reference/variables/) for more details.

## Troubleshooting

### "Missing environment variable" warnings

Run the validation to see what's missing:

```typescript
import { validateEnvironment } from '@/lib/env';
console.log(validateEnvironment());
```

### GitHub auth not working

1. Verify `EXPO_PUBLIC_GITHUB_CLIENT_ID` is set
2. Check the OAuth App callback URL matches `thumbcode://auth/callback`
3. Ensure the app is using the dev or staging scheme

### EAS build failing

1. Verify `EXPO_PROJECT_ID` is set correctly
2. Run `eas whoami` to check authentication
3. Check EAS secrets are configured: `eas secret:list`

## Security Best Practices

1. **Never commit secrets** - Use `.gitignore` for all env files except `.env.example`
2. **Use BYOK model** - Users provide their own API keys at runtime
3. **Rotate regularly** - Especially OAuth client secrets
4. **Audit access** - Review who has access to EAS secrets
5. **Use SecureStore** - For runtime credential storage (see CredentialService)

## Related Documentation

- [EAS Build Variables](https://docs.expo.dev/build-reference/variables/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Credential Service](../../src/services/credentials/README.md) - Runtime credential storage
