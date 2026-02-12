import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';
import { Text } from './Text';

/** Brand colors from design tokens for ActivityIndicator */
const ACTIVITY_INDICATOR_COLORS = {
  light: getColor('neutral', '800'), // neutral-800 for outline variant
  dark: getColor('neutral', '50'), // off-white for filled variants
} as const;

/** Props for the Button component */
interface ButtonProps extends PressableProps {
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size preset controlling padding */
  size?: 'sm' | 'md' | 'lg';
  /** When true, shows a spinner and disables interaction */
  loading?: boolean;
  /** Additional NativeWind class names */
  className?: string;
  /** Button label or content */
  children: React.ReactNode;
}

/**
 * Render a styled Pressable button supporting variants, sizes, and a loading state.
 *
 * Renders an interactive Pressable that is disabled while `disabled` or `loading` is true.
 *
 * @param variant - Visual style of the button: 'primary', 'secondary', or 'outline' (default 'primary')
 * @param size - Size of the button: 'sm', 'md', or 'lg' (default 'md')
 * @param loading - When true, shows a spinner instead of the label and disables interaction
 * @param disabled - When true, disables interaction and reduces opacity
 * @param className - Additional class names appended to the computed button classes
 * @param children - Button label or content rendered when not loading
 * @returns A Pressable element that shows an ActivityIndicator when loading or the provided children as the label otherwise
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  style,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-coral-500 active:bg-coral-700',
    secondary: 'bg-teal-600 active:bg-teal-800',
    outline: 'bg-transparent border-2 border-neutral-200 active:border-teal-400',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }[size];

  const textColorClass = variant === 'outline' ? 'text-neutral-800' : 'text-white';
  const indicatorColor =
    variant === 'outline' ? ACTIVITY_INDICATOR_COLORS.light : ACTIVITY_INDICATOR_COLORS.dark;

  return (
    <Pressable
      disabled={disabled || loading}
      className={`
        ${variantClasses}
        ${sizeClasses}
        shadow-md
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      style={(state) => [
        organicBorderRadius.button,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator testID="activity-indicator" color={indicatorColor} />
      ) : (
        <Text className={`${textColorClass} text-center font-semibold`}>{children}</Text>
      )}
    </Pressable>
  );
}
