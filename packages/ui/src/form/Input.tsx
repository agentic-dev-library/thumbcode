import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import { Text } from '../primitives/Text';
import { themeTokens } from '../theme/ThemeProvider';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'filled';
}

/**
 * Renders a text input with an optional label and error message.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius.
 *
 * @param label - Optional label text displayed above the input
 * @param error - Optional error message displayed below the input; also changes the input's border styling
 * @param variant - Visual variant: 'default' (light) or 'filled' (dark background)
 * @param className - Additional class names applied to the input element
 * @returns A React element containing the labeled input and optional error message
 */
export function Input({ label, error, variant = 'default', className = '', ...props }: InputProps) {
  const variantClasses = {
    default: 'bg-white text-neutral-900',
    filled: 'bg-charcoal text-white',
  }[variant];

  return (
    <View className="w-full">
      {label && <Text className="mb-2 text-neutral-700 font-medium">{label}</Text>}
      <RNTextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        className={`
          ${variantClasses}
          border-2
          ${error ? 'border-coral-500' : 'border-neutral-200'}
          rounded-[0.5rem_0.625rem_0.5rem_0.75rem]
          px-4 py-3
          font-body text-base
          ${className}
        `}
        placeholderTextColor={themeTokens.colors.neutral[400]}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-coral-500">{error}</Text>}
    </View>
  );
}
