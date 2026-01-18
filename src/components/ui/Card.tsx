import { View, ViewProps } from 'react-native';

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
        rounded-[1rem_0.75rem_1.25rem_0.5rem]
        border border-neutral-200
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}