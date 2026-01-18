/**
 * Container Component
 *
 * A wrapper component that provides consistent padding and max-width constraints.
 * Supports responsive sizing and safe area insets.
 */

import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal';
  center?: boolean;
  className?: string;
  style?: ViewStyle;
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
  safeArea = false,
  center = false,
  className = '',
  style,
}: ContainerProps) {
  const insets = useSafeAreaInsets();

  const maxWidth = sizeStyles[size];
  const paddingValue = paddingStyles[padding];

  const safeAreaStyle: ViewStyle = {};
  if (safeArea === true) {
    safeAreaStyle.paddingTop = insets.top;
    safeAreaStyle.paddingBottom = insets.bottom;
    safeAreaStyle.paddingLeft = insets.left;
    safeAreaStyle.paddingRight = insets.right;
  } else if (safeArea === 'top') {
    safeAreaStyle.paddingTop = insets.top;
  } else if (safeArea === 'bottom') {
    safeAreaStyle.paddingBottom = insets.bottom;
  } else if (safeArea === 'horizontal') {
    safeAreaStyle.paddingLeft = insets.left;
    safeAreaStyle.paddingRight = insets.right;
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    padding: paddingValue,
    maxWidth,
    width: '100%',
    alignSelf: center ? 'center' : undefined,
    ...safeAreaStyle,
    ...style,
  };

  return (
    <View style={containerStyle} className={`bg-transparent ${className}`}>
      {children}
    </View>
  );
}
