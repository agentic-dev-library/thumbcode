# Contributing to ThumbCode

Thank you for your interest in contributing to ThumbCode!

## For AI Agents

If you're an AI agent working on this codebase, please read these documents **in this order**:

1. **[docs/agents/CLAUDE.md](docs/agents/CLAUDE.md)** - Complete agent playbook with brand guidelines
2. **[AGENTS.md](AGENTS.md)** - Agent coordination protocol and workflow
3. **[DECISIONS.md](DECISIONS.md)** - Technical decisions registry (check before proposing changes)
4. **[src/types/index.ts](src/types/index.ts)** - Core type definitions (code against these)
5. **[docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)** - System architecture

### Quick Checklist

Before making changes:
- [ ] Read the agent playbook (CLAUDE.md)
- [ ] Check DECISIONS.md for relevant decisions
- [ ] Use design tokens from `design-system/tokens.json`
- [ ] Follow types in `src/types/`
- [ ] Apply organic styling (asymmetric border-radius)
- [ ] Use brand colors (Coral/Teal/Gold)
- [ ] Write tests for new code

## For Human Contributors

### Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

### Development Workflow

```bash
# Start development server
npm start

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint:fix

# Generate design tokens (after editing tokens.json)
npm run generate:tokens
```

### Code Style

- **TypeScript**: All new code must be TypeScript
- **Formatting**: Use the project's ESLint config
- **Components**: Functional components with hooks
- **Styling**: Use NativeWind (Tailwind classes)
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
3. Ensure all tests pass
4. Update DECISIONS.md if making architectural changes
5. Fill out the PR template completely
6. Request review from maintainers

### Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage (aim for 80%)
npm run test:coverage

# E2E tests
npm run e2e:test
```

### Documentation

- Update relevant docs when changing functionality
- Add JSDoc comments to complex functions
- Update type definitions when changing interfaces
- Keep README.md and SETUP.md current

## Project Structure

See [docs/development/SETUP.md](docs/development/SETUP.md) for detailed project structure.

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues and discussions first
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
