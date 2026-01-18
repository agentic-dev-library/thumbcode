/**
 * EmptyState Component
 *
 * Placeholder content for empty lists and screens.
 * Provides visual feedback and optional call-to-action.
 */

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface EmptyStateProps {
  /** Large icon or emoji */
  icon?: string;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onPress: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Custom content below description */
  children?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { icon: 'text-4xl', title: 'text-base', desc: 'text-sm', padding: 'p-4' },
  md: { icon: 'text-5xl', title: 'text-lg', desc: 'text-sm', padding: 'p-6' },
  lg: { icon: 'text-6xl', title: 'text-xl', desc: 'text-base', padding: 'p-8' },
};

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction,
  children,
  size = 'md',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <View className={`items-center justify-center ${styles.padding}`}>
      <Text className={`${styles.icon} mb-4`}>{icon}</Text>

      <Text className={`font-display ${styles.title} text-white text-center mb-2`}>{title}</Text>

      {description && (
        <Text
          className={`font-body ${styles.desc} text-neutral-400 text-center max-w-[280px] mb-4`}
        >
          {description}
        </Text>
      )}

      {children}

      {(action || secondaryAction) && (
        <View className="flex-row items-center gap-3 mt-4">
          {secondaryAction && (
            <Pressable
              onPress={secondaryAction.onPress}
              className="px-4 py-2 bg-neutral-700 active:bg-neutral-600"
              style={{
                borderTopLeftRadius: 8,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 8,
                borderBottomLeftRadius: 12,
              }}
              accessibilityRole="button"
              accessibilityLabel={secondaryAction.label}
              accessibilityHint={`Perform the action: ${secondaryAction.label}`}
            >
              <Text className="font-body text-neutral-200">{secondaryAction.label}</Text>
            </Pressable>
          )}
          {action && (
            <Pressable
              onPress={action.onPress}
              className="px-4 py-2 bg-coral-500 active:bg-coral-600"
              style={{
                borderTopLeftRadius: 8,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 8,
                borderBottomLeftRadius: 12,
              }}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={`Perform the action: ${action.label}`}
            >
              <Text className="font-body text-white font-semibold">{action.label}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

interface ErrorStateProps {
  /** Error message */
  message?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Custom title */
  title?: string;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  title = 'Oops!',
}: ErrorStateProps) {
  return (
    <EmptyState
      icon="😵"
      title={title}
      description={message}
      action={onRetry ? { label: 'Try Again', onPress: onRetry } : undefined}
    />
  );
}

interface NoResultsProps {
  /** Search query that yielded no results */
  query?: string;
  /** Custom message */
  message?: string;
  /** Action to clear search */
  onClear?: () => void;
}

export function NoResults({ query, message, onClear }: NoResultsProps) {
  const description = message || (query ? `No results found for "${query}"` : 'No results found');

  return (
    <EmptyState
      icon="🔍"
      title="No Results"
      description={description}
      action={onClear ? { label: 'Clear Search', onPress: onClear } : undefined}
    />
  );
}
