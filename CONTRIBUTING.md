# Contributing to ThumbCode

Thank you for your interest in contributing to ThumbCode!

## For AI Agents

If you're an AI agent working on this codebase, read these documents **in this order**:

1. **[CLAUDE.md](CLAUDE.md)** - Complete agent playbook with brand guidelines and architecture
2. **[AGENTS.md](AGENTS.md)** - Agent coordination protocol and workflow
3. **[docs/memory-bank/techContext.md](docs/memory-bank/techContext.md)** - Current technology stack
4. **[docs/memory-bank/activeContext.md](docs/memory-bank/activeContext.md)** - Current work in progress

### Quick Checklist

Before making changes:
- [ ] Read the agent playbook (CLAUDE.md)
- [ ] Use design tokens from `design-system/tokens.json`
- [ ] Apply organic styling (asymmetric border-radius, no gradients)
- [ ] Use brand colors (Coral/Teal/Gold)
- [ ] Write tests for new code
- [ ] Run `pnpm lint` and `pnpm typecheck` before committing

## For Human Contributors

### Prerequisites

- Node.js (LTS)
- pnpm 10.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + SDK

### Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Start the Vite dev server: `pnpm dev` (http://localhost:5173)
5. Create a branch: `git checkout -b feature/your-feature-name`

### Development Workflow

```bash
# Start Vite dev server (web)
pnpm dev

# Build for production
pnpm build

# Sync to native projects
pnpm cap:sync

# Open native IDEs
pnpm cap:open:ios
pnpm cap:open:android

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Code duplication check
pnpm lint:duplication

# E2E tests
pnpm test:e2e:web
```

### Code Style

- **TypeScript**: All new code must be TypeScript
- **Formatting**: Use Biome (runs via `pnpm lint` and `pnpm format`)
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Design Tokens**: Always use tokens from `design-system/tokens.json`

### Design System

ThumbCode has a distinctive "Warm Technical" design language:

- **Colors**: Coral (#FF7059), Teal (#0D9488), Gold (#F5D563)
- **Typography**: Fraunces (display), Cabin (body), JetBrains Mono (code)
- **Styling**: Organic asymmetric shapes, NO gradients
- **Shadows**: Multi-layered with brand color tints

See [docs/brand/BRAND-GUIDELINES.md](docs/brand/BRAND-GUIDELINES.md) for details.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(agents): add multi-agent workspace view
fix(auth): resolve GitHub PKCE token refresh
docs(readme): update installation instructions
style(buttons): apply organic border-radius
refactor(stores): migrate to Zustand v5
test(git): add isomorphic-git integration tests
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass (`pnpm test`)
4. Ensure lint and typecheck pass (`pnpm lint && pnpm typecheck`)
5. Fill out the PR template completely
6. Request review from maintainers

### Testing

```bash
# Unit tests (Vitest)
pnpm test

# Watch mode
pnpm test:watch

# Coverage (80% threshold for lines/functions/statements)
pnpm test:coverage

# E2E tests (Playwright)
pnpm test:e2e:web
```

### Documentation

- Update relevant docs when changing functionality
- Add JSDoc comments to complex functions
- Update type definitions when changing interfaces
- Keep CLAUDE.md current when making architectural changes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
