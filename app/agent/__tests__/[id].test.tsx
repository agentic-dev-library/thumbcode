import { render } from '@testing-library/react';
import { useLocalSearchParams } from 'expo-router';
import AgentDetailScreen from '../[id]';

// Mock expo-router

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useAgentStore: vi.fn((selector) =>
    selector({
      agents: [
        {
          id: 'agent-1',
          name: 'Architect',
          role: 'architect',
          status: 'idle',
          currentTaskId: null,
        },
        {
          id: 'agent-2',
          name: 'Implementer',
          role: 'implementer',
          status: 'working',
          currentTaskId: 'task-1',
        },
      ],
      tasks: [
        {
          id: 'task-1',
          agentId: 'agent-2',
          description: 'Build feature X',
          status: 'in_progress',
          createdAt: new Date().toISOString(),
        },
      ],
      updateAgentStatus: vi.fn(),
    })
  ),
}));

describe('AgentDetailScreen', () => {
  it('renders agent not found when id is missing', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'nonexistent' });
    const { toJSON } = render(<AgentDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Agent not found');
  });

  it('renders agent details when found', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'agent-1' });
    const { toJSON } = render(<AgentDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Architect');
    expect(tree).toContain('architect');
    expect(tree).toContain('Metrics');
    expect(tree).toContain('Controls');
  });

  it('shows overview and history tabs', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'agent-1' });
    const { toJSON } = render(<AgentDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('overview');
    expect(tree).toContain('history');
  });

  it('renders working agent with task info', () => {
    (useLocalSearchParams as Mock).mockReturnValue({ id: 'agent-2' });
    const { toJSON } = render(<AgentDetailScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Implementer');
    expect(tree).toContain('Build feature X');
    expect(tree).toContain('Current Task');
  });
});
