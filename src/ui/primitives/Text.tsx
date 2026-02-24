/**
 * Text Component (Web Primitive)
 *
 * A <span> wrapper replacing React Native's Text.
 * Supports variant, size, weight, className, and accessibilityRole mapped to HTML role.
 */

import type { CSSProperties, ReactNode } from 'react';

export interface TextProps {
  /** Font family variant (display, body, or monospace) */
  variant?: 'display' | 'body' | 'mono';
  /** Text size preset */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessibility role mapped to HTML role attribute */
  accessibilityRole?: string;
  /** Accessibility label (mapped to aria-label) */
  accessibilityLabel?: string;
  /** Accessibility elements hidden (mapped to aria-hidden) */
  accessibilityElementsHidden?: boolean;
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Number of lines to truncate to (applies CSS line-clamp) */
  numberOfLines?: number;
  /** Child elements */
  children?: ReactNode;
}

const variantClassMap = {
  display: 'font-display',
  body: 'font-body',
  mono: 'font-mono',
} as const;

const sizeClassMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
} as const;

const weightClassMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * A Text component that standardizes typography by applying font variant, size, and weight classes.
 *
 * @param variant - Font variant to use; one of "display", "body", or "mono". Defaults to "body".
 * @param size - Text size to apply. Defaults to "base".
 * @param weight - Font weight to apply. Defaults to "normal".
 * @param className - Additional class names to append to the computed classes.
 * @param accessibilityRole - Mapped to HTML role attribute.
 * @param numberOfLines - When set, truncates text with CSS line-clamp.
 * @returns A <span> element with class names composed from variant, size, weight, and className.
 */
export function Text({
  variant = 'body',
  size = 'base',
  weight = 'normal',
  className = '',
  style,
  accessibilityRole,
  accessibilityLabel,
  accessibilityElementsHidden,
  testID,
  numberOfLines,
  children,
}: Readonly<TextProps>) {
  const variantClass = variantClassMap[variant];
  const sizeClass = sizeClassMap[size];
  const weightClass = weightClassMap[weight];

  const truncateStyle: CSSProperties | undefined = numberOfLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : undefined;

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label is conditionally applied only when an explicit role is set
    <span
      className={`${variantClass} ${sizeClass} ${weightClass} ${className}`}
      style={{ ...truncateStyle, ...style }}
      role={accessibilityRole as React.AriaRole}
      aria-label={accessibilityRole ? accessibilityLabel : undefined}
      aria-hidden={accessibilityElementsHidden}
      data-testid={testID}
    >
      {children}
    </span>
  );
}
