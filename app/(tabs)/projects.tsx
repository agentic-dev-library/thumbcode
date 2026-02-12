/**
 * Projects Screen
 *
 * Lists all projects with quick actions and status.
 * Uses paint daube icons for brand consistency.
 */

import { selectProjects, useProjectStore } from '@thumbcode/state';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { getColor } from '@/utils/design-tokens';

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
  const [searchQuery, setSearchQuery] = useState('');

  const projects = useProjectStore(selectProjects);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-charcoal">
      <Container padding="md">
        {/* Search */}
        <div
          className="bg-surface flex-row items-center px-4 py-3 mb-4"
          style={organicBorderRadius.card}
        >
          <div className="mr-3">
            <SearchIcon size={20} color="warmGray" turbulence={0.2} />
          </div>
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-white font-body"
          />
        </div>
      </Container>

      <div
        className="flex-1"
}
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
                <button type="button"
                  key={project.id}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="bg-surface p-4 active:bg-neutral-700"
                  style={organicBorderRadius.card}
                >
                  <HStack justify="between" align="start" className="mb-3">
                    <VStack spacing="xs" className="flex-1">
                      <Text weight="semibold" className="text-white text-lg">
                        {project.name}
                      </Text>
                      <Text size="sm" className="text-neutral-400" numberOfLines={1}>
                        {project.repoUrl}
                      </Text>
                    </VStack>
                    {getStatusBadge(project.status ?? 'idle')}
                  </HStack>

                  <HStack spacing="md" className="mb-3">
                    <HStack spacing="xs" align="center">
                      <GitIcon size={14} color="warmGray" turbulence={0.2} />
                      <Text size="sm" className="text-neutral-400">
                        {project.repoUrl.replace(/^https?:\/\//, '')}
                      </Text>
                    </HStack>
                    <HStack spacing="xs" align="center">
                      <BranchIcon size={14} color="warmGray" turbulence={0.2} />
                      <Text size="sm" className="text-neutral-400">
                        {project.defaultBranch}
                      </Text>
                    </HStack>
                  </HStack>

                  <HStack justify="between" align="center">
                    <HStack spacing="md">
                      <HStack spacing="xs" align="center">
                        <TasksIcon size={14} color="gold" turbulence={0.2} />
                        <Text size="sm" className="text-neutral-400">
                          Workspace ready
                        </Text>
                      </HStack>
                      <HStack spacing="xs" align="center">
                        <AgentIcon size={14} color="teal" turbulence={0.2} />
                        <Text size="sm" className="text-neutral-400">
                          Agents available
                        </Text>
                      </HStack>
                    </HStack>
                    <Text size="xs" className="text-neutral-500">
                      Opened {new Date(project.lastOpenedAt).toLocaleDateString()}
                    </Text>
                  </HStack>
                </button>
              ))}
            </VStack>
          )}
        </Container>
      </div>

      {/* FAB */}
      <button type="button"
        onClick={() => router.push('/(onboarding)/create-project')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-coral-500 items-center justify-center active:bg-coral-600"
        style={{
          ...organicBorderRadius.cta,
          boxShadow: '0 4px 8px rgba(255, 112, 89, 0.3)',
        }}
      >
        <Text className="text-white text-2xl">+</Text>
      </button>
    </div>
  );
}
