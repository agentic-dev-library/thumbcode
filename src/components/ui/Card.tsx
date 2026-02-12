import { View, type ViewProps } from 'react-native';
import { organicBorderRadius, organicShadow } from '@/lib/organic-styles';

/** Props for the Card component */
interface CardProps extends ViewProps {
  /** Visual variant controlling background and shadow style */
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
    default: 'bg-surface',
    elevated: 'bg-surface-elevated',
  }[variant];

  return (
    <View
      className={`
        ${variantClasses}
        p-4
        border border-neutral-700
        ${className}
      `}
      style={[
        organicBorderRadius.card,
        variant === 'elevated' ? organicShadow.elevated : organicShadow.card,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
