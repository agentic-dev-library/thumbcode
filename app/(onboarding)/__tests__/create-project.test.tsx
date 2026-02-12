import { render } from '@testing-library/react-native';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({ style: {} })),
  };
}

import CreateProjectScreen from '../create-project';

// Mock @thumbcode/core
jest.mock('@thumbcode/core', () => ({
  CredentialService: {
    retrieve: jest.fn(() => Promise.resolve({ secret: null })),
    store: jest.fn(() => Promise.resolve({ isValid: true, message: 'OK' })),
  },
  GitHubApiService: {
    listRepositories: jest.fn(() => Promise.resolve([])),
  },
  GitService: {
    getRepoBaseDir: jest.fn(() => '/tmp/repos'),
    clone: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn(() => new Uint8Array(32)),
}));

// Mock @thumbcode/state
jest.mock('@thumbcode/state', () => ({
  useProjectStore: jest.fn((selector) =>
    selector({
      addProject: jest.fn(() => 'project-1'),
      setActiveProject: jest.fn(),
      initWorkspace: jest.fn(),
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
