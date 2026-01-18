import { View, type ViewProps } from 'react-native';

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
    default: 'bg-white',
    elevated: 'bg-neutral-50 shadow-lg',
    outlined: 'bg-white border border-neutral-200',
  }[variant];

  return (
    <View
      className={`
        ${variantClasses}
        p-4
        rounded-[1rem_0.75rem_1.25rem_0.5rem]
        ${className}
      `}
      style={{
        transform: [{ rotate: '-0.3deg' }],
      }}
      {...props}
    >
      {children}
    </View>
  );
}
