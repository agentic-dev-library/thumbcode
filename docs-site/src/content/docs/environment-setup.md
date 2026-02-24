---
title: Environment Setup
description: Set up your development environment for contributing to ThumbCode.
---

This guide helps you set up a local development environment for contributing to ThumbCode.

## Prerequisites

### Required Software

- **Node.js** 20.x or later ([nvm recommended](https://github.com/nvm-sh/nvm))
- **pnpm** 10.x or later (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Git** 2.x or later
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)

### Recommended Tools

- **VS Code** with the following extensions:
  - Biome (linting + formatting)
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/jbcom/thumbcode.git
cd thumbcode
```

### 2. Set Node Version

If you use nvm, the project includes an `.nvmrc` file:

```bash
nvm use
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# GitHub OAuth App Client ID (for Device Flow)
VITE_GITHUB_CLIENT_ID=your_client_id

# Optional: API keys for testing
# VITE_ANTHROPIC_KEY=sk-ant-...
# VITE_OPENAI_KEY=sk-...
```

### 5. Start the Development Server

```bash
pnpm dev
```

This starts the Vite development server at http://localhost:5173.

## Project Structure

```
thumbcode/
├── src/
│   ├── pages/             # React Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state stores
│   ├── services/          # Service layer
│   └── lib/               # Utilities
├── design-system/         # Design tokens (JSON, TS, CSS)
├── ios/                   # Capacitor iOS project
├── android/               # Capacitor Android project
├── docs/                  # Documentation source
└── docs-site/             # Astro documentation site
```

## Common Commands

```bash
# Start Vite dev server
pnpm dev

# Build for production
pnpm build

# Sync to native projects
pnpm cap:sync

# Open native IDEs
pnpm cap:open:ios
pnpm cap:open:android

# Run type checking
pnpm typecheck

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Check code duplication
pnpm lint:duplication
```

## Troubleshooting

### Vite cache issues

```bash
rm -rf node_modules/.vite && pnpm dev
```

### iOS build failures

```bash
cd ios/App && pod install && cd ../..
pnpm cap:sync
```

### Android build failures

Open Android Studio, sync Gradle, then retry.

## Next Steps

- Read the [Architecture Guide](/thumbcode/about/architecture/)
- Review the [Brand Guidelines](/thumbcode/brand/guidelines/)
- Check out [Contributing Guidelines](https://github.com/jbcom/thumbcode/blob/main/CONTRIBUTING.md)
