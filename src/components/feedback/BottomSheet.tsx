/**
 * BottomSheet Component
 *
 * A slide-up panel from the bottom of the screen.
 * Web-native implementation using CSS transforms and transitions.
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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
}: Readonly<BottomSheetProps>) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trigger animation on next frame
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
  }, [visible]);

  if (!visible && !isAnimating) return null;

  const sheetHeight =
    height === 'auto'
      ? 'auto'
      : height === 'half'
        ? '50vh'
        : height === 'full'
          ? 'calc(100vh - 40px)'
          : `${height}px`;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-surface transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: sheetHeight,
          maxHeight: 'calc(100vh - 40px)',
          borderRadius: '18px 16px 0 0',
        }}
        onTransitionEnd={() => {
          if (!visible) setIsAnimating(false);
        }}
      >
        {/* Drag handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-neutral-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-700">
            <span className="font-display text-lg text-white">{title}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`flex-1 px-5 py-4 ${scrollable ? 'overflow-y-auto' : ''}`}
          style={{ maxHeight: title ? 'calc(100% - 100px)' : 'calc(100% - 32px)' }}
        >
          {children}
        </div>
      </div>
    </div>
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
}: Readonly<ActionSheetProps>) {
  return (
    <BottomSheet visible={visible} onClose={onClose} height="auto" showHandle={false}>
      {(title || message) && (
        <div className="text-center mb-4 pb-4 border-b border-neutral-700">
          {title && (
            <h3 className="font-display text-base text-white mb-1" role="heading">
              {title}
            </h3>
          )}
          {message && (
            <p className="font-body text-sm text-neutral-400 text-center">{message}</p>
          )}
        </div>
      )}

      {options.map((option, index) => (
        <button
          key={option.label}
          onClick={() => {
            option.onPress();
            onClose();
          }}
          disabled={option.disabled}
          className={`w-full py-4 text-center font-body transition-colors ${
            index > 0 ? 'border-t border-neutral-800' : ''
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800 cursor-pointer'} ${
            option.destructive ? 'text-coral-400' : 'text-white'
          }`}
          type="button"
          aria-label={option.label}
        >
          {option.label}
        </button>
      ))}

      {showCancel && (
        <button
          onClick={onClose}
          className="w-full mt-2 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-body font-semibold text-center transition-colors rounded-organic-button"
          type="button"
          aria-label={cancelText}
        >
          {cancelText}
        </button>
      )}
    </BottomSheet>
  );
}
