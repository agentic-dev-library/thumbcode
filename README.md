# ThumbCode

> **Code with your thumbs.** A decentralized multi-agent mobile development platform.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge/deploy-status)](https://thumbcode-foundation.netlify.app)

## What is ThumbCode?

ThumbCode is a React Native/Expo application that enables professional software development from your mobile device. Instead of typing every character, you orchestrate AI agents that understand your intent and execute with precision.

### Key Features

- 🤖 **Multi-Agent Teams** — Architect, Implementer, Reviewer, Tester agents working in parallel
- 📱 **Mobile-Native Git** — Full git workflow (clone, commit, push) powered by isomorphic-git
- 🔒 **Credential Sovereignty** — Your API keys never leave your device
- 💬 **Chat-First Interface** — Describe what you want, agents build it
- 🎨 **Warm Technical Design** — Organic paint-daub aesthetics, not cold developer tools

## Documentation

| Document | Description |
|----------|-------------|
| [Project Status](PROJECT-STATUS.md) | 📊 Current status and what's included |
| [Setup Guide](docs/development/SETUP.md) | 🚀 Development guide and structure |
| [Contributing](CONTRIBUTING.md) | 🤝 How to contribute |
| [Vision](docs/vision/VISION.md) | 🎯 Product vision, target users, roadmap |
| [Architecture](docs/development/ARCHITECTURE.md) | 🏗️ Technical architecture, data flow |
| [Onboarding](docs/features/ONBOARDING.md) | 📱 Feature specification for setup flow |
| [Decisions](DECISIONS.md) | 📝 Technical decision registry |
| [Agents](AGENTS.md) | 🤖 Agent coordination protocol |
| [Agent Playbook](docs/agents/CLAUDE.md) | 📚 Complete guide for AI agents |
| [Brand Guidelines](docs/brand/BRAND-GUIDELINES.md) | 🎨 Visual identity guidelines |
| [Types](src/types/index.ts) | 📐 Core TypeScript interfaces |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ |
| UI | React Native 0.76+ |
| Navigation | expo-router 4.x |
| Styling | NativeWind 4.x |
| State | Zustand 5.x |
| Git | isomorphic-git |
| AI | Anthropic Claude |
| Security | expo-secure-store |
| Package Manager | pnpm 10+ |
| Linter/Formatter | Biome 2.3+ |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Expo CLI (`pnpm add -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/agentic-dev-library/thumbcode.git
cd thumbcode

# Install dependencies with pnpm (auto-generates design tokens)
pnpm install

# Start development server
pnpm start
```

### Development

```bash
# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on Web
pnpm web

# Lint & format with Biome (fast!)
pnpm lint              # Check for issues
pnpm lint:fix          # Fix issues
pnpm format            # Format code

# Type checking
pnpm typecheck

# Testing
pnpm test

# Generate design tokens (after editing tokens.json)
pnpm generate:tokens
```

## Project Structure

```
thumbcode/
├── app/                          # Expo Router file-based routes
│   ├── (onboarding)/            # Setup flow
│   ├── (tabs)/                  # Main navigation
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # ✅ Working demo home screen
├── src/
│   ├── components/
│   │   └── ui/                  # ✅ Complete base components
│   ├── hooks/                   # Custom hooks
│   ├── stores/                  # Zustand stores
│   ├── services/                # External integrations
│   ├── types/                   # ✅ TypeScript definitions
│   └── utils/                   # ✅ Design token utilities
├── design-system/
│   ├── tokens.json              # ✅ Design tokens (source of truth)
│   └── generated/               # ✅ Auto-generated CSS/JS
├── docs/                        # ✅ Complete documentation
├── public/assets/               # ✅ Organized brand assets
├── scripts/                     # ✅ Build & utility scripts
└── __tests__/                   # Test suites
```

**Status:** ✅ Fully functioning shell with working demo app. See [PROJECT-STATUS.md](PROJECT-STATUS.md) for details.

## Design System

ThumbCode uses a programmatic design system powered by `design-system/tokens.json`:

### Automatic Token Generation

All design tokens automatically generate:
- CSS custom properties
- Tailwind color configuration
- TypeScript utilities
- React Native constants

```bash
# Edit tokens.json, then run:
npm run generate:tokens
```

### Programmatic Access

```typescript
import { getColor, getSpacing, getFontFamily } from '@/utils/design-tokens';

const primary = getColor('coral', '500');     // #FF7059
const space = getSpacing('4');                // 16px
const font = getFontFamily('display');        // Fraunces, Georgia, serif
```

### Organic Styling

Asymmetric border-radius for "paint daub" aesthetic:

```tsx
<Button className="rounded-[0.5rem_0.75rem_0.625rem_0.875rem]">
  Organic Button
</Button>
```

## For AI Agents

This repository is designed for agentic development. **Read these first:**

1. **[docs/agents/CLAUDE.md](docs/agents/CLAUDE.md)** — Complete agent playbook with brand guidelines
2. **[AGENTS.md](AGENTS.md)** — Coordination protocol, roles, workflow
3. **[DECISIONS.md](DECISIONS.md)** — Technical decisions with rationale
4. **[src/types/index.ts](src/types/index.ts)** — Type contracts to code against
5. **[docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)** — System architecture

### Key Principles

- ✅ Use design tokens programmatically from `tokens.json`
- ✅ Apply organic asymmetric styling (no perfect circles)
- ✅ Follow the Warm Technical color palette (Coral/Teal/Gold)
- ✅ Code against type definitions in `src/types/`
- ❌ NO gradients for backgrounds or buttons
- ❌ NO hardcoded colors - always use tokens

## Contributing

1. Read [AGENTS.md](AGENTS.md) for workflow
2. Check [DECISIONS.md](DECISIONS.md) before proposing changes
3. Follow types in [src/types/](src/types/)
4. Use conventional commits

## License

MIT © ThumbCode Contributors

---

*Built with ❤️ for mobile-first developers.*
