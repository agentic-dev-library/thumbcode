/**
 * Toast Component
 *
 * Temporary notification messages with auto-dismiss.
 * Web-native implementation using CSS transitions.
 * Supports different variants for success, error, warning, and info.
 */

import { useEffect, useState } from 'react';
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  /** Whether the toast is visible */
  visible: boolean;
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Variant determines color and icon */
  variant?: ToastVariant;
  /** Position on screen */
  position?: ToastPosition;
  /** Auto-dismiss duration in ms (0 to disable) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface VariantStyle {
  bg: string;
  borderColor: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
}

const variantStyles: Record<ToastVariant, VariantStyle> = {
  success: {
    bg: 'bg-teal-600/20',
    borderColor: '#14B8A6',
    Icon: CircleCheck,
    iconClass: 'text-teal-500',
  },
  error: {
    bg: 'bg-coral-500/20',
    borderColor: '#FF7059',
    Icon: CircleAlert,
    iconClass: 'text-coral-500',
  },
  warning: {
    bg: 'bg-gold-500/20',
    borderColor: '#F5D563',
    Icon: TriangleAlert,
    iconClass: 'text-gold-400',
  },
  info: {
    bg: 'bg-neutral-600/20',
    borderColor: '#64748B',
    Icon: Info,
    iconClass: 'text-neutral-400',
  },
};

export function Toast({
  visible,
  message,
  title,
  variant = 'info',
  position = 'bottom',
  duration = 4000,
  onDismiss,
  action,
}: Readonly<ToastProps>) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setIsAnimating(true));

      if (duration > 0) {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [visible, duration, onDismiss]);

  if (!visible && !isAnimating) return null;

  const styles = variantStyles[variant];
  const positionClass = position === 'top' ? 'top-4' : 'bottom-4';
  const translateClass = isAnimating
    ? 'translate-y-0 opacity-100'
    : position === 'top'
      ? '-translate-y-4 opacity-0'
      : 'translate-y-4 opacity-0';

  return (
    <div
      className={`fixed left-4 right-4 z-50 ${positionClass} transition-all duration-300 ease-out ${translateClass}`}
      role="alert"
      aria-live="polite"
      onTransitionEnd={() => {
        if (!visible) setIsAnimating(false);
      }}
    >
      <div
        className={`flex items-start p-4 ${styles.bg}`}
        style={{
          borderRadius: '14px 12px 16px 10px',
          borderLeftWidth: 4,
          borderLeftColor: styles.borderColor,
        }}
      >
        <span className="mr-3 shrink-0">
          <styles.Icon size={20} className={styles.iconClass} />
        </span>

        <div className="flex-1 min-w-0">
          {title && (
            <span className="block font-display text-base text-white mb-1">{title}</span>
          )}
          <span className="block font-body text-sm text-neutral-200">{message}</span>
        </div>

        <div className="flex items-center ml-2 shrink-0">
          {action && (
            <button
              onClick={action.onPress}
              className="mr-3 font-body text-sm text-teal-400 font-semibold hover:text-teal-300 transition-colors"
              type="button"
            >
              {action.label}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Dismiss notification"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
