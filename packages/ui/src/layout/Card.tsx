import { View, type ViewProps } from 'react-native';
import { organicBorderRadius, organicShadow } from '../theme/organicStyles';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * Render a styled container View that applies variant-driven background, shadow, border, padding, and rounded corners.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius and subtle rotation.
 *
 * @param variant - Visual variant of the card: `"default"` uses a white background; `"elevated"` adds shadow; `"outlined"` adds border.
 * @param className - Additional Tailwind-style class names to append to the card's classes.
 * @returns A React Native `View` element styled as a card containing the provided children.
 */
export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-surface',
    elevated: 'bg-surface-elevated',
    outlined: 'bg-surface border border-neutral-700',
  }[variant];

  return (
    <View
      className={`
        ${variantClasses}
        p-4
        ${className}
      `}
      style={[
        organicBorderRadius.card,
        variant === 'elevated' ? organicShadow.elevated : organicShadow.card,
        { transform: [{ rotate: '-0.3deg' }] },
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
