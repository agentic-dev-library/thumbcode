/**
 * Container Component
 *
 * A wrapper component that provides consistent padding and max-width constraints.
 */

import type { ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Props for the Container component */
interface ContainerProps {
  /** Child components to render inside the container */
  children: ReactNode;
  /** Maximum width constraint for the container */
  size?: ContainerSize;
  /** Padding amount applied to the container */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to apply safe area insets (ignored on web) */
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal';
  /** Whether to center the container horizontally */
  center?: boolean;
  /** Additional Tailwind class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const sizeStyles: Record<ContainerSize, number | undefined> = {
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  full: undefined,
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

export function Container({
  children,
  size = 'full',
  padding = 'md',
  safeArea: _safeArea = false,
  center = false,
  className = '',
  style,
}: Readonly<ContainerProps>) {
  const maxWidth = sizeStyles[size];
  const paddingValue = paddingStyles[padding];

  const containerStyle: React.CSSProperties = {
    flex: 1,
    padding: paddingValue,
    maxWidth,
    width: '100%',
    alignSelf: center ? 'center' : undefined,
    ...style,
  };

  return (
    <div style={containerStyle} className={`bg-transparent ${className}`}>
      {children}
    </div>
  );
}
