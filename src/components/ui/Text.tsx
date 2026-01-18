import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'display' | 'body' | 'mono';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
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
}: TextProps) {
  const variantClass = {
    display: 'font-display',
    body: 'font-body',
    mono: 'font-mono',
  }[variant];
  
  const sizeClass = `text-${size}`;
  
  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight];
  
  return (
    <RNText 
      className={`${variantClass} ${sizeClass} ${weightClass} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
}