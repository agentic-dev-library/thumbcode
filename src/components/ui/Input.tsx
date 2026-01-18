import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, View } from 'react-native';
import { Text } from './Text';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function Input({ 
  label,
  error,
  className = '',
  ...props 
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="mb-2 text-neutral-700 font-medium">
          {label}
        </Text>
      )}
      <RNTextInput
        className={`
          bg-white
          border-2
          ${error ? 'border-coral-500' : 'border-neutral-200'}
          rounded-[0.5rem_0.625rem_0.5rem_0.75rem]
          px-4 py-3
          font-body text-base text-neutral-900
          ${className}
        `}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-coral-500">
          {error}
        </Text>
      )}
    </View>
  );
}
