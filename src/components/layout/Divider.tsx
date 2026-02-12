/**
 * Divider Component
 *
 * A visual separator for dividing content sections.
 * Supports horizontal and vertical orientations with organic styling.
 */

import { getColor } from '@/utils/design-tokens';

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
  default: getColor('neutral', '700'),
  subtle: getColor('neutral', '800'),
  strong: getColor('neutral', '600'),
};

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  spacing = 'md',
  className = '',
}: Readonly<DividerProps>) {
  const spacingValue = spacingValues[spacing];
  const color = colorMap[variant];

  const style: React.CSSProperties = {
    backgroundColor: color,
    ...(orientation === 'horizontal'
      ? {
          height: 1,
          width: '100%',
          marginTop: spacingValue,
          marginBottom: spacingValue,
        }
      : {
          width: 1,
          height: '100%',
          marginLeft: spacingValue,
          marginRight: spacingValue,
        }),
  };

  return <div style={style} className={className} />;
}
