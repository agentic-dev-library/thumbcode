import { create } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error, onRetry }: { error: Error | null; onRetry?: () => void }) => {
    const { Text, View, Pressable } = require('react-native');
    return (
      <View testID="error-fallback">
        <Text>{error?.message || 'Unknown error'}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} testID="retry-button">
            <Text>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  },
}));

// Component that always throws
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
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
    const tree = create(
      <ErrorBoundary>
        <Text>Safe content</Text>
      </ErrorBoundary>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Safe content');
  });

  it('renders error fallback when child throws', () => {
    const tree = create(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Test error');
  });

  it('renders custom fallback when provided', () => {
    const tree = create(
      <ErrorBoundary fallback={<Text>Custom error UI</Text>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Custom error UI');
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();
    create(
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
    let resetKey = 'a';
    const tree = create(
      <ErrorBoundary resetKeys={[resetKey]}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    // Error was caught
    let json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Test error');

    // Update with new resetKey and non-throwing child
    resetKey = 'b';
    tree.update(
      <ErrorBoundary resetKeys={[resetKey]}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    json = JSON.stringify(tree.toJSON());
    expect(json).toContain('No error');
  });
});

describe('withErrorBoundary', () => {
  it('wraps component in error boundary', () => {
    function SafeComponent() {
      return <Text>Wrapped content</Text>;
    }
    const WrappedComponent = withErrorBoundary(SafeComponent);
    const tree = create(<WrappedComponent />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Wrapped content');
  });

  it('catches errors from wrapped component', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingComponent);
    const tree = create(<WrappedThrowing />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Test error');
  });

  it('uses custom fallback when provided', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingComponent, <Text>Custom fallback</Text>);
    const tree = create(<WrappedThrowing />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Custom fallback');
  });
});
