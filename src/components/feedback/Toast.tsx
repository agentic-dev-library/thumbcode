/**
 * Toast Component
 *
 * Temporary notification messages with auto-dismiss.
 * Supports different variants for success, error, warning, and info.
 * Uses paint daube icons for brand consistency.
 */

import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon, type IconColor, InfoIcon, SuccessIcon, WarningIcon } from '@/components/icons';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  /** Whether the toast is visible */
  visible: boolean;
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Variant determines color and icon */
  variant?: ToastVariant;
  /** Position on screen */
  position?: ToastPosition;
  /** Auto-dismiss duration in ms (0 to disable) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/** Toast icon component type */
type ToastIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface VariantStyle {
  bg: string;
  border: string;
  Icon: ToastIconComponent;
  iconColor: IconColor;
}

const variantStyles: Record<ToastVariant, VariantStyle> = {
  success: {
    bg: 'bg-teal-600/20',
    border: getColor('teal', '500'),
    Icon: SuccessIcon,
    iconColor: 'teal',
  },
  error: {
    bg: 'bg-coral-500/20',
    border: getColor('coral', '500'),
    Icon: CloseIcon,
    iconColor: 'coral',
  },
  warning: {
    bg: 'bg-gold-500/20',
    border: getColor('gold', '400'),
    Icon: WarningIcon,
    iconColor: 'gold',
  },
  info: {
    bg: 'bg-neutral-600/20',
    border: getColor('neutral', '500'),
    Icon: InfoIcon,
    iconColor: 'warmGray',
  },
};

export function Toast({
  visible,
  message,
  title,
  variant = 'info',
  position = 'bottom',
  duration = 4000,
  onDismiss,
  action,
}: Readonly<ToastProps>) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const styles = variantStyles[variant];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, onDismiss, translateY, opacity, position]);

  if (!visible) return null;

  const positionStyle =
    position === 'top' ? { top: insets.top + 16 } : { bottom: insets.bottom + 16 };

  return (
    <Animated.View
      className="absolute left-4 right-4 z-50"
      style={{
        ...positionStyle,
        transform: [
          { translateY: position === 'top' ? Animated.multiply(translateY, -1) : translateY },
        ],
        opacity,
      }}
    >
      <View
        className={`flex-row items-start p-4 ${styles.bg}`}
        style={[organicBorderRadius.toast, { borderLeftWidth: 4, borderLeftColor: styles.border }]}
      >
        <View className="mr-3">
          <styles.Icon size={20} color={styles.iconColor} turbulence={0.2} />
        </View>

        <View className="flex-1">
          {title && <Text className="font-display text-base text-white mb-1">{title}</Text>}
          <Text className="font-body text-sm text-neutral-200">{message}</Text>
        </View>

        <View className="flex-row items-center ml-2">
          {action && (
            <Pressable onPress={action.onPress} className="mr-3">
              <Text className="font-body text-sm text-teal-400 font-semibold">{action.label}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={onDismiss}
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <CloseIcon size={16} color="warmGray" turbulence={0.15} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
