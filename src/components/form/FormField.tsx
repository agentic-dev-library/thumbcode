/**
 * FormField Component
 *
 * A wrapper component for form inputs that provides consistent
 * labeling, error handling, and layout.
 */

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

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
}: FormFieldProps) {
  const hasError = Boolean(error);

  return (
    <View className="w-full mb-4">
      {(label || labelRight) && (
        <View className="flex-row items-center justify-between mb-1.5">
          {label && (
            <Text className="font-body text-sm text-neutral-300">
              {label}
              {required && <Text className="text-coral-500 ml-0.5">*</Text>}
            </Text>
          )}
          {labelRight}
        </View>
      )}

      {children}

      {(helper || error) && (
        <Text
          className={`font-body text-xs mt-1.5 ${hasError ? 'text-coral-400' : 'text-neutral-500'}`}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}
