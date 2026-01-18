/**
 * Projects Screen
 *
 * Lists all projects with quick actions and status.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, EmptyState } from '@/components/display';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

// Mock data
const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'My Awesome App',
    description: 'A React Native app built with ThumbCode',
    repository: 'user/my-awesome-app',
    branch: 'main',
    lastActivity: '5 min ago',
    pendingTasks: 3,
    activeAgents: 2,
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'API Service',
    description: 'Backend API service',
    repository: 'user/api-service',
    branch: 'develop',
    lastActivity: '1 hour ago',
    pendingTasks: 5,
    activeAgents: 1,
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Portfolio Site',
    description: 'Personal portfolio website',
    repository: 'user/portfolio-site',
    branch: 'main',
    lastActivity: '2 days ago',
    pendingTasks: 0,
    activeAgents: 0,
    status: 'idle' as const,
  },
];

function getStatusBadge(status: 'active' | 'idle' | 'error') {
  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'idle':
      return <Badge variant="secondary">Idle</Badge>;
    case 'error':
      return <Badge variant="error">Error</Badge>;
    default:
      return null;
  }
}

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = MOCK_PROJECTS.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-charcoal">
      <Container padding="md">
        {/* Search */}
        <View
          className="bg-surface flex-row items-center px-4 py-3 mb-4"
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 8,
          }}
        >
          <Text className="text-neutral-500 mr-3">🔍</Text>
          <TextInput
            placeholder="Search projects..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-white font-body"
          />
        </View>
      </Container>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="md">
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No Projects Found"
              description={
                searchQuery
                  ? 'No projects match your search. Try different keywords.'
                  : 'Create your first project to get started with ThumbCode.'
              }
              action={{
                label: 'Create Project',
                onPress: () => router.push('/(onboarding)/create-project'),
              }}
            />
          ) : (
            <VStack spacing="md">
              {filteredProjects.map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => router.push(`/project/${project.id}`)}
                  className="bg-surface p-4 active:bg-neutral-700"
                  style={{
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <HStack justify="between" align="start" className="mb-3">
                    <VStack spacing="xs" className="flex-1">
                      <Text weight="semibold" className="text-white text-lg">
                        {project.name}
                      </Text>
                      <Text size="sm" className="text-neutral-400" numberOfLines={1}>
                        {project.description}
                      </Text>
                    </VStack>
                    {getStatusBadge(project.status)}
                  </HStack>

                  <HStack spacing="md" className="mb-3">
                    <HStack spacing="xs" align="center">
                      <Text size="sm" className="text-neutral-500">
                        📂
                      </Text>
                      <Text size="sm" className="text-neutral-400">
                        {project.repository}
                      </Text>
                    </HStack>
                    <HStack spacing="xs" align="center">
                      <Text size="sm" className="text-neutral-500">
                        🔀
                      </Text>
                      <Text size="sm" className="text-neutral-400">
                        {project.branch}
                      </Text>
                    </HStack>
                  </HStack>

                  <HStack justify="between" align="center">
                    <HStack spacing="md">
                      {project.pendingTasks > 0 && (
                        <Text size="sm" className="text-gold-400">
                          📋 {project.pendingTasks} tasks
                        </Text>
                      )}
                      {project.activeAgents > 0 && (
                        <Text size="sm" className="text-teal-400">
                          🤖 {project.activeAgents} agents
                        </Text>
                      )}
                    </HStack>
                    <Text size="xs" className="text-neutral-500">
                      {project.lastActivity}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          )}
        </Container>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(onboarding)/create-project')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-coral-500 items-center justify-center active:bg-coral-600"
        style={{
          borderTopLeftRadius: 18,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 14,
          marginBottom: insets.bottom,
          shadowColor: '#FF7059',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-2xl">+</Text>
      </Pressable>
    </View>
  );
}
