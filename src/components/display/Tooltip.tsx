/**
 * Tooltip Component
 *
 * Contextual information popup on long-press (mobile) or hover.
 * Uses organic styling with directional arrows.
 */

import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Animated, type LayoutRectangle, Pressable, Text, View } from 'react-native';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Content to show in tooltip */
  content: string;
  /** Element that triggers the tooltip */
  children: ReactNode;
  /** Position relative to children */
  position?: TooltipPosition;
  /** Delay before showing (ms) */
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 500 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const getTooltipStyle = () => {
    if (!layout) return {};

    const offset = 8;
    switch (position) {
      case 'top':
        return {
          bottom: layout.height + offset,
          left: '50%',
          transform: [{ translateX: -50 }],
        };
      case 'bottom':
        return {
          top: layout.height + offset,
          left: '50%',
          transform: [{ translateX: -50 }],
        };
      case 'left':
        return {
          right: layout.width + offset,
          top: '50%',
          transform: [{ translateY: -50 }],
        };
      case 'right':
        return {
          left: layout.width + offset,
          top: '50%',
          transform: [{ translateY: -50 }],
        };
      default:
        return {};
    }
  };

  return (
    <View onLayout={(e) => setLayout(e.nativeEvent.layout)} className="relative">
      <Pressable
        onLongPress={showTooltip}
        onPressOut={hideTooltip}
        delayLongPress={delay}
        accessibilityHint="Long press for more info"
      >
        {children}
      </Pressable>

      {visible && (
        <Animated.View
          className="absolute z-50 bg-neutral-800 px-3 py-2"
          style={[
            { opacity },
            {
              borderTopLeftRadius: 8,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 12,
            },
            getTooltipStyle() as object,
          ]}
        >
          <Text className="font-body text-sm text-white whitespace-nowrap">{content}</Text>
        </Animated.View>
      )}
    </View>
  );
}

interface InfoTipProps {
  /** Info content */
  content: string;
  /** Size of the info icon */
  size?: 'sm' | 'md';
}

export function InfoTip({ content, size = 'sm' }: InfoTipProps) {
  const dimension = size === 'sm' ? 16 : 20;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <Tooltip content={content}>
      <View
        className="items-center justify-center bg-neutral-700 rounded-full"
        style={{ width: dimension, height: dimension }}
        accessibilityRole="button"
        accessibilityLabel="Information"
      >
        <Text className="font-body text-neutral-300" style={{ fontSize, lineHeight: fontSize + 2 }}>
          ?
        </Text>
      </View>
    </Tooltip>
  );
}
