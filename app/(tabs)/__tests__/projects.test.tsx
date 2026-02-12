import { render } from '@testing-library/react';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => ({ style: {} })),
  };
}

import ProjectsScreen from '../projects';

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useProjectStore: vi.fn((selector) =>
    selector({
      projects: [
        {
          id: 'p1',
          name: 'Test Project',
          repoUrl: 'https://github.com/test/repo',
          localPath: '/tmp/repo',
          defaultBranch: 'main',
          status: 'active',
          lastOpenedAt: new Date().toISOString(),
        },
      ],
    })
  ),
  selectProjects: (s: { projects: unknown[] }) => s.projects,
}));

describe('ProjectsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ProjectsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays project name and repo info', () => {
    const { toJSON } = render(<ProjectsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Test Project');
    expect(tree).toContain('github.com/test/repo');
  });

  it('renders search input', () => {
    const { toJSON } = render(<ProjectsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Search projects');
  });
});
