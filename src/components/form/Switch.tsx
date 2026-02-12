/**
 * Switch Component
 *
 * A toggle switch for boolean settings with organic styling.
 * Provides visual feedback for on/off states.
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Callback when value changes */
  onValueChange: (value: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { width: 36, height: 20, thumb: 16, offset: 2 },
  md: { width: 44, height: 24, thumb: 20, offset: 2 },
  lg: { width: 52, height: 28, thumb: 24, offset: 2 },
};

export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: Readonly<SwitchProps>) {
  const styles = sizeStyles[size];
  const translateX = useRef(
    new Animated.Value(value ? styles.width - styles.thumb - styles.offset * 2 : 0)
  ).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? styles.width - styles.thumb - styles.offset * 2 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [value, translateX, styles]);

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      className={`flex-row items-center justify-between ${disabled ? 'opacity-50' : ''}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      {(label || description) && (
        <View className="flex-1 mr-3">
          {label && <Text className="font-body text-white text-base">{label}</Text>}
          {description && (
            <Text className="font-body text-sm text-neutral-400 mt-0.5">{description}</Text>
          )}
        </View>
      )}
      <View
        className={`justify-center ${value ? 'bg-teal-600' : 'bg-neutral-600'}`}
        style={{
          width: styles.width,
          height: styles.height,
          borderRadius: styles.height / 2,
          padding: styles.offset,
        }}
      >
        <Animated.View
          className="bg-white"
          style={{
            width: styles.thumb,
            height: styles.thumb,
            borderRadius: styles.thumb / 2,
            transform: [{ translateX }],
          }}
        />
      </View>
    </Pressable>
  );
}
