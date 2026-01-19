/**
 * Stack Component
 *
 * A flex-based layout component for arranging children vertically or horizontally.
 * Provides consistent spacing between children.
 */

import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

type StackDirection = 'row' | 'column';
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface StackProps {
  children: ReactNode;
  direction?: StackDirection;
  spacing?: StackSpacing;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  flex?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const spacingValues: Record<Exclude<StackSpacing, number>, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const alignMap: Record<StackAlign, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<StackJustify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export function Stack({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  flex,
  className = '',
  style,
}: StackProps) {
  const gap = typeof spacing === 'number' ? spacing : spacingValues[spacing];

  const baseStyle: ViewStyle = {
    flexDirection: direction,
    gap,
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    flex,
  };

  // Flatten the style prop to merge with base styles
  const flattenedStyle = style ? StyleSheet.flatten(style) : undefined;
  const stackStyle: ViewStyle = flattenedStyle ? { ...baseStyle, ...flattenedStyle } : baseStyle;

  return (
    <View style={stackStyle} className={className}>
      {children}
    </View>
  );
}

/**
 * HStack - Horizontal Stack shorthand
 */
export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="row" />;
}

/**
 * VStack - Vertical Stack shorthand
 */
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="column" />;
}
