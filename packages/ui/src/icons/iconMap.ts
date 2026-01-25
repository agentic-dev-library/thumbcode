import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Semantic icon names for the UI package.
 *
 * This keeps the rest of the UI kit independent of a specific icon library.
 */
export type IconName = 'back' | 'alertSuccess' | 'alertError' | 'alertWarning' | 'alertInfo';

export const iconMap: Record<IconName, IoniconName> = {
  back: 'arrow-back',
  alertSuccess: 'checkmark-circle',
  alertError: 'alert-circle',
  alertWarning: 'warning',
  alertInfo: 'information-circle',
};

