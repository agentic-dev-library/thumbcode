/**
 * Icon Map
 *
 * Maps semantic icon names to Lucide icon component names.
 * This keeps the rest of the UI kit independent of a specific icon library.
 */

export type IconName = 'back' | 'alertSuccess' | 'alertError' | 'alertWarning' | 'alertInfo';

export const iconMap: Record<IconName, string> = {
  back: 'ArrowLeft',
  alertSuccess: 'CircleCheck',
  alertError: 'CircleAlert',
  alertWarning: 'TriangleAlert',
  alertInfo: 'Info',
};
