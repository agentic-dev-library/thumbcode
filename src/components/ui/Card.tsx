import { organicBorderRadius, organicShadow } from '@/lib/organic-styles';

/** Props for the Card component */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant controlling background and shadow style */
  variant?: 'default' | 'elevated';
}

/**
 * Render a styled container that applies variant-driven background, shadow, border, padding, and rounded corners.
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
        ${className}
      `}
      style={{
        ...organicBorderRadius.card,
        ...(variant === 'elevated' ? organicShadow.elevated : organicShadow.card),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
