/**
 * Loading Components
 *
 * Spinner and skeleton loading states with organic styling.
 * Web-native implementation using CSS animations.
 */

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white';
  /** Optional label */
  label?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-[3px]',
  lg: 'w-8 h-8 border-4',
};

const spinnerColors = {
  primary: 'border-coral-500/20 border-t-coral-500',
  secondary: 'border-teal-500/20 border-t-teal-500',
  white: 'border-neutral-50/20 border-t-neutral-50',
};

export function Spinner({ size = 'md', color = 'primary', label }: Readonly<SpinnerProps>) {
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-full animate-spin ${spinnerSizes[size]} ${spinnerColors[color]}`} />
      {label && <span className="font-body text-sm text-neutral-400 mt-2">{label}</span>}
    </div>
  );
}

interface SkeletonProps {
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Whether it's a circle */
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
}: Readonly<SkeletonProps>) {
  const dimension = circle ? height : undefined;

  return (
    <div
      className="bg-neutral-700 animate-pulse"
      style={{
        width: circle ? dimension : width,
        height: circle ? dimension : height,
        borderRadius: circle ? (dimension ?? 40) / 2 : borderRadius,
      }}
    />
  );
}

/** Pre-composed skeleton for a text block with multiple lines */
export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
}: Readonly<{ lines?: number; lastLineWidth?: string | number }>) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }, (_, lineIndex) => {
        const lineKey = `skel-line-${lineIndex}`;
        return (
          <Skeleton
            key={lineKey}
            width={lineIndex === lines - 1 ? lastLineWidth : '100%'}
            height={14}
          />
        );
      })}
    </div>
  );
}

/** Pre-composed skeleton for a card layout (avatar + text) */
export function SkeletonCard() {
  return (
    <div className="bg-surface p-4 rounded-organic-card animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton circle height={40} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton width="50%" height={14} />
          <Skeleton width="30%" height={12} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message */
  message?: string;
}

export function LoadingOverlay({ visible, message }: Readonly<LoadingOverlayProps>) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center z-50">
      <div
        className="bg-surface-elevated p-6 flex flex-col items-center"
        style={{ borderRadius: '1rem 0.75rem 1.25rem 0.5rem' }}
      >
        <Spinner size="lg" />
        {message && <span className="font-body text-white mt-4 text-center">{message}</span>}
      </div>
    </div>
  );
}
