import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  variant?: 'default' | 'padded' | 'centered';
  children: ReactNode;
}

/**
 * A container component that provides consistent spacing and layout.
 *
 * @param variant - Layout variant: 'default' fills available space, 'padded' adds padding, 'centered' centers content.
 * @param className - Additional class names to append.
 * @returns A View element with appropriate layout styling.
 */
export function Container({ variant = 'default', className = '', children, ...props }: ContainerProps) {
  const variantClasses = {
    default: 'flex-1 bg-charcoal',
    padded: 'flex-1 bg-charcoal p-4',
    centered: 'flex-1 bg-charcoal items-center justify-center',
  }[variant];

  return (
    <View className={`${variantClasses} ${className}`} {...props}>
      {children}
    </View>
  );
}
