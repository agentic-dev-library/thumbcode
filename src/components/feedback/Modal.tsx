/**
 * Modal Component
 *
 * A dialog/modal overlay with organic styling.
 * Web-native implementation using HTML <dialog> element.
 * Supports different sizes and footer actions.
 */

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

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
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full h-full',
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
}: Readonly<ModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (visible && !dialog.open) {
      dialog.showModal();
    } else if (!visible && dialog.open) {
      dialog.close();
    }
  }, [visible]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && e.target === dialogRef.current) {
      onClose();
    }
  };

  const isFull = size === 'full';
  const sizeClass = modalSizes[size];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/60 bg-transparent p-0 m-auto open:flex items-center justify-center"
    >
      <div
        className={`bg-surface w-full ${sizeClass} ${isFull ? 'flex flex-col' : 'max-h-[80vh]'}`}
        style={{
          borderRadius: isFull ? undefined : '18px 16px 20px 14px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-700">
            <h2 className="font-display text-lg text-white flex-1" role="heading">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center -mr-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`px-5 py-4 ${scrollable ? 'overflow-y-auto' : ''} ${isFull ? 'flex-1' : ''}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end px-5 py-4 border-t border-neutral-700 gap-3">
            {footer}
          </div>
        )}
      </div>
    </dialog>
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
}: Readonly<ConfirmDialogProps>) {
  const confirmColor =
    variant === 'destructive' ? 'bg-coral-500 hover:bg-coral-600' : 'bg-teal-600 hover:bg-teal-700';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-body transition-colors rounded-organic-button"
            type="button"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${confirmColor} text-white font-body font-semibold transition-colors rounded-organic-button`}
            type="button"
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="font-body text-neutral-300">{message}</p>
    </Modal>
  );
}
