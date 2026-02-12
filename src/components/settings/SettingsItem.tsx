/**
 * SettingsItem
 *
 * Reusable row component for settings screens with icon, text, toggle, and navigation arrow.
 */

import type React from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Badge } from '@/components/display';
import { type IconColor } from '@/components/icons';
import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

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
    <Pressable
      onPress={onPress}
      disabled={!onPress && !toggle}
      className={`py-4 ${onPress ? 'active:bg-neutral-800' : ''}`}
    >
      <HStack align="center">
        <View
          className="w-10 h-10 bg-surface-elevated items-center justify-center mr-4"
          style={organicBorderRadius.badge}
        >
          <Icon size={22} color={iconColor} turbulence={0.2} />
        </View>

        <VStack spacing="none" className="flex-1">
          <HStack align="center">
            <Text className="text-white">{title}</Text>
            {badge && (
              <View className="ml-2">
                <Badge variant="success" size="sm">
                  {badge}
                </Badge>
              </View>
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
          <Switch
            value={toggle.value}
            onValueChange={toggle.onValueChange}
            trackColor={{ false: getColor('neutral', '700'), true: getColor('teal', '600') }}
            thumbColor={toggle.value ? getColor('neutral', '50') : getColor('neutral', '400')}
          />
        )}

        {showArrow && !toggle && <Text className="text-neutral-600">›</Text>}
      </HStack>
    </Pressable>
  );
}
