import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { iconMap, type IconName } from './iconMap';

export interface IconProps extends Omit<ComponentProps<typeof Ionicons>, 'name'> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  return <Ionicons name={iconMap[name]} {...props} />;
}

