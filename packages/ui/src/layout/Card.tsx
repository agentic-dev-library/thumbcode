interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

/**
 * Render a styled container that applies variant-driven background, shadow, border, padding, and rounded corners.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius.
 */
export function Card({
  variant = 'default',
  className = '',
  children,
  style,
  ...props
}: Readonly<CardProps>) {
  const variantClasses = {
    default: 'bg-surface',
    elevated: 'bg-surface-elevated',
  }[variant];

  return (
    <div
      className={`
        ${variantClasses}
        p-4
        border border-neutral-700
        rounded-organic-card
        ${variant === 'elevated' ? 'shadow-organic-elevated' : 'shadow-organic-card'}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
