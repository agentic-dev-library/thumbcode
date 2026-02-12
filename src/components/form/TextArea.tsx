/**
 * TextArea Component
 *
 * A multi-line text input with organic styling.
 * Supports character count, label, helper, and error states.
 * Web-native <textarea> replacement for React Native TextInput multiline.
 */

import { useState } from 'react';

interface TextAreaProps {
  /** Current value */
  value?: string;
  /** Callback when text changes */
  onChange?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label text above the input */
  label?: string;
  /** Helper text below the input */
  helper?: string;
  /** Error message (shows in error state) */
  error?: string;
  /** Maximum character count */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Minimum number of visible rows */
  minRows?: number;
  /** Maximum number of visible rows */
  maxRows?: number;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Test identifier */
  testID?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  helper,
  error,
  maxLength,
  showCount = false,
  minRows = 3,
  maxRows = 8,
  disabled = false,
  required = false,
  className = '',
  testID,
}: Readonly<TextAreaProps>) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value?.length ?? 0;
  const hasError = Boolean(error);

  const lineHeight = 20;
  const padding = 24;
  const minHeight = lineHeight * minRows + padding;
  const maxHeight = lineHeight * maxRows + padding;

  const borderClass = hasError
    ? 'border-coral-500'
    : isFocused
      ? 'border-teal-500'
      : 'border-neutral-600';

  return (
    <div className="w-full">
      {label && (
        <label className="block font-body text-sm text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-coral-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={minRows}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-neutral-800 text-white font-body px-4 py-3 border rounded-organic-input placeholder:text-neutral-400 resize-y transition-colors disabled:opacity-50 ${borderClass} ${className}`}
        style={{ minHeight, maxHeight, lineHeight: `${lineHeight}px` }}
        data-testid={testID}
        aria-invalid={hasError || undefined}
        aria-describedby={error || helper || showCount ? `${testID}-hint` : undefined}
      />
      <div className="flex justify-between mt-1">
        {(helper || error) && (
          <p
            id={testID ? `${testID}-hint` : undefined}
            className={`font-body text-xs flex-1 ${hasError ? 'text-coral-400' : 'text-neutral-500'}`}
          >
            {error || helper}
          </p>
        )}
        {showCount && (
          <span
            className={`font-body text-xs ${
              maxLength && charCount >= maxLength ? 'text-coral-400' : 'text-neutral-500'
            }`}
          >
            {charCount}
            {maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
