/**
 * Divider Component
 *
 * A visual separator for dividing content sections.
 * Supports horizontal and vertical orientations with organic styling.
 */

import { View, type ViewStyle } from 'react-native';

interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Color theme */
  variant?: 'default' | 'subtle' | 'strong';
  /** Spacing around the divider */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom className for styling */
  className?: string;
}

const spacingValues: Record<'none' | 'sm' | 'md' | 'lg', number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

const colorMap: Record<'default' | 'subtle' | 'strong', string> = {
  default: '#334155', // surface-elevated
  subtle: '#1E293B', // surface
  strong: '#475569', // neutral-600
};

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  spacing = 'md',
  className = '',
}: DividerProps) {
  const spacingValue = spacingValues[spacing];
  const color = colorMap[variant];

  const style: ViewStyle = {
    backgroundColor: color,
    ...(orientation === 'horizontal'
      ? {
          height: 1,
          width: '100%',
          marginVertical: spacingValue,
        }
      : {
          width: 1,
          height: '100%',
          marginHorizontal: spacingValue,
        }),
  };

  return <View style={style} className={className} />;
}
