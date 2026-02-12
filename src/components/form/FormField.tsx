/**
 * FormField Component
 *
 * A wrapper component for form inputs that provides consistent
 * labeling, error handling, and layout.
 * Web-native replacement using standard HTML elements.
 */

import type { ReactNode } from 'react';

interface FormFieldProps {
  /** The form input element */
  children: ReactNode;
  /** Label text */
  label?: string;
  /** Required field indicator */
  required?: boolean;
  /** Helper text below the input */
  helper?: string;
  /** Error message (overrides helper when present) */
  error?: string;
  /** Extra content to show inline with label */
  labelRight?: ReactNode;
}

export function FormField({
  children,
  label,
  required = false,
  helper,
  error,
  labelRight,
}: Readonly<FormFieldProps>) {
  const hasError = Boolean(error);

  return (
    <div className="w-full mb-4">
      {(label || labelRight) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="font-body text-sm text-neutral-300">
              {label}
              {required && <span className="text-coral-500 ml-0.5">*</span>}
            </span>
          )}
          {labelRight}
        </div>
      )}

      {children}

      {(helper || error) && (
        <p
          className={`font-body text-xs mt-1.5 ${hasError ? 'text-coral-400' : 'text-neutral-500'}`}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}
