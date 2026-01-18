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
| [Vision](docs/vision/VISION.md) | Product vision, target users, roadmap |
| [Architecture](docs/development/ARCHITECTURE.md) | Technical architecture, data flow |
| [Onboarding](docs/features/ONBOARDING.md) | Feature specification for setup flow |
| [Decisions](DECISIONS.md) | Technical decision registry |
| [Agents](AGENTS.md) | Agent coordination protocol |
| [Brand](docs/brand/BRAND-GUIDELINES.md) | Visual identity guidelines |
| [Types](src/types/index.ts) | Core TypeScript interfaces |

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

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/agentic-dev-library/thumbcode.git
cd thumbcode

# Install dependencies
npm install

# Start development server
npm start
```

### Development

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
thumbcode/
├── app/                    # Expo Router file-based routes
│   ├── (onboarding)/       # Setup flow
│   ├── (tabs)/             # Main navigation
│   └── ...
├── src/
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   ├── services/           # External integrations
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utilities
├── design-system/          # Design tokens
├── docs/                   # Documentation
└── __tests__/              # Test suites
```

## For AI Agents

This repository is designed for agentic development. Key files for agents:

1. **[AGENTS.md](AGENTS.md)** — Coordination protocol, roles, workflow
2. **[src/types/index.ts](src/types/index.ts)** — Type contracts to code against
3. **[DECISIONS.md](DECISIONS.md)** — Technical decisions with rationale
4. **[docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)** — System architecture

### Agent Roles

| Role | Responsibility | Key Files |
|------|----------------|-----------|
| Architect | System design, types | `src/types/`, `DECISIONS.md` |
| Implementer | Write code | `src/components/`, `src/services/` |
| Reviewer | Code quality | PR comments |
| Tester | Test coverage | `__tests__/` |

## Contributing

1. Read [AGENTS.md](AGENTS.md) for workflow
2. Check [DECISIONS.md](DECISIONS.md) before proposing changes
3. Follow types in [src/types/](src/types/)
4. Use conventional commits

## License

MIT © ThumbCode Contributors

---

*Built with ❤️ for mobile-first developers.*
