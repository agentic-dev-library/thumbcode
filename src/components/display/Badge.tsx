/**
 * Badge Component
 *
 * Small status indicators and labels with organic styling.
 * Uses paint daube icons for brand consistency.
 */

import type React from 'react';
import { View } from 'react-native';
import { CloseIcon, type IconColor, SuccessIcon } from '@/components/icons';
import { organicBorderRadius } from '@/lib/organic-styles';
import { Text } from '@/components/ui';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

/** Badge icon component type */
type BadgeIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface BadgeProps {
  /** Badge text content */
  children: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: BadgeSize;
  /** Optional icon component */
  Icon?: BadgeIconComponent;
  /** Icon color override */
  iconColor?: IconColor;
  /** Optional text icon (for simple indicators like dots) */
  textIcon?: string;
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
  Icon,
  iconColor,
  textIcon,
  dot = false,
}: BadgeProps) {
  const colors = variantStyles[variant];
  const sizing = sizeStyles[size];

  // Icon sizes based on badge size
  const iconSizes = { sm: 10, md: 12, lg: 14 };
  const iconSize = iconSizes[size];

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
      style={organicBorderRadius.badge}
    >
      {Icon && (
        <View className="mr-1">
          <Icon size={iconSize} color={iconColor || 'warmGray'} turbulence={0.15} />
        </View>
      )}
      {textIcon && !Icon && (
        <Text className={`mr-1 ${colors.text} ${sizing.text}`}>{textIcon}</Text>
      )}
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
  {
    variant: BadgeVariant;
    Icon?: BadgeIconComponent;
    textIcon?: string;
    iconColor: IconColor;
    label: string;
  }
> = {
  active: { variant: 'success', textIcon: '●', iconColor: 'teal', label: 'Active' },
  inactive: { variant: 'default', textIcon: '○', iconColor: 'warmGray', label: 'Inactive' },
  pending: { variant: 'warning', textIcon: '◐', iconColor: 'gold', label: 'Pending' },
  error: { variant: 'error', Icon: CloseIcon, iconColor: 'coral', label: 'Error' },
  success: { variant: 'success', Icon: SuccessIcon, iconColor: 'teal', label: 'Success' },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      Icon={config.Icon}
      iconColor={config.iconColor}
      textIcon={config.textIcon}
    >
      {label || config.label}
    </Badge>
  );
}
