/**
 * Error Fallback Component
 *
 * User-friendly error display with retry functionality.
 * Follows ThumbCode's organic design language.
 * Uses paint daube icons for brand consistency.
 */

import { Alert, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

interface ErrorFallbackProps {
  error: Error | null;
  componentStack?: string | null;
  onRetry?: () => void;
  onReportIssue?: () => void;
  title?: string;
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
  const insets = useSafeAreaInsets();
  const isDev = __DEV__;

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

      Linking.openURL(url).catch((err) => {
        console.error('Failed to open issue URL:', err);
        Alert.alert('Report Issue', 'Could not open GitHub issues page.');
      });
    }
  };

  return (
    <View
      className="flex-1 bg-charcoal"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Container padding="lg" className="flex-1 justify-center">
        <VStack spacing="lg" align="center">
          {/* Error Icon */}
          <View
            className="w-20 h-20 bg-coral-500/20 items-center justify-center"
            style={organicBorderRadius.hero}
          >
            <ErrorIcon size={40} color="coral" turbulence={0.25} />
          </View>

          {/* Error Title */}
          <Text
            size="xl"
            weight="bold"
            className="text-white text-center font-display"
            testID="error-title"
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* Error Message */}
          <Text className="text-neutral-400 text-center max-w-xs">{message}</Text>

          {/* Dev-only Error Details */}
          {isDev && error && (
            <View className="bg-surface p-4 w-full max-w-sm" style={organicBorderRadius.card}>
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
            </View>
          )}

          {/* Retry Button */}
          {onRetry && (
            <Pressable
              onPress={onRetry}
              className="bg-coral-500 px-8 py-3 active:bg-coral-600"
              style={organicBorderRadius.cta}
            >
              <Text weight="semibold" className="text-white">
                Try Again
              </Text>
            </Pressable>
          )}

          {/* Secondary Action */}
          <Pressable className="py-2" onPress={handleReportIssue} testID="report-issue-button">
            <Text size="sm" className="text-teal-500">
              Report Issue
            </Text>
          </Pressable>
        </VStack>
      </Container>
    </View>
  );
}

/**
 * Compact error fallback for inline use
 */
interface CompactErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export function CompactErrorFallback({
  message = 'Failed to load',
  onRetry,
}: Readonly<CompactErrorFallbackProps>) {
  return (
    <View className="bg-surface/50 p-4" style={organicBorderRadius.card}>
      <VStack spacing="sm" align="center">
        <Text size="sm" className="text-neutral-400">
          {message}
        </Text>
        {onRetry && (
          <Pressable onPress={onRetry}>
            <Text size="sm" className="text-teal-500">
              Tap to retry
            </Text>
          </Pressable>
        )}
      </VStack>
    </View>
  );
}
