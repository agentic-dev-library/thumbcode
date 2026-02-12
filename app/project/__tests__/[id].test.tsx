import { render } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import ProjectDetailScreen from '../[id]';

// Mock expo-file-system - use pending promises to avoid state update loops
jest.mock('expo-file-system', () => ({
  readDirectoryAsync: jest.fn(() => new Promise(() => {})),
  getInfoAsync: jest.fn(() => new Promise(() => {})),
  documentDirectory: '/tmp/',
  cacheDirectory: '/tmp/cache/',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: () => null,
  },
}));

// Mock @thumbcode/core - use pending promises to avoid state update loops
jest.mock('@thumbcode/core', () => ({
  GitBranchService: {
    currentBranch: jest.fn(() => new Promise(() => {})),
  },
  GitCommitService: {
    log: jest.fn(() => new Promise(() => {})),
  },
}));

// Mock @thumbcode/state
jest.mock('@thumbcode/state', () => ({
  useProjectStore: jest.fn((selector) =>
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
      initWorkspace: jest.fn(),
    })
  ),
  useAgentStore: jest.fn((selector) =>
    selector({
      agents: [{ id: 'a1', name: 'Architect', role: 'architect', status: 'idle' }],
      tasks: [],
    })
  ),
}));

// Mock @/components/code
jest.mock('@/components/code', () => ({
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
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'nonexistent' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Project not found');
  });

  it('renders project details when found', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'proj-1' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('github.com/user/my-app');
  });

  it('shows tab navigation', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'proj-1' });
    const { toJSON } = render(<ProjectDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('files');
    expect(tree).toContain('commits');
    expect(tree).toContain('tasks');
    expect(tree).toContain('agents');
  });
});
