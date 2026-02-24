/**
 * Icon Component (Web)
 *
 * A semantic icon component using Lucide icons.
 * Replaces the @expo/vector-icons Ionicons-based implementation.
 */

import { ArrowLeft, CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { IconName } from './iconMap';

const iconComponents = {
  back: ArrowLeft,
  alertSuccess: CircleCheck,
  alertError: CircleAlert,
  alertWarning: TriangleAlert,
  alertInfo: Info,
} as const;

export interface IconProps {
  /** Semantic icon name */
  name: IconName;
  /** Icon size in pixels */
  size?: number;
  /** Icon color (CSS color value) */
  color?: string;
  /** Additional CSS class names */
  className?: string;
}

export function Icon({ name, size = 24, color, className }: IconProps) {
  const LucideIcon = iconComponents[name];
  return <LucideIcon size={size} color={color} className={className} />;
}
