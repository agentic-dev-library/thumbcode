import { ActivityIndicator, View } from 'react-native';
import { Text } from '../primitives/Text';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  label?: string;
}

/**
 * A spinner component for loading states.
 * Uses ThumbCode's coral color by default.
 *
 * @param size - Size of the spinner: 'small' or 'large'. Defaults to 'large'.
 * @param color - Color of the spinner. Defaults to coral-500.
 * @param label - Optional label to display below the spinner.
 * @returns A View element containing an ActivityIndicator and optional label.
 */
export function Spinner({ size = 'large', color = '#FF7059', label }: SpinnerProps) {
  const accessibilityLabel = label || 'Loading...';

  return (
    <View className="items-center">
      <ActivityIndicator
        size={size}
        color={color}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Content is loading"
      />
      {label && (
        <Text className="mt-2 text-neutral-400" size="sm" accessibilityElementsHidden>
          {label}
        </Text>
      )}
    </View>
  );
}
