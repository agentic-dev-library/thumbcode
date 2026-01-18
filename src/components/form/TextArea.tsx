/**
 * TextArea Component
 *
 * A multi-line text input with organic styling.
 * Supports auto-resize and character limits.
 */

import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface TextAreaProps extends Omit<TextInputProps, 'multiline'> {
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
  /** Minimum height in lines */
  minRows?: number;
  /** Maximum height in lines */
  maxRows?: number;
}

export function TextArea({
  label,
  helper,
  error,
  maxLength,
  showCount = false,
  minRows = 3,
  maxRows = 8,
  value,
  onChangeText,
  ...props
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value?.toString().length ?? 0;

  const lineHeight = 20;
  const padding = 24; // vertical padding total
  const minHeight = lineHeight * minRows + padding;
  const maxHeight = lineHeight * maxRows + padding;

  const hasError = Boolean(error);
  const borderColor = hasError
    ? 'border-coral-500'
    : isFocused
      ? 'border-teal-500'
      : 'border-neutral-600';

  return (
    <View className="w-full">
      {label && <Text className="font-body text-sm text-neutral-300 mb-1.5">{label}</Text>}
      <TextInput
        {...props}
        value={value?.toString()}
        onChangeText={onChangeText}
        multiline
        maxLength={maxLength}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={`bg-neutral-800 text-white font-body px-4 py-3 border ${borderColor}`}
        placeholderTextColor="#6B7280"
        style={{
          borderRadius: '12px 14px 12px 16px',
          minHeight,
          maxHeight,
          textAlignVertical: 'top',
          lineHeight,
        }}
      />
      <View className="flex-row justify-between mt-1">
        {(helper || error) && (
          <Text
            className={`font-body text-xs flex-1 ${
              hasError ? 'text-coral-400' : 'text-neutral-500'
            }`}
          >
            {error || helper}
          </Text>
        )}
        {showCount && (
          <Text
            className={`font-body text-xs ${
              maxLength && charCount >= maxLength ? 'text-coral-400' : 'text-neutral-500'
            }`}
          >
            {charCount}
            {maxLength ? `/${maxLength}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}
