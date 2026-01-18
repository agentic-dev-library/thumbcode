import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { Text } from '../primitives/Text';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Render a styled Pressable button supporting variants, sizes, and a loading state.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius.
 *
 * @param variant - Visual style of the button: 'primary', 'secondary', 'outline', or 'ghost' (default 'primary')
 * @param size - Size of the button: 'sm', 'md', or 'lg' (default 'md')
 * @param loading - When true, shows a spinner instead of the label and disables interaction
 * @param disabled - When true, disables interaction and reduces opacity
 * @param className - Additional class names appended to the computed button classes
 * @param children - Button label or content rendered when not loading
 * @returns A Pressable element styled with organic border-radius and brand colors
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
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

  const textColorClass = variant === 'outline' || variant === 'ghost' ? 'text-neutral-800' : 'text-white';

  return (
    <Pressable
      disabled={disabled || loading}
      className={`
        ${variantClasses}
        ${sizeClasses}
        rounded-[0.5rem_0.75rem_0.625rem_0.875rem]
        shadow-md
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      style={{
        transform: [{ rotate: '-0.2deg' }],
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#1E293B' : '#FFFFFF'} />
      ) : (
        <Text className={`${textColorClass} text-center font-semibold`}>{children}</Text>
      )}
    </Pressable>
  );
}
