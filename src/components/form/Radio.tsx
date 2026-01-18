/**
 * Radio Component
 *
 * A radio button group for single-select options.
 * Supports horizontal and vertical layouts with organic styling.
 */

import { Pressable, Text, View } from 'react-native';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  /** Currently selected value */
  value: string | null;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Available options */
  options: RadioOption[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Label for the group */
  label?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { outer: 16, inner: 8, label: 'text-sm' },
  md: { outer: 20, inner: 10, label: 'text-base' },
  lg: { outer: 24, inner: 12, label: 'text-lg' },
};

export function RadioGroup({
  value,
  onValueChange,
  options,
  direction = 'vertical',
  label,
  error,
  size = 'md',
}: RadioGroupProps) {
  const styles = sizeStyles[size];

  return (
    <View className="w-full">
      {label && <Text className="font-body text-sm text-neutral-300 mb-2">{label}</Text>}

      <View className={direction === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'gap-3'}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = option.disabled;

          return (
            <Pressable
              key={option.value}
              onPress={() => !isDisabled && onValueChange(option.value)}
              disabled={isDisabled}
              className={`flex-row items-start ${isDisabled ? 'opacity-50' : ''}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            >
              <View
                className={`items-center justify-center border-2 ${
                  isSelected ? 'border-teal-500' : 'border-neutral-500'
                }`}
                style={{
                  width: styles.outer,
                  height: styles.outer,
                  borderRadius: styles.outer / 2,
                }}
              >
                {isSelected && (
                  <View
                    className="bg-teal-500"
                    style={{
                      width: styles.inner,
                      height: styles.inner,
                      borderRadius: styles.inner / 2,
                    }}
                  />
                )}
              </View>
              <View className="ml-3 flex-1">
                <Text className={`font-body text-white ${styles.label}`}>{option.label}</Text>
                {option.description && (
                  <Text className="font-body text-sm text-neutral-400 mt-0.5">
                    {option.description}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {error && <Text className="font-body text-xs text-coral-400 mt-2">{error}</Text>}
    </View>
  );
}
