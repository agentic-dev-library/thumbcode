import { View, type ViewProps } from 'react-native';
import { organicBorderRadius } from '@/lib/organic-styles';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

/**
 * Render a styled container View that applies variant-driven background, shadow, border, padding, and rounded corners to present content as a card.
 *
 * @param variant - Visual variant of the card: `"default"` uses a white background; `"elevated"` adds a neutral background and shadow.
 * @param className - Additional Tailwind-style class names to append to the card's classes.
 * @returns A React Native `View` element styled as a card containing the provided children.
 */
export function Card({
  variant = 'default',
  className = '',
  children,
  style,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-neutral-50 shadow-lg',
  }[variant];

  return (
    <View
      className={`
        ${variantClasses}
        p-4
        border border-neutral-200
        ${className}
      `}
      style={[organicBorderRadius.card, style]}
      {...props}
    >
      {children}
    </View>
  );
}
