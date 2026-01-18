# ThumbCode Foundation

> **"Code with your thumbs"** — A decentralized multi-agent mobile development platform

[![Netlify Status](https://api.netlify.com/api/v1/badges/placeholder/deploy-status)](https://app.netlify.com/sites/thumbcode-foundation/deploys)

---

## What is ThumbCode?

ThumbCode enables anyone to ship mobile apps by directing AI agents from their phone. No laptop required.

**Key features:**
- 🤖 **Multi-agent development** — Architect, Implementer, Reviewer, Tester agents work in parallel
- 🔑 **BYOK** — Bring Your Own Keys (Anthropic, OpenAI, GitHub) — we never touch your credentials
- 📱 **Mobile-first** — Built for thumb-based interaction
- 💰 **Zero server cost** — Everything runs client-side

---

## Repository Structure

```
thumbcode-foundation/
├── CLAUDE.md              # Agent playbook (READ THIS FIRST)
├── AGENTS.md              # Multi-agent coordination protocol
├── README.md              # You are here
├── memory-bank/           # Institutional memory
│   ├── DEVELOPMENT-LOG.md # Project history
│   ├── DECISIONS.md       # Key decisions registry
│   └── ...
├── design-tokens/         # Brand system
│   ├── tokens.json        # Machine-readable
│   ├── tokens.ts          # TypeScript
│   └── tailwind.config.ts # NativeWind config
├── src/                   # Source code
│   ├── components/        # UI components
│   ├── styles/            # CSS/styling
│   └── pages/             # Page components
└── public/                # Static assets
    └── logos/             # SVG brand assets
```

---

## For AI Agents

**READ `CLAUDE.md` BEFORE WRITING ANY CODE.**

It contains:
- Brand colors and typography (P3 "Warm Technical")
- Component patterns and anti-patterns
- File structure conventions
- Quality checklist

**READ `AGENTS.md` FOR COORDINATION RULES.**

---

## Brand Quick Reference

### Colors
| Role | Name | Hex |
|------|------|-----|
| Primary | Thumb Coral | `#FF7059` |
| Secondary | Digital Teal | `#0D9488` |
| Accent | Soft Gold | `#F5D563` |
| Base | Charcoal Navy | `#151820` |

### Typography
- **Display**: Fraunces (headlines)
- **Body**: Cabin (UI text)
- **Code**: JetBrains Mono

### Visual Style
- ✅ Organic paint daubes
- ✅ Asymmetric border-radius
- ❌ NO gradients
- ❌ NO perfectly rounded corners

---

## Getting Started

### For Developers

```bash
# Clone
git clone https://github.com/thumbcode/thumbcode-foundation.git
cd thumbcode-foundation

# Install dependencies
npm install

# Run development server
npm run dev
```

### For AI Agents

1. Read `CLAUDE.md` completely
2. Read `AGENTS.md` for coordination rules
3. Check `memory-bank/DECISIONS.md` before proposing changes
4. Follow the component checklist in CLAUDE.md

---

## Deployment

This repository deploys to Netlify automatically.

**Production URL**: https://thumbcode-foundation.netlify.app

---

## Contact

- **Project Lead**: Jon Bogaty
- **Canva Brand Kit**: `kAG-uqPJ8gk`
- **Netlify Team**: `jbdevprimary`

---

## License

[TBD]
