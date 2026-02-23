import { Text } from '../primitives/Text';
import { themeTokens } from '../theme/ThemeProvider';

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
export function Spinner({
  size = 'large',
  color = themeTokens.colors.coral[500],
  label,
}: SpinnerProps) {
  const _accessibilityLabel = label || 'Loading...';

  return (
    <div className="items-center">
      <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
      {label && (
        <Text className="mt-2 text-neutral-400" size="sm" accessibilityElementsHidden>
          {label}
        </Text>
      )}
    </div>
  );
}
