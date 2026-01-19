/**
 * Select Component
 *
 * A dropdown select input with organic styling.
 * Displays options in a modal on mobile.
 * Uses paint daube icons for brand consistency.
 */

import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { ChevronDownIcon, SuccessIcon } from '@/components/icons';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  /** Currently selected value */
  value: string | null;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = Boolean(error);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className="w-full">
      {label && <Text className="font-body text-sm text-neutral-300 mb-1.5">{label}</Text>}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between bg-neutral-800 px-4 py-3 border ${
          hasError ? 'border-coral-500' : 'border-neutral-600'
        } ${disabled ? 'opacity-50' : ''}`}
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 14,
          borderBottomRightRadius: 12,
          borderBottomLeftRadius: 16,
        }}
        accessibilityRole="combobox"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ expanded: isOpen, disabled }}
        accessibilityHint="Double tap to open options"
      >
        <Text
          className={`font-body flex-1 ${selectedOption ? 'text-white' : 'text-neutral-500'}`}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <View className="ml-2">
          <ChevronDownIcon size={16} color="warmGray" turbulence={0.15} />
        </View>
      </Pressable>

      {error && <Text className="font-body text-xs text-coral-400 mt-1">{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setIsOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-surface m-4 max-h-80 overflow-hidden"
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 18,
              }}
            >
              <View className="p-4 border-b border-neutral-700">
                <Text className="font-display text-lg text-white text-center">
                  {label || 'Select Option'}
                </Text>
              </View>

              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => !item.disabled && handleSelect(item.value)}
                    disabled={item.disabled}
                    className={`px-4 py-3 border-b border-neutral-800 ${
                      item.value === value ? 'bg-teal-600/20' : ''
                    } ${item.disabled ? 'opacity-50' : 'active:bg-neutral-700'}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-body ${
                          item.value === value ? 'text-teal-400' : 'text-white'
                        }`}
                      >
                        {item.label}
                      </Text>
                      {item.value === value && <SuccessIcon size={16} color="teal" turbulence={0.15} />}
                    </View>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />

              <Pressable
                onPress={() => setIsOpen(false)}
                className="p-4 border-t border-neutral-700 bg-neutral-800/50"
              >
                <Text className="font-body text-neutral-400 text-center">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
