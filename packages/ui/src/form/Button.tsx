import { Text } from '../primitives/Text';
import { organicBorderRadius } from '../theme/organicStyles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Render a styled button supporting variants, sizes, and a loading state.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius.
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
    ghost: 'bg-transparent active:bg-neutral-100',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }[size];

  const textColorClass =
    variant === 'outline' || variant === 'ghost' ? 'text-neutral-800' : 'text-white';
  const spinnerBorder =
    variant === 'outline' || variant === 'ghost' ? 'border-neutral-800' : 'border-white';

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
