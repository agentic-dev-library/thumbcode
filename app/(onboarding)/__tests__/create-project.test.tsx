import { render } from '@testing-library/react';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => ({ style: {} })),
  };
}

import CreateProjectScreen from '../create-project';

// Mock @thumbcode/core
vi.mock('@thumbcode/core', () => ({
  CredentialService: {
    retrieve: vi.fn(() => Promise.resolve({ secret: null })),
    store: vi.fn(() => Promise.resolve({ isValid: true, message: 'OK' })),
  },
  GitHubApiService: {
    listRepositories: vi.fn(() => Promise.resolve([])),
  },
  GitService: {
    getRepoBaseDir: vi.fn(() => '/tmp/repos'),
    clone: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock expo-crypto

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useProjectStore: vi.fn((selector) =>
    selector({
      addProject: vi.fn(() => 'project-1'),
      setActiveProject: vi.fn(),
      initWorkspace: vi.fn(),
    })
  ),
}));

describe('CreateProjectScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<CreateProjectScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays header', () => {
    const { toJSON } = render(<CreateProjectScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Create Your First Project');
    expect(tree).toContain('Connect a repository');
  });

  it('shows project name and repo selection fields', () => {
    const { toJSON } = render(<CreateProjectScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Project Name');
    expect(tree).toContain('Select Repository');
  });

  it('shows Skip and Create buttons', () => {
    const { toJSON } = render(<CreateProjectScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Skip for Now');
    expect(tree).toContain('Create Project');
  });
});
