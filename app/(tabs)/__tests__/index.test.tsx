import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

// Mock @thumbcode/state stores
jest.mock('@thumbcode/state', () => ({
  useProjectStore: jest.fn((selector) =>
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
  useAgentStore: jest.fn((selector) =>
    selector({
      agents: [
        { id: 'a1', name: 'Architect', role: 'architect', status: 'idle' },
        { id: 'a2', name: 'Implementer', role: 'implementer', status: 'working' },
      ],
      tasks: [],
    })
  ),
  selectAgents: (s: { agents: unknown[] }) => s.agents,
}));

describe('HomeScreen (Dashboard)', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders key UI sections', () => {
    const { toJSON } = render(<HomeScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Dashboard');
    expect(tree).toContain('Agent Team');
    expect(tree).toContain('Today');
    expect(tree).toContain('Recent Activity');
  });

  it('renders agent names from store', () => {
    const { toJSON } = render(<HomeScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Architect');
    expect(tree).toContain('Implementer');
  });

  it('renders project count', () => {
    const { toJSON } = render(<HomeScreen />);
    const tree = JSON.stringify(toJSON());
    // 1 project from mock
    expect(tree).toContain('"1"');
  });
});
