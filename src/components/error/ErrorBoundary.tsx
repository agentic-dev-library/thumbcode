/**
 * Error Boundary Component
 *
 * React error boundary that catches errors in child components
 * and displays a fallback UI.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { ErrorFallback } from './ErrorFallback';

/** Props for the ErrorBoundary component */
interface Props {
  /** Child components to render when no error is caught */
  children: ReactNode;
  /** Custom fallback UI to display when an error is caught */
  fallback?: ReactNode;
  /** Callback invoked when an error is caught by the boundary */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Array of values that, when changed, reset the error boundary state */
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default error fallback
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.errorInfo?.componentStack}
          onRetry={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-friendly wrapper for error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
