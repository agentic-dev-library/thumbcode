/**
 * Error Fallback Component
 *
 * User-friendly error display with retry functionality.
 * Follows ThumbCode's organic design language.
 * Uses paint daube icons for brand consistency.
 */

import { ErrorIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

/** Props for the ErrorFallback component */
interface ErrorFallbackProps {
  /** The error that was caught, or null if unknown */
  error: Error | null;
  /** React component stack trace for debugging */
  componentStack?: string | null;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Callback to report the issue (defaults to opening a GitHub issue) */
  onReportIssue?: () => void;
  /** Custom title for the error display */
  title?: string;
  /** Custom description message for the error display */
  message?: string;
}

export function ErrorFallback({
  error,
  componentStack,
  onRetry,
  onReportIssue,
  title = 'Something went wrong',
  message = "We're sorry, but something unexpected happened. Please try again.",
}: Readonly<ErrorFallbackProps>) {
  const isDev = import.meta.env.DEV;

  const handleReportIssue = () => {
    if (onReportIssue) {
      onReportIssue();
    } else {
      const issueTitle = encodeURIComponent(
        `[Bug] Error Report: ${error?.name || 'Unknown Error'}`
      );
      const issueBody = encodeURIComponent(
        `**Error Details**\nMessage: ${error?.message || 'No message'}\n\n**Component Stack**\n\`\`\`\n${componentStack || 'No stack trace'}\n\`\`\``
      );
      const url = `https://github.com/agentic-dev-library/thumbcode/issues/new?title=${issueTitle}&body=${issueBody}`;

      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex-1 bg-charcoal">
      <Container padding="lg" className="flex-1 justify-center">
        <VStack spacing="lg" align="center">
          {/* Error Icon */}
          <div className="w-20 h-20 flex items-center justify-center bg-coral-500/20 rounded-organic-hero">
            <ErrorIcon size={40} color="coral" turbulence={0.25} />
          </div>

          {/* Error Title */}
          <Text
            size="xl"
            weight="bold"
            className="text-white text-center font-display"
            data-testid="error-title"
          >
            {title}
          </Text>

          {/* Error Message */}
          <Text className="text-neutral-400 text-center max-w-xs">{message}</Text>

          {/* Dev-only Error Details */}
          {isDev && error && (
            <div className="bg-surface p-4 w-full max-w-sm rounded-organic-card">
              <Text size="sm" weight="semibold" className="text-coral-500 mb-2">
                Debug Info
              </Text>
              <Text size="sm" className="text-neutral-400 font-mono mb-2">
                {error.name}: {error.message}
              </Text>
              {componentStack && (
                <Text size="xs" className="text-neutral-500 font-mono" numberOfLines={8}>
                  {componentStack}
                </Text>
              )}
            </div>
          )}

          {/* Retry Button */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="bg-coral-500 px-8 py-3 active:bg-coral-600 rounded-organic-cta"
            >
              <Text weight="semibold" className="text-white">
                Try Again
              </Text>
            </button>
          )}

          {/* Secondary Action */}
          <button
            type="button"
            className="py-2"
            onClick={handleReportIssue}
            data-testid="report-issue-button"
          >
            <Text size="sm" className="text-teal-500">
              Report Issue
            </Text>
          </button>
        </VStack>
      </Container>
    </div>
  );
}

/** Props for the CompactErrorFallback component, used for inline error displays */
interface CompactErrorFallbackProps {
  /** Error message to display */
  message?: string;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
}

export function CompactErrorFallback({
  message = 'Failed to load',
  onRetry,
}: Readonly<CompactErrorFallbackProps>) {
  return (
    <div className="bg-surface/50 p-4 rounded-organic-card">
      <VStack spacing="sm" align="center">
        <Text size="sm" className="text-neutral-400">
          {message}
        </Text>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            <Text size="sm" className="text-teal-500">
              Tap to retry
            </Text>
          </button>
        )}
      </VStack>
    </div>
  );
}
