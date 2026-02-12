import { render } from '@testing-library/react';
import { useLocalSearchParams } from 'expo-router';
import ProjectDetailScreen from '../[id]';

// Mock expo-file-system - use pending promises to avoid state update loops

// Mock expo-router

// Mock @thumbcode/core - use pending promises to avoid state update loops
vi.mock('@thumbcode/core', () => ({
  GitBranchService: {
    currentBranch: vi.fn(() => new Promise(() => {})),
  },
  GitCommitService: {
    log: vi.fn(() => new Promise(() => {})),
  },
}));

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useProjectStore: vi.fn((selector) =>
    selector({
      projects: [
        {
          id: 'proj-1',
          name: 'My App',
          repoUrl: 'https://github.com/user/my-app',
          localPath: '/tmp/repos/my-app',
          defaultBranch: 'main',
          status: 'active',
          lastOpenedAt: new Date().toISOString(),
        },
      ],
      workspace: null,
      initWorkspace: vi.fn(),
    })
  ),
  useAgentStore: vi.fn((selector) =>
    selector({
      agents: [{ id: 'a1', name: 'Architect', role: 'architect', status: 'idle' }],
      tasks: [],
    })
  ),
}));

// Mock @/components/code
vi.mock('@/components/code', () => ({
  FileTree: () => null,
}));

// Suppress act() warnings from async effects
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe('ProjectDetailScreen', () => {
  it('renders project not found when id is missing', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'nonexistent' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Project not found');
  });

  it('renders project details when found', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'proj-1' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('github.com/user/my-app');
  });

  it('shows tab navigation', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'proj-1' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('files');
    expect(tree).toContain('commits');
    expect(tree).toContain('tasks');
    expect(tree).toContain('agents');
  });
});
