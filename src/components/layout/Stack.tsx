/**
 * Stack Component
 *
 * A flex-based layout component for arranging children vertically or horizontally.
 * Provides consistent spacing between children.
 */

import type { ReactNode } from 'react';

type StackDirection = 'row' | 'column';
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/** Props for the Stack layout component */
interface StackProps {
  /** Child components to arrange in the stack */
  children: ReactNode;
  /** Layout direction of the stack */
  direction?: StackDirection;
  /** Gap between children (preset name or pixel value) */
  spacing?: StackSpacing;
  /** Cross-axis alignment of children */
  align?: StackAlign;
  /** Main-axis alignment of children */
  justify?: StackJustify;
  /** Whether children should wrap to the next line */
  wrap?: boolean;
  /** Flex factor for the stack container */
  flex?: number;
  /** Additional Tailwind class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties | React.CSSProperties[];
}

const spacingValues: Record<Exclude<StackSpacing, number>, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const alignMap: Record<StackAlign, React.CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<StackJustify, React.CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

function flattenStyle(style?: React.CSSProperties | React.CSSProperties[]): React.CSSProperties | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.filter(Boolean));
  }
  return style;
}

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
}: Readonly<StackProps>) {
  const gap = typeof spacing === 'number' ? spacing : spacingValues[spacing];

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap,
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    flex,
  };

  const flattenedStyle = flattenStyle(style);
  const stackStyle: React.CSSProperties = flattenedStyle ? { ...baseStyle, ...flattenedStyle } : baseStyle;

  return (
    <div style={stackStyle} className={className}>
      {children}
    </div>
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
