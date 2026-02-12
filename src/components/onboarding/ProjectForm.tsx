/**
 * ProjectForm
 *
 * Project name input and bottom action buttons for the create project flow.
 */

import { ActivityIndicator, Pressable, View } from 'react-native';
import { VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface ProjectFormHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function ProjectFormHeader({
  projectName,
  onProjectNameChange,
}: Readonly<ProjectFormHeaderProps>) {
  return (
    <VStack spacing="sm" className="mb-6">
      <Text weight="semibold" className="text-white">
        Project Name
      </Text>
      <Input
        placeholder="My Awesome Project"
        value={projectName}
        onChangeText={onProjectNameChange}
      />
    </VStack>
  );
}

interface ProjectFormActionsProps {
  canCreate: boolean;
  isLoading: boolean;
  bottomInset: number;
  onSkip: () => void;
  onCreate: () => void;
}

export function ProjectFormActions({
  canCreate,
  isLoading,
  bottomInset,
  onSkip,
  onCreate,
}: Readonly<ProjectFormActionsProps>) {
  return (
    <View
      className="border-t border-neutral-800 px-6 py-4 flex-row gap-4"
      style={{ paddingBottom: bottomInset + 16 }}
    >
      <Pressable
        onPress={onSkip}
        className="flex-1 bg-neutral-800 py-4 active:bg-neutral-700"
        style={organicBorderRadius.cta}
      >
        <Text className="text-neutral-300 text-center">Skip for Now</Text>
      </Pressable>

      <Pressable
        onPress={onCreate}
        disabled={!canCreate || isLoading}
        className={`flex-1 py-4 ${canCreate && !isLoading ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
        style={organicBorderRadius.cta}
      >
        {isLoading ? (
          <ActivityIndicator color={getColor('neutral', '50')} />
        ) : (
          <Text
            weight="semibold"
            className={canCreate ? 'text-white text-center' : 'text-neutral-500 text-center'}
          >
            Create Project
          </Text>
        )}
      </Pressable>
    </View>
  );
}
