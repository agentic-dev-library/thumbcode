import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { Text } from '../primitives/Text';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

/**
 * A header component with optional back button and right element.
 *
 * @param title - The header title text.
 * @param onBack - Optional callback for back button; shows back arrow when provided.
 * @param rightElement - Optional element to render on the right side.
 * @returns A View element styled as a header.
 */
export function Header({ title, onBack, rightElement }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between pb-4">
      <View className="w-10">
        {onBack && (
          <Pressable onPress={onBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        )}
      </View>
      <Text variant="display" size="2xl" className="text-white">
        {title}
      </Text>
      <View className="w-10">{rightElement}</View>
    </View>
  );
}
