# Deployment and Release Process

This document outlines the complete deployment and release process for ThumbCode.

## Table of Contents

- [EAS Build Setup](#eas-build-setup)
  - [iOS Provisioning](#ios-provisioning)
  - [Android Keystore](#android-keystore)
  - [Build Profiles](#build-profiles)
- [Release Process](#release-process)
  - [Release Checklist](#release-checklist)
  - [App Store Submission](#app-store-submission)
  - [Versioning Strategy](#versioning-strategy)
- [Environment Configuration](#environment-configuration)
- [Rollback Procedures](#rollback-procedures)
- [Changelog Generation](#changelog-generation)
- [Web Deployment](#web-deployment)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting Guide](#troubleshooting-guide)

## EAS Build Setup

EAS (Expo Application Services) is used to build and sign the ThumbCode application for both iOS and Android. The configuration is defined in the `eas.json` file.

### iOS Provisioning

EAS handles iOS provisioning (certificates and profiles) automatically. When you run a build for the first time, EAS CLI will prompt you to log in to your Apple Developer account and create the necessary credentials.

The `eas.json` file uses environment variables to link to the correct Apple account and app:

- `EXPO_APPLE_ID`: Your Apple ID email.
- `EXPO_ASC_APP_ID`: Your App Store Connect App ID.
- `EXPO_APPLE_TEAM_ID`: Your Apple Developer Team ID.

These variables should be set in your local environment or as secrets in your CI/CD environment.

```bash
# Set up iOS credentials
eas credentials -p ios

# Or configure via environment
export EXPO_APPLE_ID="developer@thumbcode.app"
export EXPO_ASC_APP_ID="1234567890"
export EXPO_APPLE_TEAM_ID="ABCD1234"
```

### Android Keystore

Similar to iOS, EAS manages the Android keystore. When you first build for Android, EAS generates a new keystore or lets you upload an existing one. This keystore is then stored securely by Expo and used for all subsequent builds.

The `eas.json` file uses an environment variable for the service account key to submit the app to the Play Store:

- `EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH`: Path to your Google Cloud service account JSON key.

```bash
# Set up Android credentials
eas credentials -p android

# Configure service account for Play Store submissions
export EXPO_ANDROID_SERVICE_ACCOUNT_KEY_PATH="./google-service-account.json"
```

### Build Profiles

The `eas.json` file defines three build profiles:

| Profile | Distribution | Use Case | Output |
|---------|-------------|----------|--------|
| `development` | Internal | Development client with debugging | `.apk` (Android) |
| `preview` | Internal | QA testing, stakeholder demos | `.apk` / Simulator |
| `production` | Store | App Store / Play Store release | `.aab` / `.ipa` |

```bash
# Build commands
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile production --platform all
```

## Release Process

### Release Checklist

Before releasing a new version:

- [ ] **Code Quality**
  - [ ] All tests passing (`pnpm test`)
  - [ ] No TypeScript errors (`pnpm typecheck`)
  - [ ] No linting errors (`pnpm lint`)
  - [ ] Code coverage meets threshold (80%+)

- [ ] **Version Bump**
  - [ ] Update version in `app.json`
  - [ ] Update version in `package.json`
  - [ ] Update iOS build number
  - [ ] Update Android version code

- [ ] **Documentation**
  - [ ] CHANGELOG.md updated
  - [ ] README.md updated if needed
  - [ ] API documentation current

- [ ] **Testing**
  - [ ] Manual testing on iOS device
  - [ ] Manual testing on Android device
  - [ ] Performance testing completed
  - [ ] Accessibility audit passed

- [ ] **Build**
  - [ ] Preview build tested by QA
  - [ ] Production build successful
  - [ ] No new warnings in build output

### App Store Submission

#### iOS App Store

```bash
# Build for production
eas build --profile production --platform ios

# Submit to App Store Connect
eas submit --platform ios

# Or submit a specific build
eas submit --platform ios --id <build-id>
```

Required App Store assets:
- App screenshots (6.7", 6.5", 5.5" displays)
- App description (4000 characters max)
- Keywords (100 characters max)
- Privacy policy URL
- Support URL

#### Google Play Store

```bash
# Build for production (AAB format)
eas build --profile production --platform android

# Submit to Google Play
eas submit --platform android

# Submit to internal testing track
eas submit --platform android --track internal
```

Required Play Store assets:
- Feature graphic (1024x500)
- Screenshots (phone, 7" tablet, 10" tablet)
- Short description (80 characters max)
- Full description (4000 characters max)
- Privacy policy URL

### Versioning Strategy

ThumbCode follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Version Part | When to Increment |
|-------------|-------------------|
| MAJOR | Breaking changes, major rewrites |
| MINOR | New features, backwards compatible |
| PATCH | Bug fixes, minor improvements |

**Build numbers:**
- iOS: Increment for every App Store submission
- Android: Increment for every Play Store submission

```typescript
// app.json
{
  "expo": {
    "version": "1.2.0",
    "ios": {
      "buildNumber": "42"
    },
    "android": {
      "versionCode": 42
    }
  }
}
```

## Environment Configuration

ThumbCode uses environment variables for configuration. Environment-specific values are managed through EAS build profiles.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_URL` | Base API URL (if any) | No |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry error tracking | No |
| `EXPO_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | No |

### Build-time Configuration

Environment variables are embedded at build time through `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.thumbcode.app",
        "EXPO_PUBLIC_SENTRY_DSN": "https://xxx@sentry.io/xxx"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.thumbcode.app"
      }
    }
  }
}
```

### Secrets Management

Sensitive values should be stored as EAS secrets:

```bash
# Add a secret
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "xxx"

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name SENTRY_AUTH_TOKEN
```

## Rollback Procedures

### OTA Updates (Expo Updates)

For minor issues, use over-the-air updates to rollback:

```bash
# Publish a rollback update
eas update --branch production --message "Rollback to previous version"

# Or republish a specific previous update
eas update:republish --group <update-group-id>
```

### Full App Rollback

For critical issues requiring a full app rollback:

1. **Identify the stable version** in build history:
   ```bash
   eas build:list --platform all --limit 10
   ```

2. **Resubmit the stable build**:
   ```bash
   eas submit --platform ios --id <stable-build-id>
   eas submit --platform android --id <stable-build-id>
   ```

3. **Request expedited review** (iOS):
   - Contact App Review through App Store Connect
   - Explain the critical issue requiring rollback

### Emergency Procedures

For security vulnerabilities or data-affecting bugs:

1. **Disable affected functionality** via feature flags
2. **Push OTA update** to disable feature
3. **Prepare hotfix branch** from stable tag
4. **Build and submit** expedited release
5. **Monitor** error rates and user reports

## Changelog Generation

ThumbCode uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic changelog generation.

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Generating Changelog

```bash
# Generate changelog for next release
pnpm changelog

# Or using standard-version
npx standard-version

# Preview what would be generated
npx standard-version --dry-run
```

### CHANGELOG.md Format

```markdown
# Changelog

## [1.2.0] - 2026-01-18

### Features
- feat(agents): add multi-agent workspace view
- feat(git): support for git worktrees

### Bug Fixes
- fix(auth): resolve GitHub PKCE token refresh
- fix(ui): correct dark mode color contrast

### Documentation
- docs(readme): update installation instructions
```

## Web Deployment

ThumbCode's documentation and web presence are deployed to multiple platforms.

### GitHub Pages

Documentation site is automatically deployed via GitHub Actions:

```yaml
# .github/workflows/docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
    paths: ['docs/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build docs
        run: pnpm docs:build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vitepress/dist
```

### Netlify

Marketing site and landing pages are deployed to Netlify:

**Configuration (`netlify.toml`):**

```toml
[build]
  command = "pnpm build:web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "preview" }
```

**Deploy commands:**

```bash
# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod

# Trigger build via webhook
curl -X POST https://api.netlify.com/build_hooks/<hook-id>
```

## CI/CD Pipeline

ThumbCode uses GitHub Actions for continuous integration and deployment.

### Pipeline Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Commit    │───▶│    Test     │───▶│   Build     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Lint +    │    │  Preview    │
                   │  Typecheck  │    │   Deploy    │
                   └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Coverage   │    │  Store      │
                   │   Report    │    │  Submit     │
                   └─────────────┘    └─────────────┘
```

### Workflow Configuration

**Main CI workflow (`.github/workflows/ci.yml`):**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile preview --platform all --non-interactive
```

### EAS Build Triggers

Configure automatic builds on merge to main:

```json
// eas.json
{
  "build": {
    "production": {
      "autoIncrement": "version",
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "{{ EXPO_APPLE_ID }}",
        "ascAppId": "{{ EXPO_ASC_APP_ID }}"
      },
      "android": {
        "track": "production"
      }
    }
  }
}
```

## Troubleshooting Guide

### Build Failures

**iOS build fails with provisioning error:**

```bash
# Clear credentials and reconfigure
eas credentials -p ios
# Select "Remove existing" when prompted
# Then set up new credentials
```

**Android build fails with keystore error:**

```bash
# View current keystore configuration
eas credentials -p android

# If keystore is corrupted, create new one
# Warning: This will require a new app listing
```

**Build times out:**

- Check EAS status: https://status.expo.dev
- Reduce build size by excluding dev dependencies
- Use `--local` flag for local builds during debugging

### Submission Failures

**iOS rejection for metadata issues:**

1. Check rejection email for specific issues
2. Update screenshots/descriptions as needed
3. Resubmit with no code changes

**Android rejection for policy violation:**

1. Review Google Play policies
2. Update privacy policy if needed
3. Ensure all permissions are justified

### OTA Update Issues

**Updates not being received:**

```javascript
// Debug update status
import * as Updates from 'expo-updates';

async function checkUpdates() {
  const update = await Updates.checkForUpdateAsync();
  console.log('Update available:', update.isAvailable);

  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  }
}
```

**Updates causing crashes:**

1. Immediately publish a rollback update
2. Check Sentry/error monitoring for crash reports
3. Review changes since last stable update

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `EAS_BUILD_TIMEOUT` | Build exceeded time limit | Optimize build, try again |
| `CREDENTIALS_MISSING` | No credentials configured | Run `eas credentials` |
| `SUBMIT_FAILED` | Submission rejected | Check rejection email |
| `UPDATE_FAILED` | OTA update failed | Check network, retry |

### Getting Help

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Expo Forums**: https://forums.expo.dev
- **GitHub Issues**: https://github.com/expo/expo/issues
- **Discord**: https://chat.expo.dev

## Related Documentation

- [Development Setup](./DEVELOPMENT.md) - Local development environment
- [Testing Guide](./TESTING.md) - Testing strategies
- [Security](./security.md) - Security implementation details
