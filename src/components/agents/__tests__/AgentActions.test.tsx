import { fireEvent, render, screen } from '@testing-library/react';
import { AgentActions } from '../AgentActions';

vi.mock('@/components/layout', () => ({
  HStack: ({ children, ...props }: any) => <div data-testid="hstack" {...props}>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('AgentActions', () => {
  const defaultProps = {
    agentId: 'agent-1',
    onSetIdle: vi.fn(),
    onSetWorking: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle and work buttons', () => {
    render(<AgentActions {...defaultProps} />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Controls')).toBeInTheDocument();
  });

  it('calls onSetIdle with agentId when idle button is clicked', () => {
    render(<AgentActions {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Set agent to idle'));
    expect(defaultProps.onSetIdle).toHaveBeenCalledWith('agent-1');
  });

  it('calls onSetWorking with agentId when work button is clicked', () => {
    render(<AgentActions {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Set agent to working'));
    expect(defaultProps.onSetWorking).toHaveBeenCalledWith('agent-1');
  });
});
