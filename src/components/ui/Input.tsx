import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';
import { Text } from './Text';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

/**
 * Renders a text input with an optional label and error message.
 *
 * Displays `label` above the input when provided, shows `error` below the input when provided
 * (and visually highlights the input border), and forwards remaining props to the underlying TextInput.
 *
 * @param label - Optional label text displayed above the input
 * @param error - Optional error message displayed below the input; also changes the input's border styling
 * @param className - Additional class names applied to the input element
 * @returns A React element containing the labeled input and optional error message
 */
/** Placeholder color from design tokens - neutral-400 */
const PLACEHOLDER_COLOR = getColor('neutral', '400');

export function Input({ label, error, className = '', style, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label && <Text className="mb-2 text-neutral-700 font-medium">{label}</Text>}
      <RNTextInput
        className={`
          bg-white
          border-2
          ${error ? 'border-coral-500' : 'border-neutral-200'}
          px-4 py-3
          font-body text-base text-neutral-900
          ${className}
        `}
        style={[organicBorderRadius.textInput, style]}
        placeholderTextColor={PLACEHOLDER_COLOR}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-coral-500">{error}</Text>}
    </View>
  );
}
