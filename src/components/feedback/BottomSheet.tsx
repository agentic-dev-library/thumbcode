/**
 * BottomSheet Component
 *
 * A slide-up panel from the bottom of the screen.
 * Common on mobile for contextual actions and forms.
 */

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Callback when sheet is dismissed */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Sheet content */
  children: ReactNode;
  /** Height preset */
  height?: 'auto' | 'half' | 'full' | number;
  /** Whether content should scroll */
  scrollable?: boolean;
  /** Show drag handle */
  showHandle?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  scrollable = false,
  showHandle = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const sheetHeight =
    height === 'auto'
      ? undefined
      : height === 'half'
        ? SCREEN_HEIGHT * 0.5
        : height === 'full'
          ? SCREEN_HEIGHT - insets.top
          : height;

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={onClose} accessible={false} />

        <Animated.View
          className="bg-surface"
          style={{
            transform: [{ translateY }],
            height: sheetHeight,
            maxHeight: SCREEN_HEIGHT - insets.top - 40,
            paddingBottom: insets.bottom,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 20,
          }}
        >
          {/* Drag handle */}
          {showHandle && (
            <View className="items-center pt-3 pb-2" {...panResponder.panHandlers}>
              <View className="w-10 h-1 bg-neutral-600 rounded-full" />
            </View>
          )}

          {/* Header */}
          {title && (
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-neutral-700">
              <Text className="font-display text-lg text-white">{title}</Text>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Close"
                accessibilityHint="Close the bottom sheet"
              >
                <Text className="text-neutral-400 text-xl">×</Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          <ContentWrapper className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
            {children}
          </ContentWrapper>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Callback when sheet is dismissed */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Sheet message */
  message?: string;
  /** Action options */
  options: ActionSheetOption[];
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
}

export function ActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  showCancel = true,
  cancelText = 'Cancel',
}: ActionSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} height="auto" showHandle={false}>
      {(title || message) && (
        <View className="items-center mb-4 pb-4 border-b border-neutral-700">
          {title && (
            <Text className="font-display text-base text-white mb-1" accessibilityRole="header">
              {title}
            </Text>
          )}
          {message && (
            <Text className="font-body text-sm text-neutral-400 text-center">{message}</Text>
          )}
        </View>
      )}

      {options.map((option, index) => (
        <Pressable
          key={option.label}
          onPress={() => {
            option.onPress();
            onClose();
          }}
          disabled={option.disabled}
          className={`py-4 ${index > 0 ? 'border-t border-neutral-800' : ''} ${
            option.disabled ? 'opacity-50' : 'active:bg-neutral-800'
          }`}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          accessibilityHint={`Perform the action: ${option.label}`}
        >
          <Text
            className={`font-body text-center ${
              option.destructive ? 'text-coral-400' : 'text-white'
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}

      {showCancel && (
        <Pressable
          onPress={onClose}
          className="mt-2 py-4 bg-neutral-800 active:bg-neutral-700"
          accessibilityRole="button"
          accessibilityLabel={cancelText}
          accessibilityHint="Cancel and close the action sheet"
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 14,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 16,
          }}
        >
          <Text className="font-body text-center text-neutral-300 font-semibold">{cancelText}</Text>
        </Pressable>
      )}
    </BottomSheet>
  );
}
