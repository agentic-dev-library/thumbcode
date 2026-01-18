# ThumbCode

> **Code with your thumbs.** Professional software development, reimagined for mobile.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge/deploy-status)](https://thumbcode-foundation.netlify.app)

---

## The Future of Development is Mobile-Native

For decades, software development has been chained to the desktop. Keyboards, multiple monitors, sprawling IDEs—these are the tools that built the internet. But they're also what keeps development locked in an office.

**ThumbCode breaks that paradigm.**

We're building the first professional development environment designed for your phone, not adapted to it. Where most tools treat mobile as a compromise, we treat it as an opportunity—combining conversational AI with specialized agent teams to deliver a development experience that's more powerful *because* it's mobile.

---

## What Makes ThumbCode Different

### Orchestration, Not Translation

Other AI coding tools give you a chatbot that writes code. ThumbCode gives you a **development team**—Architects who design systems, Implementers who write production code, Reviewers who ensure quality, and Testers who prevent regressions.

You don't type code. You orchestrate it.

Instead of switching between terminal, editor, browser, and documentation, you have a single conversation with agents who handle the entire lifecycle. They coordinate through git, review each other's work, and maintain context across weeks of development.

### Your Credentials, Zero Trust

**Bring Your Own Keys (BYOK)** isn't a feature—it's our architecture.

Your Anthropic API key, your OpenAI key, your GitHub token—they live in hardware-backed secure storage on your device. ThumbCode never sees them, never proxies them, never has the ability to access them.

This isn't just about privacy. It's about sovereignty. You control your costs, you own your data, and you're not dependent on our servers staying online.

### Mobile-First by Design

ThumbCode isn't a desktop IDE squeezed onto a phone. Every interaction is designed for touch, every workflow optimized for the constraints and superpowers of mobile.

- **Chat-first interface** — Natural language is the primary input
- **Gesture-driven navigation** — Swipe to review diffs, tap to approve changes
- **Context-aware suggestions** — Agents understand what you can see on a 6-inch screen
- **Offline-capable** — Full git operations work without connectivity

The small screen isn't a limitation. It's a forcing function that makes AI orchestration essential—and more effective than traditional development.

### Warm Technical Aesthetic

Software development doesn't have to look like a terminal from 1985.

ThumbCode uses **organic shapes, warm colors, and humanist typography** to create an environment that feels like a conversation with a talented team, not operating a machine. Our "paint daub" aesthetic—asymmetric borders, soft curves, Coral and Teal and Gold—differentiates us from the cold blue-on-black world of traditional dev tools.

Development can be warm and human.

---

## How It Works: From Conversation to Code

### 1. Describe What You Want

```
You: "Add a dark mode toggle to the settings screen,
     following our existing design system"
```

### 2. Agents Plan & Execute

**Architect Agent:**
- Reviews design tokens and existing patterns
- Defines the state management approach
- Creates TypeScript interfaces

**Implementer Agent:**
- Writes the toggle component
- Updates theme provider
- Applies organic styling

**Tester Agent:**
- Creates unit tests for toggle
- Adds integration tests for theme switching
- Tests across light/dark modes

### 3. Review & Approve

You see a diff, the test results, and a summary. You can:
- Approve and merge
- Request changes
- Ask agents to explain their approach
- Iterate with follow-up instructions

### 4. Ship

Changes are committed to your branch, tests pass, and you can deploy—all from your phone.

---

## Real-World Use Cases

### The Solo Founder
*"I have a vision but limited coding bandwidth."*

ThumbCode becomes your engineering team. You focus on product decisions and user feedback. Agents handle implementation, testing, and code review. Build your MVP during your commute.

### The Engineering Manager
*"I need to unblock my team while I'm away from my laptop."*

Review PRs, merge hotfixes, and kick off new features from your phone. ThumbCode gives you the full git workflow without SSH or terminal access.

### The Aspiring Developer
*"I want to build real apps, not just tutorials."*

Learn by directing agents. See how professionals architect features, handle edge cases, and write tests. ThumbCode is a mentor that never sleeps.

### The Rapid Prototyper
*"I need to validate this idea by Friday."*

Describe your concept, let agents build it. Deploy a working prototype in hours, not weeks. Iterate based on real user feedback.

---

## Technology: Built for AI-First Development

ThumbCode is built on a foundation optimized for AI code generation and mobile deployment:

| Layer | Technology | Why It Matters |
|-------|------------|----------------|
| **Framework** | React Native + Expo SDK 52 | Largest training corpus for AI models; generates better code |
| **Styling** | NativeWind (Tailwind) | Declarative patterns AI understands natively |
| **Navigation** | expo-router | File-based routing that's predictable for agents |
| **State** | Zustand | Simple patterns that AI can reason about |
| **Git** | isomorphic-git | Client-side operations; no server required |
| **Security** | expo-secure-store | Hardware-backed encryption for credentials |
| **AI** | Anthropic Claude / OpenAI | Long context windows for full-file understanding |

Every technology choice optimizes for **AI agent effectiveness** and **mobile-native experience**.

---

## The Intelligence Layer: Multi-Agent Coordination

ThumbCode's agents aren't just LLMs with prompts. They're specialized roles with distinct capabilities, authorities, and communication protocols.

### Agent Specialization

| Agent | Primary Responsibility | Decision Authority |
|-------|----------------------|-------------------|
| **🏗️ Architect** | System design, technical decisions | Type definitions, breaking changes, dependency choices |
| **🔧 Implementer** | Production code within established contracts | Implementation details, code organization, optimizations |
| **🔍 Reviewer** | Quality assurance, pattern compliance | Code quality gates, security checks, documentation requirements |
| **🧪 Tester** | Test coverage, regression prevention | Test requirements, coverage thresholds, E2E scenarios |

### Coordination Through Git

Agents work in isolated **git worktrees**, allowing parallel execution without conflicts. When ready, changes are merged with automated conflict resolution.

This isn't just efficient—it mirrors how real development teams work, creating code that's maintainable by humans and AI alike.

---

## Project Status: Currently in Collaborative Development

ThumbCode is **not yet publicly available** as a mobile app. We're currently in an intensive collaborative development phase, working with early contributors to refine the multi-agent orchestration system and mobile-native workflows.

### What's Working Today

- ✅ Complete design system with organic aesthetics
- ✅ Programmatic design token generation
- ✅ Multi-agent coordination protocols
- ✅ GitHub Actions CI/CD with Claude integration
- ✅ Automated issue triage and PR creation
- ✅ React Native Web deployment pipeline

### What We're Building

- 🚧 Complete onboarding flow with GitHub authentication
- 🚧 Secure credential storage with biometric unlock
- 🚧 Full git workflow (clone, branch, commit, push, merge)
- 🚧 Chat interface with streaming agent responses
- 🚧 Code diff review and approval UI

### The Vision

ThumbCode will launch as a **premium mobile application** with a subscription model, targeting professional developers who want the freedom to code from anywhere without compromise.

This repository is open during development to enable collaboration with AI agents and early contributors. It will transition to a commercial license upon public release.

---

## For Developers: Contributing During Development Phase

While ThumbCode is in collaborative development, we welcome contributions from both humans and AI agents.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/agentic-dev-library/thumbcode.git
cd thumbcode

# Install dependencies (runs design token generation automatically)
pnpm install

# Start development server
pnpm start
```

### Project Structure

```
thumbcode/
├── app/                          # Expo Router pages
│   ├── (onboarding)/            # GitHub auth, API key setup
│   ├── (tabs)/                  # Main navigation
│   └── _layout.tsx
├── src/
│   ├── components/              # React Native components
│   │   ├── ui/                  # Design system primitives
│   │   ├── agents/              # Agent-specific UI
│   │   ├── workspace/           # File tree, code viewer
│   │   └── chat/                # Chat interface
│   ├── services/                # Git, GitHub, AI, credentials
│   ├── stores/                  # Zustand state management
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript definitions
├── packages/
│   └── dev-tools/               # Build-time tools (token/icon generation)
├── design-system/
│   ├── tokens.json              # Design tokens (source of truth)
│   └── generated/               # Auto-generated CSS/Tailwind
└── docs/                        # Comprehensive documentation
```

### Key Documentation for Contributors

| Document | Audience | Purpose |
|----------|----------|---------|
| **[CLAUDE.md](CLAUDE.md)** | AI Agents | Complete agent playbook and coding standards |
| **[AGENTS.md](AGENTS.md)** | All | Multi-agent coordination protocol |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Developers | System architecture and data flow |
| **[VISION.md](docs/vision/VISION.md)** | All | Product vision and roadmap |
| **[DECISIONS.md](DECISIONS.md)** | All | Technical decisions with rationale |
| **[WORKFLOWS.md](.github/WORKFLOWS.md)** | DevOps | CI/CD workflows and GitHub Actions |

### Contribution Guidelines

1. **Read AGENTS.md** to understand workflow and role assignments
2. **Follow CLAUDE.md** for code style and brand guidelines
3. **Use conventional commits**: `feat(agents): add workspace view`
4. **Test across platforms**: iOS, Android, and Web
5. **Respect the design system**: Use tokens, organic styling, warm palette

---

## Design System: Programmatic & Organic

ThumbCode's design system is fully programmatic, generated from a single source of truth: `design-system/tokens.json`.

### Warm Technical Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Primary** | Thumb Coral | `#FF7059` | Primary buttons, CTAs, active states |
| **Secondary** | Digital Teal | `#0D9488` | Links, secondary actions, badges |
| **Accent** | Soft Gold | `#F5D563` | Highlights, success states, achievements |
| **Dark Base** | Charcoal Navy | `#151820` | Dark mode backgrounds |
| **Light Base** | Off White | `#F8FAFC` | Light mode backgrounds |

### Organic Styling Principles

**DO:**
- Asymmetric border-radius: `50px 45px 50px 48px / 26px 28px 26px 24px`
- Subtle rotation: `transform: rotate(-0.3deg)`
- Multi-layered organic shadows with color tints
- SVG `feTurbulence` filters for texture

**DON'T:**
- Linear or radial gradients
- Perfectly rounded corners (`border-radius: 8px`)
- Cold blue/purple tech aesthetic
- Generic Material Design patterns

---

## FAQ

### When will ThumbCode be available?

ThumbCode is currently in collaborative development. We're targeting a beta release in Q2 2026, with full public launch later in the year. Early access will be available to contributors and beta testers.

### How will pricing work?

ThumbCode will use a **subscription model** for the mobile app. You'll bring your own AI API keys (Anthropic, OpenAI), and pay a monthly fee for the ThumbCode app and orchestration platform.

Exact pricing will be announced closer to launch. We're committed to making it accessible to individual developers while sustainable for continued development.

### Is ThumbCode open source?

**No.** This repository is open during the collaborative development phase to enable contributions from AI agents and early developers. Upon public release, ThumbCode will transition to a commercial license.

We believe in transparency during development, but also in building a sustainable business that can support long-term innovation in mobile-native development.

### What AI models does ThumbCode support?

- **Anthropic Claude** (Sonnet 4+, Opus 4+) — Recommended for long context and tool use
- **OpenAI** (GPT-4o, GPT-4 Turbo) — Supported for specialized tasks

You bring your own API keys. ThumbCode never proxies or has access to your credentials.

### Can ThumbCode build production apps?

Yes. ThumbCode uses **React Native + Expo**, which compiles to native iOS and Android apps. The apps agents build are the same quality as those written by human developers—they're just written faster and with AI-assisted review.

### How do agents avoid conflicts?

Agents work in isolated **git worktrees**, each with their own branch. Changes are merged with automated conflict resolution. If conflicts can't be resolved automatically, you're prompted to review and decide.

This mirrors how distributed development teams work, ensuring maintainability and traceability.

### Do I need to be a developer to use ThumbCode?

Not necessarily. ThumbCode is designed for **anyone with an idea and the willingness to learn**. You describe what you want in natural language, and agents build it.

That said, understanding basic programming concepts (variables, functions, state) helps you communicate more effectively with agents and understand their decisions.

---

## Understanding "Vibe Coding" vs. "Agentic Development"

### The Evolution of AI-Assisted Development

**Vibe coding**—the experience of opening a chat, describing what you want, and watching code materialize—has introduced millions of people to AI-assisted development. It's powerful for quick tasks, but fundamentally limited:

| Limitation | Impact |
|------------|--------|
| **No memory** | Each session starts from scratch; agents forget context |
| **No specialization** | One generalist agent handles all tasks |
| **No review** | Code appears without quality gates or oversight |
| **No lifecycle** | Works for prototypes, not sustained development |

**Agentic development** is the next evolution. It's what happens when you give AI:

1. **Persistent memory** — Context that survives across sessions, days, weeks
2. **Specialized roles** — Different agents for architecture, implementation, review, testing
3. **Coordination protocols** — Agents that communicate, review each other, and work in parallel
4. **Real tools** — Git operations, vector search, embeddings, deployment pipelines
5. **Lifecycle support** — From initial design through deployment and maintenance

### Why This Matters for Mobile

On a desktop, you can have 30 browser tabs, a sprawling IDE, terminal windows, and documentation side-by-side. On a phone, you have 6 inches.

**Vibe coding doesn't scale to mobile.** You can't juggle context in your head while switching between apps.

**Agentic development was made for mobile.** Agents maintain context. Agents handle the coordination. You focus on decisions, not details.

ThumbCode isn't just bringing development to mobile. We're showing that development *works better* on mobile when you have the right orchestration layer.

---

## Community & Support

- **GitHub Discussions** — Questions, ideas, feature requests
- **GitHub Issues** — Bug reports and technical issues
- **Documentation** — Comprehensive guides in `/docs`
- **Web Preview** — [thumbcode-foundation.netlify.app](https://thumbcode-foundation.netlify.app)

---

## License

**Commercial Software - Collaborative Development Phase**

This software is currently open for collaborative development. All rights are reserved by the ThumbCode team. See [LICENSE](LICENSE) for full terms.

Contributions during this phase are welcomed under the understanding that the project will transition to a commercial license upon public release.

---

*Built for the future of mobile-first development.*
*Because great code doesn't require a great desk.*
