/**
 * TextInput Component (Form)
 *
 * A styled <input> with label, helper text, error state, and organic styling.
 * Web-native replacement for the React Native TextInput form wrapper.
 */

import { useState } from 'react';

interface TextInputProps {
  /** Current input value */
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
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Maximum text length */
  maxLength?: number;
  /** Whether the field is required */
  required?: boolean;
  /** Auto-complete hint */
  autoComplete?: string;
  /** Additional CSS class names for the input */
  className?: string;
  /** Test identifier */
  testID?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  label,
  helper,
  error,
  disabled = false,
  type = 'text',
  maxLength,
  required = false,
  autoComplete,
  className = '',
  testID,
}: Readonly<TextInputProps>) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  const borderClass = hasError
    ? 'border-coral-500'
    : isFocused
      ? 'border-teal-500'
      : 'border-neutral-600';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={testID || `input-${label}`}
          className="block font-body text-sm text-neutral-300 mb-1.5"
        >
          {label}
          {required && <span className="text-coral-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={testID || (label ? `input-${label}` : undefined)}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-neutral-800 text-white font-body px-4 py-3 border rounded-organic-input placeholder:text-neutral-400 transition-colors disabled:opacity-50 ${borderClass} ${className}`}
        data-testid={testID}
        aria-invalid={hasError || undefined}
        aria-describedby={error || helper ? `${testID}-hint` : undefined}
      />
      {(helper || error) && (
        <p
          id={testID ? `${testID}-hint` : undefined}
          className={`font-body text-xs mt-1.5 ${hasError ? 'text-coral-400' : 'text-neutral-500'}`}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}
