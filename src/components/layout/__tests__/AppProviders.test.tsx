import { render, screen } from '@testing-library/react';
import { AppProviders } from '../AppProviders';

vi.mock('@/components/error', () => ({
  ErrorBoundary: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('@/contexts/onboarding', () => ({
  OnboardingProvider: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="onboarding-provider">{children}</div>
  ),
}));

describe('AppProviders', () => {
  it('wraps children with ErrorBoundary and OnboardingProvider', () => {
    render(
      <AppProviders>
        <div data-testid="child">Hello</div>
      </AppProviders>
    );
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AppProviders>
        <span>App Content</span>
      </AppProviders>
    );
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });
});
