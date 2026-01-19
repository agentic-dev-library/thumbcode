/**
 * Checkbox Component
 *
 * A checkbox input with label support and organic styling.
 * Follows accessibility best practices.
 * Uses paint daube icons for brand consistency.
 */

import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { SuccessIcon } from '@/components/icons';

interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checked state changes */
  onCheckedChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { box: 16, icon: 10, label: 'text-sm' },
  md: { box: 20, icon: 12, label: 'text-base' },
  lg: { box: 24, icon: 14, label: 'text-lg' },
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: CheckboxProps) {
  const styles = sizeStyles[size];

  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={`flex-row items-start ${disabled ? 'opacity-50' : ''}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View
        className={`items-center justify-center border-2 ${
          checked ? 'bg-teal-600 border-teal-600' : 'bg-transparent border-neutral-500'
        }`}
        style={{
          width: styles.box,
          height: styles.box,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 6,
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 6,
        }}
      >
        {checked && (
          <SuccessIcon size={styles.icon} color="warmGray" turbulence={0.15} />
        )}
      </View>
      {(label || description) && (
        <View className="ml-3 flex-1">
          {label && <Text className={`font-body text-white ${styles.label}`}>{label}</Text>}
          {description && (
            <Text className="font-body text-sm text-neutral-400 mt-0.5">{description}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
