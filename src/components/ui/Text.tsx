/** Props for the Text component */
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Font family variant (display, body, or monospace) */
  variant?: 'display' | 'body' | 'mono';
  /** Text size preset */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Additional Tailwind class names */
  className?: string;
  /** Truncation - max number of lines (maps to CSS line-clamp) */
  numberOfLines?: number;
  /** Test ID */
  testID?: string;
  /** Accessibility role */
  accessibilityRole?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility elements hidden */
  accessibilityElementsHidden?: boolean;
}

/**
 * A Text component that standardizes typography by applying font variant, size, and weight classes.
 *
 * @param variant - Font variant to use; one of `"display"`, `"body"`, or `"mono"`. Defaults to `"body"`.
 * @param size - Text size to apply. Defaults to `"base"`.
 * @param weight - Font weight to apply. Defaults to `"normal"`.
 * @param className - Additional class names to append to the computed classes.
 * @returns A span element with class names composed from `variant`, `size`, `weight`, and `className`.
 */
export function Text({
  variant = 'body',
  size = 'base',
  weight = 'normal',
  className = '',
  children,
  numberOfLines,
  testID,
  accessibilityRole,
  accessibilityLabel,
  accessibilityElementsHidden,
  style,
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

  const lineClampStyle: React.CSSProperties | undefined = numberOfLines
    ? {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
      }
    : undefined;

  const ariaProps: Record<string, unknown> = {};
  if (accessibilityRole) {
    ariaProps.role = accessibilityRole as React.AriaRole;
    if (accessibilityLabel) {
      ariaProps['aria-label'] = accessibilityLabel;
    }
  }
  if (accessibilityElementsHidden !== undefined) {
    ariaProps['aria-hidden'] = accessibilityElementsHidden;
  }

  return (
    <span
      className={`${variantClass} ${sizeClass} ${weightClass} ${className}`}
      style={{ ...lineClampStyle, ...style }}
      data-testid={testID}
      {...ariaProps}
      {...props}
    >
      {children}
    </span>
  );
}
