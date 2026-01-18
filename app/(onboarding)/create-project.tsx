/**
 * Create Project Screen
 *
 * Helps user create their first project by connecting a repository.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { Container, VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  stars: number;
}

// Mock repos for demo
const MOCK_REPOS: Repository[] = [
  {
    id: '1',
    name: 'my-awesome-app',
    fullName: 'user/my-awesome-app',
    description: 'A React Native app built with ThumbCode',
    isPrivate: false,
    stars: 42,
  },
  {
    id: '2',
    name: 'api-service',
    fullName: 'user/api-service',
    description: 'Backend API service',
    isPrivate: true,
    stars: 0,
  },
  {
    id: '3',
    name: 'portfolio-site',
    fullName: 'user/portfolio-site',
    description: 'Personal portfolio website',
    isPrivate: false,
    stars: 15,
  },
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [projectName, setProjectName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredRepos = MOCK_REPOS.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSkip = () => {
    router.push('/(onboarding)/complete');
  };

  const handleCreate = async () => {
    // Guard against double-submit
    if (isLoading || !selectedRepo || !projectName) return;

    setIsLoading(true);
    // TODO: Create project via service
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    router.push('/(onboarding)/complete');
  };

  const canCreate = selectedRepo && projectName.trim().length > 0;

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Container padding="lg">
          {/* Progress */}
          <StepsProgress
            totalSteps={4}
            currentStep={3}
            labels={['GitHub', 'API Keys', 'Project', 'Done']}
          />

          {/* Header */}
          <VStack spacing="sm" className="mt-8 mb-8">
            <Text variant="display" size="3xl" weight="bold" className="text-white">
              Create Your First Project
            </Text>
            <Text className="text-neutral-400">
              Connect a repository to start building with AI agents.
            </Text>
          </VStack>

          {/* Project Name */}
          <VStack spacing="sm" className="mb-6">
            <Text weight="semibold" className="text-white">
              Project Name
            </Text>
            <Input
              placeholder="My Awesome Project"
              value={projectName}
              onChangeText={setProjectName}
            />
          </VStack>

          {/* Repository Selection */}
          <VStack spacing="sm" className="mb-4">
            <Text weight="semibold" className="text-white">
              Select Repository
            </Text>
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </VStack>

          {/* Repo List */}
          <VStack spacing="sm">
            {filteredRepos.map((repo) => (
              <Pressable
                key={repo.id}
                onPress={() => setSelectedRepo(repo)}
                className={`p-4 ${selectedRepo?.id === repo.id ? 'bg-teal-600/20 border-teal-600' : 'bg-surface border-transparent'} border`}
                style={{
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 16,
                  borderBottomLeftRadius: 10,
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="mr-2">{repo.isPrivate ? '🔒' : '📂'}</Text>
                  <Text weight="semibold" className="text-white flex-1">
                    {repo.name}
                  </Text>
                  {selectedRepo?.id === repo.id && <Text className="text-teal-400">✓</Text>}
                </View>
                <Text size="sm" className="text-neutral-400" numberOfLines={1}>
                  {repo.description}
                </Text>
                <Text size="xs" className="text-neutral-500 mt-1">
                  {repo.fullName} {repo.stars > 0 && `⭐ ${repo.stars}`}
                </Text>
              </Pressable>
            ))}
          </VStack>

          {/* Create New Option (Coming Soon) */}
          <View
            className="mt-4 p-4 border border-dashed border-neutral-700 opacity-50"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-neutral-500">+ Create new repository (coming soon)</Text>
            </View>
          </View>
        </Container>
      </ScrollView>

      {/* Bottom Buttons */}
      <View
        className="border-t border-neutral-800 px-6 py-4 flex-row gap-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSkip}
          className="flex-1 bg-neutral-800 py-4 active:bg-neutral-700"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          <Text className="text-neutral-300 text-center">Skip for Now</Text>
        </Pressable>

        <Pressable
          onPress={handleCreate}
          disabled={!canCreate || isLoading}
          className={`flex-1 py-4 ${canCreate && !isLoading ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
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
    </View>
  );
}
