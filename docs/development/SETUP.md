# ThumbCode Development Guide

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Generate design tokens
npm run generate:tokens

# Start development server
npm start
```

### Development Commands

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Run on Web
npm run web

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Build
npm run build:dev
npm run build:preview
npm run build:production
```

## Project Structure

```
thumbcode/
├── app/                          # Expo Router pages
│   ├── (onboarding)/            # Onboarding flow (grouped)
│   ├── (tabs)/                  # Main tab navigation
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Home screen
│
├── src/
│   ├── components/              
│   │   ├── ui/                  # Design system components
│   │   ├── agents/              # Agent-specific components
│   │   ├── workspace/           # Code workspace components
│   │   ├── chat/                # Chat interface components
│   │   └── project/             # Project components
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand state stores
│   ├── services/                # External integrations
│   │   ├── git/                 # Git operations
│   │   ├── github/              # GitHub API
│   │   ├── ai/                  # AI providers
│   │   └── credentials/         # Secure storage
│   │
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Utility functions
│
├── design-system/               # Design tokens & config
│   ├── tokens.json              # Design tokens (source of truth)
│   ├── tokens.ts                # TypeScript version
│   └── generated/               # Auto-generated from tokens.json
│
├── docs/                        # Documentation
│   ├── vision/                  # Product vision
│   ├── development/             # Technical docs
│   ├── brand/                   # Brand guidelines
│   ├── features/                # Feature specs
│   ├── agents/                  # Agent coordination
│   └── memory-bank/             # Institutional memory
│
├── public/                      # Static assets
│   └── assets/                  
│       ├── logos/               # Brand logos
│       ├── icons/               # App & UI icons
│       ├── images/              # Images
│       ├── fonts/               # Web fonts
│       └── brand/               # Brand assets (PDFs, etc)
│
├── __tests__/                   # Test files
├── e2e/                         # E2E tests (Maestro)
└── scripts/                     # Build & utility scripts
```

## Design System

### Using Design Tokens

ThumbCode uses a programmatic design token system. All design values come from `design-system/tokens.json`.

```typescript
import { getColor, getSpacing, getFontFamily } from '@/utils/design-tokens';

// Get colors
const primary = getColor('coral', '500'); // #FF7059
const primaryTransparent = getColorWithOpacity('coral', '500', 0.5);

// Get spacing
const padding = getSpacing('4'); // 16px

// Get fonts
const displayFont = getFontFamily('display'); // Fraunces, Georgia, serif
```

### Organic Styling

ThumbCode uses "organic" asymmetric styling for a warm, hand-crafted feel:

```tsx
// Organic button
<Button className="rounded-[0.5rem_0.75rem_0.625rem_0.875rem]">
  Click Me
</Button>

// Organic card
<Card className="rounded-[1rem_0.75rem_1.25rem_0.5rem]">
  Content
</Card>
```

### Color Palette

- **Primary (Coral)**: `#FF7059` - Buttons, CTAs, emphasis
- **Secondary (Teal)**: `#0D9488` - Links, secondary actions
- **Accent (Gold)**: `#F5D563` - Success, highlights
- **Neutrals**: Warm grays for backgrounds and text

### Typography

- **Display**: Fraunces - Headlines, hero text
- **Body**: Cabin - UI text, paragraphs
- **Mono**: JetBrains Mono - Code blocks

## State Management

We use Zustand for global state:

```typescript
// stores/userStore.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// In component
import { useUserStore } from '@/stores/userStore';

function Component() {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  
  // ...
}
```

## Navigation

We use Expo Router (file-based routing):

```typescript
// Navigate programmatically
import { router } from 'expo-router';

router.push('/project/123');
router.replace('/onboarding');
router.back();
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Key Files for AI Agents

If you're an AI agent working on this codebase, read these first:

1. **[AGENTS.md](../AGENTS.md)** - Agent coordination protocol
2. **[docs/agents/CLAUDE.md](../docs/agents/CLAUDE.md)** - Agent playbook with brand guidelines
3. **[src/types/index.ts](../src/types/index.ts)** - Core type definitions
4. **[DECISIONS.md](../DECISIONS.md)** - Technical decisions registry
5. **[docs/development/ARCHITECTURE.md](../docs/development/ARCHITECTURE.md)** - System architecture

## Contributing

1. Read the agent coordination protocol in [AGENTS.md](../AGENTS.md)
2. Check [DECISIONS.md](../DECISIONS.md) before proposing architectural changes
3. Follow the types defined in [src/types/](../src/types/)
4. Use design tokens from [design-system/tokens.json](../design-system/tokens.json)
5. Write tests for new features
6. Use conventional commits

## License

MIT © ThumbCode Contributors
