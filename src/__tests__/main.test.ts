// Test that main.tsx module can be imported (covers the module-level code)
// main.tsx throws if #root element is not found, so we create it first.

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children?: React.ReactNode }) => children,
  Route: () => null,
  Routes: () => null,
}));

vi.mock('@/components/error', () => ({
  ErrorBoundary: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/contexts/onboarding', () => ({
  OnboardingProvider: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/router', () => ({
  AppRoutes: () => null,
}));

vi.mock('../../global.css', () => ({}));

describe('main.tsx', () => {
  it('throws when root element is missing', async () => {
    // Remove #root if it exists
    const existing = document.getElementById('root');
    if (existing) existing.remove();

    await expect(import('../main')).rejects.toThrow('Root element not found');
  });
});
