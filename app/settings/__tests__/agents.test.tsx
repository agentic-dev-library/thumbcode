import { render } from '@testing-library/react-native';
import AgentSettingsScreen from '../agents';

// Mock expo-router Stack
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('AgentSettingsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<AgentSettingsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows automation section', () => {
    const { toJSON } = render(<AgentSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('AUTOMATION');
    expect(tree).toContain('Auto-Review');
    expect(tree).toContain('Auto-Test');
    expect(tree).toContain('Parallel Execution');
  });

  it('shows approval requirements section', () => {
    const { toJSON } = render(<AgentSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('APPROVAL REQUIREMENTS');
    expect(tree).toContain('Commits');
    expect(tree).toContain('Push to Remote');
    expect(tree).toContain('Deployments');
  });

  it('shows approval level options', () => {
    const { toJSON } = render(<AgentSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Automatic');
    expect(tree).toContain('Notify Only');
    expect(tree).toContain('Require Approval');
  });

  it('shows advanced section', () => {
    const { toJSON } = render(<AgentSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('ADVANCED');
    expect(tree).toContain('Verbose Logging');
  });
});
