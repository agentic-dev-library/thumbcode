/**
 * Loading Components
 *
 * Spinner and skeleton loading states with organic styling.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { organicBorderRadius } from '@/lib/organic-styles';
import {
  type ColorKey,
  type ColorShade,
  getColor,
  getColorWithOpacity,
} from '@/utils/design-tokens';

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white';
  /** Optional label */
  label?: string;
}

const spinnerSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

const spinnerColorTokens: Record<
  NonNullable<SpinnerProps['color']>,
  { color: ColorKey; shade: ColorShade }
> = {
  primary: { color: 'coral', shade: '500' },
  secondary: { color: 'teal', shade: '500' },
  white: { color: 'neutral', shade: '50' },
};

export function Spinner({ size = 'md', color = 'primary', label }: SpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dimension = spinnerSizes[size];
  const borderWidth = dimension / 6;
  const token = spinnerColorTokens[color];
  const borderColor = getColorWithOpacity(token.color, token.shade, 0.2);
  const borderTopColor = getColor(token.color, token.shade);

  return (
    <View className="items-center">
      <Animated.View
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth,
          borderColor,
          borderTopColor,
          transform: [{ rotate: spin }],
        }}
      />
      {label && <Text className="font-body text-sm text-neutral-400 mt-2">{label}</Text>}
    </View>
  );
}

interface SkeletonProps {
  /** Width of the skeleton */
  width?: number | `${number}%`;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Whether it's a circle */
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const dimension = circle ? height : undefined;

  return (
    <Animated.View
      className="bg-neutral-700"
      style={{
        width: circle ? dimension : width,
        height: circle ? dimension : height,
        borderRadius: circle ? (dimension ?? 40) / 2 : borderRadius,
        opacity: pulseAnim,
      }}
    />
  );
}

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message */
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-charcoal/80 items-center justify-center z-50">
      <View className="bg-surface-elevated p-6 items-center" style={organicBorderRadius.card}>
        <Spinner size="lg" />
        {message && <Text className="font-body text-white mt-4 text-center">{message}</Text>}
      </View>
    </View>
  );
}
