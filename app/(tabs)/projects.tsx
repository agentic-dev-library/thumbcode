/**
 * Projects Screen
 *
 * Lists all projects with quick actions and status.
 * Uses paint daube icons for brand consistency.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, EmptyState } from '@/components/display';
import {
  AgentIcon,
  BranchIcon,
  FolderIcon,
  GitIcon,
  SearchIcon,
  TasksIcon,
} from '@/components/icons';
import { Container, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

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
          style={organicBorderRadius.card}
        >
          <View className="mr-3">
            <SearchIcon size={20} color="warmGray" turbulence={0.2} />
          </View>
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
              Icon={FolderIcon}
              iconColor="warmGray"
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
                  style={organicBorderRadius.card}
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
                      <GitIcon size={14} color="warmGray" turbulence={0.2} />
                      <Text size="sm" className="text-neutral-400">
                        {project.repository}
                      </Text>
                    </HStack>
                    <HStack spacing="xs" align="center">
                      <BranchIcon size={14} color="warmGray" turbulence={0.2} />
                      <Text size="sm" className="text-neutral-400">
                        {project.branch}
                      </Text>
                    </HStack>
                  </HStack>

                  <HStack justify="between" align="center">
                    <HStack spacing="md">
                      {project.pendingTasks > 0 && (
                        <HStack spacing="xs" align="center">
                          <TasksIcon size={14} color="gold" turbulence={0.2} />
                          <Text size="sm" className="text-gold-400">
                            {project.pendingTasks} tasks
                          </Text>
                        </HStack>
                      )}
                      {project.activeAgents > 0 && (
                        <HStack spacing="xs" align="center">
                          <AgentIcon size={14} color="teal" turbulence={0.2} />
                          <Text size="sm" className="text-teal-400">
                            {project.activeAgents} agents
                          </Text>
                        </HStack>
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
        style={[
          organicBorderRadius.cta,
          {
            marginBottom: insets.bottom,
            shadowColor: '#FF7059',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <Text className="text-white text-2xl">+</Text>
      </Pressable>
    </View>
  );
}
