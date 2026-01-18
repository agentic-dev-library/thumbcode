# ThumbCode

> **Code with your thumbs.** A decentralized multi-agent mobile development platform.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge/deploy-status)](https://thumbcode-foundation.netlify.app)

---

## What is ThumbCode?

ThumbCode brings professional software development to your mobile device. Instead of typing every line of code, you orchestrate teams of specialized AI agents that understand your intent and execute with precision.

**Ship mobile apps by directing AI agents from your phone. Your keys, your code, zero dependencies.**

---

## Understanding AI Development: From Vibe Coding to Agency

### What is "Vibe Coding"?

You've probably heard of **"vibe coding"** — it's the experience of opening an AI chat, describing what you want, and watching code appear. It's magical for simple, single-session tasks:

```
You: "Build me a todo app with React"
AI: *generates complete code*
```

**Vibe coding works great for:**
- ✅ One-off scripts and utilities
- ✅ Quick prototypes and demos
- ✅ Learning and experimentation
- ✅ Simple, self-contained features

**But vibe coding has limits:**
- ❌ No memory between sessions — you start from scratch every time
- ❌ No long-term planning — can't manage complex, multi-step projects
- ❌ Single agent — no specialization or parallel work
- ❌ "YOLO mode" — limited oversight and review

When your session ends, the AI forgets everything. It's like having a brilliant colleague with amnesia.

### What is "Agentic Development"?

**Agentic development** (or "**agency**") is the evolution beyond vibe coding. It's what happens when you give AI:

1. **Memory** — Context persists across sessions
2. **Specialization** — Different agents for architecture, implementation, review, testing
3. **Coordination** — Agents work together and review each other
4. **Tools** — Real git operations, vector search, embeddings, deployment
5. **Lifecycle** — Sustained development over days, weeks, months

Think of it like this:

| Vibe Coding | Agentic Development (ThumbCode) |
|-------------|----------------------------------|
| Single AI session | Team of specialized agents |
| No memory | Persistent context & history |
| One task at a time | Parallel workflows |
| "Build me X" | "Maintain this app, add features, fix bugs" |
| Disposable output | Production-ready systems |

**Agentic development enables:**
- 🤖 **Multi-agent teams** — Architect, Implementer, Reviewer, Tester working in parallel
- 🧠 **Contextual memory** — RAG, embeddings, vector search for making connections
- 🔄 **Agents reviewing agents** — Quality gates and sustained excellence
- 📈 **Complex task decomposition** — Break down multi-week projects into manageable steps
- 🚀 **Full lifecycle support** — From ideation to deployment to maintenance

**This is where ThumbCode lives.** We took vibe coding and gave it agency.

---

## Why ThumbCode is Different

### 1. Mobile-First, Laptop-Optional

Most developers assume "real work" requires a laptop. ThumbCode challenges that. Our interface is designed for your thumbs, not your keyboard.

- **Chat-first interface** — Describe what you want in natural language
- **Optimized for mobile** — Every UI element designed for touch
- **Full git workflow** — Clone, commit, push from your phone
- **Code review on-the-go** — Approve changes during your commute

### 2. Credential Sovereignty (BYOK)

**Bring Your Own Keys.** Your Anthropic API key, your OpenAI key, your GitHub token — they never leave your device.

- 🔒 Keys stored in `expo-secure-store` with hardware-backed encryption
- 🔒 No ThumbCode servers to trust or compromise
- 🔒 You own your data, you control your costs
- 🔒 Works completely offline after initial repo clone

### 3. Multi-Agent Architecture

ThumbCode isn't one AI — it's a **team** of specialized agents:

| Agent | Role | Specialization |
|-------|------|----------------|
| **Architect** | System design | Breaking down features, planning architecture |
| **Implementer** | Code generation | Writing clean, tested code |
| **Reviewer** | Quality assurance | Code review, security checks |
| **Tester** | Testing | Unit tests, integration tests, E2E |

Agents coordinate through git worktrees, allowing parallel work without conflicts.

### 4. Warm Technical Design

ThumbCode rejects the cold, sterile aesthetic of most developer tools. We use **organic paint-daub shapes**, warm colors (Coral/Teal/Gold), and humanist typography.

Software development can feel warm and human, not like a terminal window.

---

## Real-World Use Cases

### For Solo Developers
*"I have an idea but limited coding time."*

Direct agents to build your MVP while you focus on design and user feedback. Review and approve changes on your commute.

### For Teams
*"We need to iterate faster on mobile features."*

Spin up agent teams for each feature branch. Agents handle boilerplate, you handle creative decisions.

### For Learning
*"I want to understand how production apps are built."*

Watch agents architect, implement, review, and test real features. Learn from the conversations and code.

### For Prototyping
*"I need to validate this idea by end of week."*

Describe your concept in a chat. Agents generate working prototypes you can deploy and share with users.

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm 10+** (`npm install -g pnpm`)
- **Expo CLI** (optional, recommended)
- **iOS Simulator / Android Emulator** or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/agentic-dev-library/thumbcode.git
cd thumbcode

# Install dependencies (auto-generates design tokens)
pnpm install

# Start development server
pnpm start
```

### First Run

1. **Connect GitHub** — Use Device Flow to authenticate (no password needed)
2. **Add API Keys** — Enter your Anthropic (required) and OpenAI (optional) keys
3. **Clone a Project** — Select a repo to work on
4. **Start Building** — Chat with agents to add features, fix bugs, refactor

---

## Documentation

| Document | Audience | Description |
|----------|----------|-------------|
| **[Getting Started →](docs/development/SETUP.md)** | All | Setup guide and dev environment |
| **[Vision & Roadmap →](docs/vision/VISION.md)** | All | Product vision, target users, future plans |
| **[Architecture →](docs/development/ARCHITECTURE.md)** | Developers | Technical architecture, data flow |
| **[Agent Playbook →](docs/agents/CLAUDE.md)** | AI Agents | Complete guide for AI development |
| **[Brand Guidelines →](docs/brand/BRAND-GUIDELINES.md)** | Designers | Visual identity, color palette, typography |
| **[Type Reference →](src/types/index.ts)** | Developers | Core TypeScript interfaces |
| **[Contributing →](CONTRIBUTING.md)** | All | How to contribute to ThumbCode |

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Expo SDK 52+ | Best AI code generation quality |
| **UI** | React Native 0.76+ | Cross-platform mobile |
| **Navigation** | expo-router 4.x | File-based routing |
| **Styling** | NativeWind 4.x | Tailwind for React Native |
| **State** | Zustand 5.x | Lightweight global state |
| **Git** | isomorphic-git | Client-side git operations |
| **AI** | Anthropic Claude / OpenAI | Agent intelligence |
| **Security** | expo-secure-store | Hardware-backed credential storage |

---

## Project Structure

```
thumbcode/
├── app/                          # Expo Router file-based routes
│   ├── (onboarding)/            # Setup flow (GitHub auth, API keys)
│   ├── (tabs)/                  # Main navigation (Dashboard, Projects, Chat)
│   └── _layout.tsx              # Root layout with navigation guards
├── src/
│   ├── components/
│   │   ├── ui/                  # Base design system components
│   │   ├── agents/              # Agent-specific components
│   │   ├── workspace/           # File tree, code viewer, diff
│   │   ├── chat/                # Chat interface components
│   │   └── project/             # Project cards, repo info
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand state management
│   ├── services/                # Git, GitHub, AI, credentials
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Design tokens, formatting
├── design-system/
│   ├── tokens.json              # Design tokens (source of truth)
│   ├── tokens.ts                # TypeScript exports
│   └── generated/               # Auto-generated CSS/JS
├── docs/                        # Comprehensive documentation
├── public/assets/               # Brand assets (logos, icons)
└── __tests__/                   # Jest test suites
```

---

## Design System

ThumbCode uses a programmatic design system powered by `design-system/tokens.json`. All colors, spacing, typography are defined once and auto-generate:

- CSS custom properties
- Tailwind configuration
- TypeScript utilities
- React Native constants

### Warm Technical Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Thumb Coral | `#FF7059` | Buttons, links, focus states |
| **Secondary** | Digital Teal | `#0D9488` | Supporting elements, badges |
| **Accent** | Soft Gold | `#F5D563` | Highlights, success states |
| **Background** | Charcoal Navy | `#151820` | Dark mode backgrounds |

### Organic Styling

Asymmetric border-radius for "paint daub" aesthetic:

```tsx
// Perfectly rounded (DON'T do this)
<Button className="rounded-lg" />

// Organic paint daub (DO this)
<Button className="rounded-[0.5rem_0.75rem_0.625rem_0.875rem]" />
```

---

## For AI Agents

This repository is optimized for agentic development. **Start here:**

1. **[docs/agents/CLAUDE.md](docs/agents/CLAUDE.md)** — Complete agent playbook
2. **[AGENTS.md](AGENTS.md)** — Coordination protocol
3. **[DECISIONS.md](DECISIONS.md)** — Technical decisions with rationale
4. **[src/types/index.ts](src/types/index.ts)** — Type contracts
5. **[docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)** — System architecture

### Key Principles

- ✅ Use design tokens programmatically from `tokens.json`
- ✅ Apply organic asymmetric styling (no perfect circles)
- ✅ Follow the Warm Technical color palette (Coral/Teal/Gold)
- ✅ Code against type definitions in `src/types/`
- ❌ NO gradients for backgrounds or buttons
- ❌ NO hardcoded colors — always use tokens
- ❌ NO Inter/Roboto fonts — use Fraunces/Cabin

---

## Contributing

We welcome contributions from developers, designers, and AI agents.

1. Read **[AGENTS.md](AGENTS.md)** for workflow and roles
2. Check **[DECISIONS.md](DECISIONS.md)** before proposing architectural changes
3. Follow types in **[src/types/](src/types/)**
4. Use conventional commits: `feat(agents): add workspace view`
5. Test on iOS, Android, and Web before submitting PR

---

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Design system with organic aesthetics
- ✅ Onboarding flow (GitHub auth, API keys)
- ✅ Basic multi-agent coordination
- 🚧 Full git workflow (clone, commit, push)
- 🚧 Chat interface with streaming responses

### Phase 2: Intelligence
- 📋 RAG for project context
- 📋 Vector search for code patterns
- 📋 Agent memory across sessions
- 📋 Specialized agent roles (Architect, Implementer, Reviewer, Tester)

### Phase 3: Collaboration
- 📋 Multi-user projects
- 📋 Agent collaboration protocols
- 📋 Code review workflows
- 📋 Deployment pipelines

### Phase 4: Ecosystem
- 📋 Plugin system for custom agents
- 📋 Community agent marketplace
- 📋 Template library
- 📋 Integration with popular frameworks

---

## FAQ

### Is ThumbCode production-ready?

ThumbCode is in **active development**. The design system, onboarding, and basic UI are functional. Multi-agent workflows are being refined. Use for experimentation and learning, not yet for production apps.

### Do I need to be a developer?

No. ThumbCode is designed for **anyone with an idea**. You describe what you want, agents build it. That said, understanding basic programming concepts helps you communicate more effectively with agents.

### What AI models does ThumbCode support?

- **Anthropic Claude** (Sonnet, Opus) — Required
- **OpenAI** (GPT-4) — Optional

We recommend Claude for its large context window and tool use capabilities.

### How much does ThumbCode cost?

ThumbCode is **free and open-source (MIT license)**. You pay only for:
- Your AI API usage (Anthropic/OpenAI)
- Optional Expo EAS builds for iOS/Android

No ThumbCode subscription, no server fees.

### Can ThumbCode build iOS and Android apps?

Yes. ThumbCode uses **React Native + Expo**, which compiles to native iOS and Android apps. You can also deploy to web.

### How do agents avoid conflicting changes?

ThumbCode uses **git worktrees** to give each agent its own isolated workspace. When agents are ready, changes are merged with automated conflict resolution.

---

## License

MIT © ThumbCode Contributors

---

## Community

- **GitHub Discussions** — Questions, ideas, feedback
- **GitHub Issues** — Bug reports, feature requests
- **Netlify Deployment** — [thumbcode-foundation.netlify.app](https://thumbcode-foundation.netlify.app)

---

*Built with ❤️ for the future of mobile-first development.*
