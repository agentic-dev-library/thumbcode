/**
 * Badge Component
 *
 * Small status indicators and labels with organic styling.
 */

import { Text, View } from 'react-native';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  /** Badge text content */
  children: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: BadgeSize;
  /** Optional icon (emoji or text) */
  icon?: string;
  /** Whether to show as a dot only (no text) */
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'bg-neutral-600', text: 'text-neutral-200' },
  primary: { bg: 'bg-coral-500/20', text: 'text-coral-400' },
  secondary: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  success: { bg: 'bg-teal-600/20', text: 'text-teal-400' },
  warning: { bg: 'bg-gold-500/20', text: 'text-gold-400' },
  error: { bg: 'bg-coral-500/20', text: 'text-coral-400' },
};

const sizeStyles: Record<BadgeSize, { px: string; py: string; text: string; dot: number }> = {
  sm: { px: 'px-1.5', py: 'py-0.5', text: 'text-xs', dot: 6 },
  md: { px: 'px-2', py: 'py-0.5', text: 'text-xs', dot: 8 },
  lg: { px: 'px-2.5', py: 'py-1', text: 'text-sm', dot: 10 },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
}: BadgeProps) {
  const colors = variantStyles[variant];
  const sizing = sizeStyles[size];

  if (dot) {
    return (
      <View
        className={colors.bg.replace('/20', '')}
        style={{
          width: sizing.dot,
          height: sizing.dot,
          borderRadius: sizing.dot / 2,
        }}
      />
    );
  }

  return (
    <View
      className={`flex-row items-center ${colors.bg} ${sizing.px} ${sizing.py}`}
      style={{ borderRadius: '6px 8px 6px 10px' }}
    >
      {icon && <Text className={`mr-1 ${sizing.text}`}>{icon}</Text>}
      <Text className={`font-body font-medium ${colors.text} ${sizing.text}`}>{children}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  /** Status type */
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  /** Optional label (defaults to status name) */
  label?: string;
  /** Size variant */
  size?: BadgeSize;
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { variant: BadgeVariant; icon: string; label: string }
> = {
  active: { variant: 'success', icon: '●', label: 'Active' },
  inactive: { variant: 'default', icon: '○', label: 'Inactive' },
  pending: { variant: 'warning', icon: '◐', label: 'Pending' },
  error: { variant: 'error', icon: '✕', label: 'Error' },
  success: { variant: 'success', icon: '✓', label: 'Success' },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} icon={config.icon}>
      {label || config.label}
    </Badge>
  );
}
