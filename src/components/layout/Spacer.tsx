/**
 * Spacer Component
 *
 * A flexible space component that expands to fill available space
 * or provides fixed spacing between siblings.
 */

import { View, type ViewStyle } from 'react-native';

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/** Props for the Spacer component */
interface SpacerProps {
  /** Fixed size in pixels or preset */
  size?: SpacerSize;
  /** Flex factor for flexible spacing */
  flex?: number;
  /** Direction of spacing */
  direction?: 'horizontal' | 'vertical';
}

const sizeValues: Record<Exclude<SpacerSize, number>, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function Spacer({ size, flex = 1, direction = 'vertical' }: SpacerProps) {
  const dimension = size ? (typeof size === 'number' ? size : sizeValues[size]) : undefined;

  const style: ViewStyle = {
    flex: size ? undefined : flex,
    width: direction === 'horizontal' ? dimension : undefined,
    height: direction === 'vertical' ? dimension : undefined,
  };

  return <View style={style} />;
}
