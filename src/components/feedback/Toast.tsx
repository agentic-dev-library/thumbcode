/**
 * Toast Component
 *
 * Temporary notification messages with auto-dismiss.
 * Supports different variants for success, error, warning, and info.
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: string; iconColor: string }
> = {
  success: {
    bg: 'bg-teal-600/20',
    border: '#14B8A6',
    icon: '✓',
    iconColor: 'text-teal-400',
  },
  error: {
    bg: 'bg-coral-500/20',
    border: '#FF7059',
    icon: '✕',
    iconColor: 'text-coral-400',
  },
  warning: {
    bg: 'bg-gold-500/20',
    border: '#F5D563',
    icon: '⚠',
    iconColor: 'text-gold-400',
  },
  info: {
    bg: 'bg-neutral-600/20',
    border: '#6B7280',
    icon: 'ℹ',
    iconColor: 'text-neutral-400',
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
}: ToastProps) {
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
        style={{
          borderRadius: '14px 12px 16px 10px',
          borderLeftWidth: 4,
          borderLeftColor: styles.border,
        }}
      >
        <Text className={`text-lg mr-3 ${styles.iconColor}`}>{styles.icon}</Text>

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
          <Pressable onPress={onDismiss} className="p-1">
            <Text className="text-neutral-400 text-lg">×</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
