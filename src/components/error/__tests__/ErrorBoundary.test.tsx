import { render, screen } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error, onRetry }: { error: Error | null; onRetry?: () => void }) => (
    <div data-testid="error-fallback">
      <span>{error?.message || 'Unknown error'}</span>
      {onRetry && (
        <button data-testid="retry-button" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  ),
}));

// Component that always throws
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <span>No error</span>;
}

// Suppress console.error for expected error boundary calls
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    if (msg.includes('Error Boundary') || msg.includes('The above error')) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <span>Safe content</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeTruthy();
  });

  it('renders error fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<span>Custom error UI</span>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error UI')).toBeTruthy();
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('resets when resetKeys change', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['a']}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    // Error was caught
    expect(screen.getByText('Test error')).toBeTruthy();

    // Update with new resetKey and non-throwing child
    rerender(
      <ErrorBoundary resetKeys={['b']}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('No error')).toBeTruthy();
  });
});

describe('withErrorBoundary', () => {
  it('wraps component in error boundary', () => {
    function SafeComponent() {
      return <span>Wrapped content</span>;
    }
    const WrappedComponent = withErrorBoundary(SafeComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('Wrapped content')).toBeTruthy();
  });

  it('catches errors from wrapped component', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingComponent);
    render(<WrappedThrowing />);
    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('uses custom fallback when provided', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingComponent, <span>Custom fallback</span>);
    render(<WrappedThrowing />);
    expect(screen.getByText('Custom fallback')).toBeTruthy();
  });
});
