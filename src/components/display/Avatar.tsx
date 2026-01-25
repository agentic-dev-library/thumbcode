/**
 * Avatar Component
 *
 * User/agent avatar display with initials fallback.
 * Supports different sizes and status indicators.
 */

import { useMemo } from 'react';
import { Image, Text, View } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Fallback text (uses initials) */
  name?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
  /** Border color class */
  borderColor?: string;
  /** Custom background color class */
  bgColor?: string;
}

const avatarSizes: Record<AvatarSize, { dimension: number; fontSize: number; statusSize: number }> =
  {
    xs: { dimension: 24, fontSize: 10, statusSize: 6 },
    sm: { dimension: 32, fontSize: 12, statusSize: 8 },
    md: { dimension: 40, fontSize: 14, statusSize: 10 },
    lg: { dimension: 56, fontSize: 18, statusSize: 12 },
    xl: { dimension: 72, fontSize: 24, statusSize: 14 },
  };

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-teal-500',
  offline: 'bg-neutral-500',
  busy: 'bg-coral-500',
  away: 'bg-gold-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  name = '',
  size = 'md',
  status,
  borderColor,
  bgColor = 'bg-neutral-700',
}: AvatarProps) {
  const { dimension, fontSize, statusSize } = avatarSizes[size];
  const initials = useMemo(() => getInitials(name), [name]);

  const accessibilityLabel = [name || 'Unknown', status || 'no status'].filter(Boolean).join(', ');

  return (
    <View
      className="relative"
      style={{ width: dimension, height: dimension }}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        className={`items-center justify-center overflow-hidden ${bgColor} ${
          borderColor ? `border-2 ${borderColor}` : ''
        }`}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
      >
        {src ? (
          <Image
            source={{ uri: src }}
            style={{ width: dimension, height: dimension }}
            className="rounded-full"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text className="font-body text-white font-semibold" style={{ fontSize }}>
            {initials}
          </Text>
        )}
      </View>

      {status && (
        <View
          className={`absolute -bottom-0.5 -right-0.5 border-2 border-charcoal ${statusColors[status]}`}
          style={{
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
          }}
        />
      )}
    </View>
  );
}

interface AvatarGroupProps {
  /** List of avatars */
  avatars: { src?: string; name?: string }[];
  /** Maximum avatars to show before +N */
  max?: number;
  /** Size of avatars */
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const { dimension, fontSize } = avatarSizes[size];
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View className="flex-row">
      {visibleAvatars.map((avatar, index) => (
        <View
          key={`${avatar.name || index}`}
          style={{
            marginLeft: index > 0 ? -dimension / 3 : 0,
            zIndex: visibleAvatars.length - index,
          }}
        >
          <Avatar src={avatar.src} name={avatar.name} size={size} borderColor="border-charcoal" />
        </View>
      ))}
      {remaining > 0 && (
        <View
          className="items-center justify-center bg-neutral-600 border-2 border-charcoal"
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            marginLeft: -dimension / 3,
          }}
        >
          <Text className="font-body text-white" style={{ fontSize: fontSize - 2 }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
