/**
 * TextInput Component (Web Primitive)
 *
 * A <input> wrapper replacing React Native's TextInput.
 * Adapts onChangeText to onChange for web compatibility.
 */

import type { CSSProperties, FocusEventHandler } from 'react';

export interface TextInputProps {
  /** Current input value */
  value?: string;
  /** Callback when text changes (receives the new text string) */
  onChangeText?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Whether the input is editable */
  editable?: boolean;
  /** Whether the input is a secure text entry (password) */
  secureTextEntry?: boolean;
  /** Input type */
  type?: string;
  /** Maximum text length */
  maxLength?: number;
  /** Auto-capitalize behavior */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Whether to auto-correct */
  autoCorrect?: boolean;
  /** Auto-complete type */
  autoComplete?: string;
  /** Focus event handler */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Blur event handler */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Callback when the submit key is pressed */
  onSubmitEditing?: () => void;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test identifier, mapped to data-testid */
  testID?: string;
}

/**
 * A web-native <input> component replacing React Native's TextInput.
 *
 * Adapts onChangeText (receiving string) from React Native convention
 * to standard web onChange events internally.
 */
export function TextInput({
  value,
  onChangeText,
  placeholder,
  className,
  style,
  editable = true,
  secureTextEntry,
  type,
  maxLength,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  onFocus,
  onBlur,
  onSubmitEditing,
  accessibilityLabel,
  testID,
}: Readonly<TextInputProps>) {
  const inputType = secureTextEntry ? 'password' : type || 'text';

  return (
    <input
      type={inputType}
      value={value}
      onChange={(e) => onChangeText?.(e.target.value)}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={!editable}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect === false ? 'off' : autoCorrect === true ? 'on' : undefined}
      autoComplete={autoComplete}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSubmitEditing) {
          onSubmitEditing();
        }
      }}
      aria-label={accessibilityLabel}
      data-testid={testID}
    />
  );
}
