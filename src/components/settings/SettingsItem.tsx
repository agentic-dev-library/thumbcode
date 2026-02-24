/**
 * SettingsItem
 *
 * Reusable row component for settings screens with icon, text, toggle, and navigation arrow.
 */

import type React from 'react';
import { Badge } from '@/components/display';
import type { IconColor } from '@/components/icons';
import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

export interface SettingsItemProps {
  Icon: React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;
  iconColor?: IconColor;
  title: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  showArrow?: boolean;
  onPress?: () => void;
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
}

export function SettingsItem({
  Icon,
  iconColor = 'warmGray',
  title,
  subtitle,
  value,
  badge,
  showArrow = true,
  onPress,
  toggle,
}: Readonly<SettingsItemProps>) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress && !toggle}
      className={`py-4 ${onPress ? 'active:bg-neutral-800' : ''}`}
    >
      <HStack align="center">
        <div className="w-10 h-10 flex items-center justify-center bg-surface-elevated mr-4 rounded-organic-badge">
          <Icon size={22} color={iconColor} turbulence={0.2} />
        </div>

        <VStack spacing="none" className="flex-1">
          <HStack align="center">
            <Text className="text-white">{title}</Text>
            {badge && (
              <div className="ml-2">
                <Badge variant="success" size="sm">
                  {badge}
                </Badge>
              </div>
            )}
          </HStack>
          {subtitle && (
            <Text size="sm" className="text-neutral-500">
              {subtitle}
            </Text>
          )}
        </VStack>

        {value && <Text className="text-neutral-400 mr-2">{value}</Text>}

        {toggle && (
          <input
            type="checkbox"
            checked={toggle.value}
            onChange={(e) => toggle.onValueChange(e.target.checked)}
          />
        )}

        {showArrow && !toggle && <Text className="text-neutral-600">›</Text>}
      </HStack>
    </button>
  );
}
