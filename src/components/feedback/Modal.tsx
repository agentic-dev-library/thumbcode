/**
 * Modal Component
 *
 * A dialog/modal overlay with organic styling.
 * Supports different sizes and footer actions.
 */

import type { ReactNode } from 'react';
import { Pressable, Modal as RNModal, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is dismissed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Whether to close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Footer content (typically buttons) */
  footer?: ReactNode;
  /** Whether content should scroll */
  scrollable?: boolean;
}

const modalSizes = {
  sm: 320,
  md: 400,
  lg: 500,
  full: '100%' as const,
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  footer,
  scrollable = false,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const maxWidth = modalSizes[size];
  const isFull = size === 'full';

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center items-center bg-black/60"
        onPress={() => closeOnBackdrop && onClose()}
        accessibilityLabel="Close"
        accessibilityHint="Close the modal"
        style={{
          paddingTop: isFull ? insets.top : 24,
          paddingBottom: isFull ? insets.bottom : 24,
          paddingHorizontal: isFull ? 0 : 16,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface w-full"
          style={{
            maxWidth: isFull ? undefined : maxWidth,
            maxHeight: isFull ? '100%' : '80%',
            borderRadius: isFull ? 0 : 18,
            flex: isFull ? 1 : undefined,
          }}
        >
          {/* Header */}
          {title && (
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-700">
              <Text
                className="font-display text-lg text-white flex-1"
                accessibilityRole="header"
              >
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center -mr-2"
                accessibilityRole="button"
                accessibilityLabel="Close"
                accessibilityHint="Close the modal"
              >
                <Text className="text-neutral-400 text-xl">×</Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          <ContentWrapper className="px-5 py-4" showsVerticalScrollIndicator={false}>
            {children}
          </ContentWrapper>

          {/* Footer */}
          {footer && (
            <View className="flex-row justify-end px-5 py-4 border-t border-neutral-700 gap-3">
              {footer}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Callback when dialog is dismissed */
  onClose: () => void;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Variant for styling */
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const confirmColor = variant === 'destructive' ? 'bg-coral-500' : 'bg-teal-600';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Pressable
            onPress={onClose}
            className="px-4 py-2 bg-neutral-700 active:bg-neutral-600"
            style={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 12,
            }}
            accessibilityRole="button"
            accessibilityLabel={cancelText}
            accessibilityHint="Cancel and close the dialog"
          >
            <Text className="font-body text-white">{cancelText}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${confirmColor} active:opacity-80`}
            style={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 12,
            }}
            accessibilityRole="button"
            accessibilityLabel={confirmText}
            accessibilityHint="Confirm the action"
          >
            <Text className="font-body text-white font-semibold">{confirmText}</Text>
          </Pressable>
        </>
      }
    >
      <Text className="font-body text-neutral-300">{message}</Text>
    </Modal>
  );
}
