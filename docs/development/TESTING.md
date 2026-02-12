# Testing Guide

This document describes the testing architecture, tools, and conventions for ThumbCode.

## Running Tests

### Unit and Integration Tests (Jest)

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

### Agent-Intelligence Package Tests

The `agent-intelligence` package has its own Jest config using `ts-jest` (excluded from the root config):

```bash
# Run from package directory
cd packages/agent-intelligence
pnpm test
pnpm test:watch
pnpm test:coverage
```

### E2E Tests (Playwright -- Web)

```bash
# Build the web app first
pnpm build:web

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
├── jest.config.js                          # Root Jest configuration
├── jest.setup.js                           # Global mocks and setup
├── src/
│   ├── components/
│   │   ├── display/__tests__/              # Display component tests
│   │   ├── error/__tests__/                # Error component tests
│   │   └── ui/__tests__/                   # UI component tests
│   ├── contexts/__tests__/                 # Context/provider tests
│   ├── lib/__tests__/                      # Utility and library tests
│   ├── services/chat/__tests__/            # Service tests
│   └── utils/__tests__/                    # Utility tests
├── app/
│   └── (tabs)/__tests__/                   # Screen/page tests
├── packages/
│   ├── core/src/__tests__/                 # Core service tests
│   ├── state/src/__tests__/                # Zustand store tests
│   └── agent-intelligence/src/__tests__/   # AI client and orchestrator tests
└── e2e/
    └── web/                                # Playwright E2E tests
```

### Test Categories

**Unit Tests** -- Isolated logic testing with mocked dependencies:
- Zustand stores (`packages/state/src/__tests__/`)
- Core services (`packages/core/src/__tests__/`)
- Utility functions (`src/lib/__tests__/`, `src/utils/__tests__/`)
- AI clients and orchestrator (`packages/agent-intelligence/src/__tests__/`)

**Component Tests** -- React component rendering with React Native Testing Library:
- UI primitives (`src/components/ui/__tests__/`)
- Display components (`src/components/display/__tests__/`)
- Error boundaries (`src/components/error/__tests__/`)

**Screen Tests** -- Full screen rendering with navigation context:
- Tab screens (`app/(tabs)/__tests__/`)

**Performance Tests** -- Execution time benchmarks:
- Service performance (`packages/core/src/__tests__/*Perf.test.ts`)
- Context performance (`src/contexts/__tests__/*.perf.test.tsx`)

**E2E Tests** -- Full application testing via browser automation:
- Web platform (`e2e/web/`)

## Mocking Patterns

All global mocks are defined in `jest.setup.js`. These mock Expo and React Native modules that are unavailable in the Node.js test environment.

### Expo Module Mocks

```javascript
// AsyncStorage (Zustand persistence)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Expo SecureStore (credential storage)
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

// Expo Local Authentication (biometrics)
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

// Expo Constants (environment config)
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} } },
}));
```

### Navigation Mocks

```javascript
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
```

### Animation Mocks

```javascript
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

### Zustand Store Testing

Reset store state between tests to avoid cross-test contamination:

```typescript
import { useAgentStore } from '@thumbcode/state';

beforeEach(() => {
  useAgentStore.setState(useAgentStore.getInitialState());
});
```

## Adding a New Screen Test

1. Create the test file in the screen's `__tests__/` directory:

```typescript
// app/(tabs)/__tests__/my-screen.test.tsx
import { render, screen } from '@testing-library/react-native';
import MyScreen from '../my-screen';

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

describe('MyScreen', () => {
  it('renders the screen title', () => {
    render(<MyScreen />);
    expect(screen.getByText('My Screen')).toBeTruthy();
  });

  it('handles user interaction', async () => {
    render(<MyScreen />);
    const button = screen.getByText('Action');
    fireEvent.press(button);
    // Assert expected behavior
  });
});
```

2. Verify the test file matches the `testMatch` patterns in `jest.config.js`:
   - `<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}`
   - `<rootDir>/app/**/__tests__/**/*.test.{ts,tsx}`
   - `<rootDir>/packages/state/src/__tests__/**/*.test.{ts,tsx}`
   - `<rootDir>/packages/core/src/__tests__/**/*.test.{ts,tsx}`

3. Run the test: `pnpm test -- --testPathPattern="my-screen"`

## Coverage

### Current State

Coverage thresholds are configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 20,
    branches: 15,
    functions: 20,
    lines: 20,
  },
},
```

Current coverage is approximately 34.78%.

### Target

The target is 60% overall coverage. Priority areas:
1. Core services (credential, git, auth) -- highest value
2. Zustand stores -- critical state management
3. UI components -- visual regression prevention
4. Screen tests -- user-facing behavior

### Coverage Collection

Coverage is collected from:
- `src/**/*.{ts,tsx}`
- `app/**/*.{ts,tsx}`
- `packages/state/src/**/*.{ts,tsx}`
- `packages/core/src/**/*.{ts,tsx}`

Excluded from coverage:
- Type definition files (`*.d.ts`)
- `src/types/**/*`
- Test files (`__tests__/**/*`)

### Generating Reports

```bash
# Generate HTML coverage report
pnpm test:coverage

# Report is written to coverage/lcov-report/index.html
```

## CI Integration

Tests run automatically in GitHub Actions on every push and PR via `.github/workflows/ci.yml`:

1. **Lint** -- Biome check
2. **Typecheck** -- `tsc --noEmit`
3. **Test** -- `pnpm test` with coverage
4. **Build** -- Web build validation

Failed tests block PR merging.
