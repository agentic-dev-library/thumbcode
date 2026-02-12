# @thumbcode/config

Application configuration, environment variables, constants, and feature flags for ThumbCode.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/config": "workspace:*"
  }
}
```

## Key Exports

### Environment (`@thumbcode/config/env`)

Type-safe access to environment variables via Expo Constants:

- `env` -- Singleton `EnvironmentConfig` with resolved environment values
- `validateEnvironment()` -- Validate required variables at app startup

```typescript
import { env, validateEnvironment } from '@thumbcode/config';

console.log(env.appEnv);   // 'development' | 'staging' | 'production'
console.log(env.isDev);    // true in development
console.log(env.version);  // App version from app.config.ts

const result = validateEnvironment();
if (!result.isValid) {
  console.error('Missing:', result.missing);
}
```

**Types:** `AppEnvironment`, `EnvironmentConfig`, `ValidationResult`

### Constants (`@thumbcode/config/constants`)

Centralized application constants:

| Constant | Description |
|----------|-------------|
| `API_URLS` | Base URLs for GitHub, Anthropic, and OpenAI APIs |
| `GITHUB_OAUTH` | Device Flow OAuth configuration (endpoints, scopes, polling) |
| `SECURE_STORE_KEYS` | Expo SecureStore key names for credentials |
| `STORAGE_KEYS` | AsyncStorage key names for persisted data |
| `GIT_CONFIG` | Default branch, clone depth, fetch intervals |
| `AGENT_CONFIG` | Max concurrent agents, default model, timeouts |
| `UI_CONFIG` | Animation durations, debounce delays, limits |
| `RATE_LIMITS` | Per-provider API rate limits (GitHub, Anthropic, OpenAI) |
| `FILE_LIMITS` | Max file sizes for diffs, context, and clones |
| `SUPPORTED_LANGUAGES` | Languages available for syntax highlighting |

**Types:** `SupportedLanguage`

### Feature Flags (`@thumbcode/config/features`)

Environment-aware feature flag management:

- `isFeatureEnabled(flag)` -- Check if a feature is enabled for the current environment
- `isFeatureEnabledWithOverrides(flag)` -- Same, but respects dev overrides
- `getEnabledFeatures()` -- List all enabled features
- `getFeatureConfig(flag)` -- Get full config for a feature
- `overrideFeature(flag, enabled)` -- Override a flag (development only)
- `clearFeatureOverrides()` -- Clear all overrides

```typescript
import { isFeatureEnabled } from '@thumbcode/config';

if (isFeatureEnabled('multiAgent')) {
  // Show multi-agent UI
}
```

**Available flags:** `devTools`, `analytics`, `crashReporting`, `multiAgent`, `offlineMode`, `i18n`, `darkMode`, `biometricAuth`, `mcpServers`, `gitLabSupport`, `bitbucketSupport`

**Types:** `FeatureFlag`

## Dependencies

- `expo-constants` -- Access to runtime configuration from `app.config.ts`

## Related

- [ThumbCode README](../../README.md)
