---
title: Environment Setup
description: Set up your development environment for contributing to ThumbCode.
---

This guide helps you set up a local development environment for contributing to ThumbCode.

## Prerequisites

### Required Software

- **Node.js** 20.x or later ([nvm recommended](https://github.com/nvm-sh/nvm))
- **pnpm** 10.x or later (`npm install -g pnpm`)
- **Git** 2.x or later
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)

### Recommended Tools

- **VS Code** with the following extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
- **Expo Go** app on your mobile device

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/agentic-dev-library/thumbcode.git
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
cp .env.example .env
```

Edit `.env` with your values:

```bash
# GitHub OAuth App Client ID (for Device Flow)
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_client_id

# Optional: API keys for testing
# EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-...
# EXPO_PUBLIC_OPENAI_KEY=sk-...
```

### 5. Start the Development Server

```bash
pnpm dev
```

This starts the Expo development server. You can:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go on your device

## Project Structure

```
thumbcode/
├── app/                    # Expo Router pages
├── src/
│   ├── components/        # Shared components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state stores
│   └── lib/               # Utilities
├── packages/
│   ├── core/              # Core services (Git, Credentials)
│   ├── config/            # Configuration constants
│   └── types/             # Shared TypeScript types
├── docs/                  # Documentation source
└── docs-site/             # Astro documentation site
```

## Common Commands

```bash
# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run tests
pnpm test

# Build for production
pnpm build:production
```

## Troubleshooting

### Metro bundler cache issues

```bash
pnpm start --clear
```

### iOS build failures

```bash
cd ios && pod install && cd ..
```

### Android build failures

Open Android Studio, sync Gradle, then retry.

## Next Steps

- Read the [Architecture Guide](/thumbcode/about/architecture/)
- Review the [Brand Guidelines](/thumbcode/brand/guidelines/)
- Check out [Contributing Guidelines](https://github.com/agentic-dev-library/thumbcode/blob/main/CONTRIBUTING.md)
