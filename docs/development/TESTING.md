# Testing Guide

This document describes the testing architecture, tools, and conventions for ThumbCode.

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all tests
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# Run with coverage report
pnpm test:coverage

# Run a specific test file
pnpm test -- --testPathPattern="CredentialService"

# Run tests matching a name pattern
pnpm test -- -t "should store credentials"
```

### Integration Tests (Vitest + MSW)

Integration tests run in Node.js (not jsdom) with longer timeouts. They use MSW (Mock Service Worker) for VCR-style HTTP recording/replay.

```bash
# Run integration tests (uses recorded cassettes)
pnpm test:integration

# Record new cassettes from live AI providers (requires Doppler secrets)
pnpm test:integration:record
```

Configuration lives in `vitest.config.integration.ts`.

### E2E Tests (Playwright -- Web)

```bash
# Build the web app first
pnpm build

# Run E2E tests
pnpm test:e2e:web

# Update visual snapshots
pnpm test:e2e:web:update
```

Playwright is configured in `playwright.config.ts` to:
- Serve the built web app on port 3000 via `serve dist`
- Run against Desktop Chrome
- Capture screenshots on failure
- Store snapshots in `e2e/web/screenshots/`

### E2E Tests (Maestro -- Mobile)

```bash
pnpm e2e:build
pnpm e2e:test
```

## Test Architecture

### Directory Structure

```
thumbcode/
├── vitest.config.ts                       # Unit test configuration (jsdom)
├── vitest.config.integration.ts           # Integration test configuration (node)
├── vitest.setup.ts                        # Global mocks and setup
├── playwright.config.ts                   # E2E web configuration
├── src/
│   ├── __tests__/
│   │   └── integration/                   # AI provider integration tests (MSW)
│   ├── components/
│   │   ├── agents/__tests__/              # Agent UI component tests
│   │   ├── chat/__tests__/                # Chat component tests
│   │   ├── display/__tests__/             # Display component tests
│   │   ├── error/__tests__/               # Error boundary tests
│   │   └── ui/__tests__/                  # UI primitive re-export tests
│   ├── config/__tests__/                  # Configuration tests
│   ├── contexts/__tests__/                # Context/provider tests
│   ├── core/__tests__/                    # Credential, GitHub, auth service tests
│   ├── lib/__tests__/                     # Utility and library tests
│   ├── pages/
│   │   ├── detail/__tests__/              # Project detail page tests
│   │   ├── onboarding/__tests__/          # Onboarding flow tests
│   │   └── tabs/__tests__/               # Tab screen tests
│   ├── services/
│   │   ├── agents/__tests__/              # Agent logic tests
│   │   ├── ai/__tests__/                  # AI client tests
│   │   ├── chat/__tests__/                # Chat service + pipeline tests
│   │   ├── mcp/__tests__/                 # MCP client and tool bridge tests
│   │   ├── orchestrator/__tests__/        # Orchestrator tests
│   │   └── tools/__tests__/               # Tool execution tests
│   ├── state/__tests__/                   # Zustand store tests
│   ├── ui/__tests__/                      # Design system component tests
│   └── utils/__tests__/                   # Utility tests
└── e2e/
    └── web/                               # Playwright E2E tests
```

### Test Categories

**Unit Tests** -- Isolated logic testing with mocked dependencies:
- Zustand stores (`src/state/__tests__/`)
- Core services (`src/core/__tests__/`)
- Utility functions (`src/lib/__tests__/`, `src/utils/__tests__/`)
- AI clients and orchestrator (`src/services/ai/__tests__/`, `src/services/orchestrator/__tests__/`)

**Component Tests** -- React component rendering with React Testing Library:
- UI primitives (`src/ui/__tests__/`)
- Chat components (`src/components/chat/__tests__/`)
- Agent components (`src/components/agents/__tests__/`)
- Display components (`src/components/display/__tests__/`)
- Error boundaries (`src/components/error/__tests__/`)

**Page Tests** -- Full page rendering with routing context:
- Tab pages (`src/pages/tabs/__tests__/`)
- Detail pages (`src/pages/detail/__tests__/`)
- Onboarding flow (`src/pages/onboarding/__tests__/`)

**Performance Tests** -- Execution time benchmarks:
- Context performance (`src/contexts/__tests__/*.perf.test.tsx`)

**Integration Tests** -- AI provider round-trips with VCR recording:
- Provider tests (`src/__tests__/integration/`)

**E2E Tests** -- Full application testing via browser automation:
- Web platform (`e2e/web/`)

## Mocking Patterns

All global mocks are defined in `vitest.setup.ts`. These mock Capacitor plugins that are unavailable in the jsdom test environment.

### Capacitor Plugin Mocks

```typescript
// Secure storage (credential storage)
vi.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: vi.fn().mockResolvedValue({ value: '' }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue({ value: [] }),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

// Biometric auth
vi.mock('@aparajita/capacitor-biometric-auth', () => ({
  BiometricAuth: {
    authenticate: vi.fn().mockResolvedValue(undefined),
    checkBiometry: vi.fn().mockResolvedValue({
      isAvailable: false,
      biometryType: 0,
      reason: '',
    }),
  },
}));

// Filesystem
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    readFile: vi.fn().mockResolvedValue({ data: '' }),
    writeFile: vi.fn().mockResolvedValue({ uri: '' }),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rmdir: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue({ files: [] }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ type: 'file', size: 0, uri: '' }),
  },
  Directory: { Documents: 'DOCUMENTS', Data: 'DATA', Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
}));

// Device info
vi.mock('@capacitor/device', () => ({
  Device: {
    getInfo: vi.fn().mockResolvedValue({ platform: 'web' }),
    getId: vi.fn().mockResolvedValue({ identifier: 'test-device-id' }),
    getBatteryInfo: vi.fn().mockResolvedValue({ batteryLevel: 1, isCharging: false }),
  },
}));
```

### Navigation Mocks

```typescript
// react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
}));
```

### Zustand Store Testing

Reset store state between tests to avoid cross-test contamination:

```typescript
import { useAgentStore } from '@/state';

beforeEach(() => {
  useAgentStore.setState(useAgentStore.getInitialState());
});
```

## Adding a New Test

1. Create the test file in the relevant `__tests__/` directory:

```typescript
// src/services/my-service/__tests__/MyService.test.ts
import { describe, expect, it, vi } from 'vitest';
import { MyService } from '../MyService';

// Mock dependencies using @/ path aliases
vi.mock('@/core', () => ({
  SomeDependency: { method: vi.fn() },
}));

describe('MyService', () => {
  it('does the thing', () => {
    const result = MyService.doThing();
    expect(result).toBe(true);
  });
});
```

2. Verify the test file matches the include pattern in `vitest.config.ts`:
   - `src/**/__tests__/**/*.test.{ts,tsx}`

3. Run the test: `pnpm test -- --testPathPattern="MyService"`

## Coverage

### Configuration

Coverage is configured in `vitest.config.ts` using the v8 provider:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'lcov'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['**/__tests__/**', '**/*.d.ts', '**/types/**'],
},
```

### Generating Reports

```bash
# Generate coverage report (text + lcov)
pnpm test:coverage

# HTML report is written to coverage/lcov-report/index.html
```

### CI Coverage

Coverage reports are uploaded to both Coveralls and SonarCloud in CI. SonarCloud reads `coverage/lcov.info` as configured in `sonar-project.properties`.

## CI Integration

Tests run automatically in GitHub Actions on every push and PR via `.github/workflows/ci.yml`:

1. **Lint** -- Biome check
2. **Typecheck** -- `tsc --noEmit`
3. **Test** -- `pnpm test` with coverage
4. **SonarCloud** -- Static analysis and coverage ingestion
5. **Build** -- Web build validation
6. **E2E** -- Playwright browser tests (on build success)
7. **Coveralls** -- Coverage reporting

Failed tests block PR merging.

## Key Differences from Legacy Setup

- **Vitest** (not Jest) -- uses `vi.mock`, `vi.fn()`, `vi.spyOn()`
- **Flat src/** (not `packages/`) -- all code lives under `src/`, imported via `@/` path alias
- **Capacitor** (not Expo) -- mocks target `capacitor-secure-storage-plugin`, `@capacitor/*`
- **react-router-dom** (not expo-router) -- mock `useNavigate`, `useParams`
- **@testing-library/react** (not react-native) -- web-first component testing
- **Biome** (not ESLint) -- linting and formatting
