import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/** Props for the Text component */
interface TextProps extends RNTextProps {
  /** Font family variant (display, body, or monospace) */
  variant?: 'display' | 'body' | 'mono';
  /** Text size preset */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Additional NativeWind class names */
  className?: string;
}

/**
 * A Text component that standardizes typography by applying font variant, size, and weight classes.
 *
 * @param variant - Font variant to use; one of `"display"`, `"body"`, or `"mono"`. Defaults to `"body"`.
 * @param size - Text size to apply; one of `"xs"`, `"sm"`, `"base"`, `"lg"`, `"xl"`, `"2xl"`, `"3xl"`, `"4xl"`, or `"5xl"`. Defaults to `"base"`.
 * @param weight - Font weight to apply; one of `"normal"`, `"medium"`, `"semibold"`, or `"bold"`. Defaults to `"normal"`.
 * @param className - Additional class names to append to the computed classes.
 * @returns A React Native `Text` element with class names composed from `variant`, `size`, `weight`, and `className`.
 */
export function Text({
  variant = 'body',
  size = 'base',
  weight = 'normal',
  className = '',
  children,
  ...props
}: Readonly<TextProps>) {
  const variantClass = {
    display: 'font-display',
    body: 'font-body',
    mono: 'font-mono',
  }[variant];

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  }[size];

  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight];

  return (
    <RNText className={`${variantClass} ${sizeClass} ${weightClass} ${className}`} {...props}>
      {children}
    </RNText>
  );
}
