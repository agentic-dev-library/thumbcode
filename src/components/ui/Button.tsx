import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';
import { Text } from './Text';

/** Brand colors from design tokens for spinner */
const SPINNER_COLORS = {
  light: getColor('neutral', '800'),
  dark: getColor('neutral', '50'),
} as const;

/** Props for the Button component */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size preset controlling padding */
  size?: 'sm' | 'md' | 'lg';
  /** When true, shows a spinner and disables interaction */
  loading?: boolean;
  /** Additional Tailwind class names */
  className?: string;
  /** Button label or content */
  children: React.ReactNode;
}

/**
 * Render a styled button supporting variants, sizes, and a loading state.
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
}: Readonly<ButtonProps>) {
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
  const spinnerBorder =
    variant === 'outline' ? `border-neutral-800` : `border-white`;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`
        ${variantClasses}
        ${sizeClasses}
        shadow-md
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      style={{
        ...organicBorderRadius.button,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <div
          data-testid="activity-indicator"
          className={`w-5 h-5 border-2 ${spinnerBorder} border-t-transparent rounded-full animate-spin mx-auto`}
        />
      ) : (
        <Text className={`${textColorClass} text-center font-semibold`}>{children}</Text>
      )}
    </button>
  );
}
