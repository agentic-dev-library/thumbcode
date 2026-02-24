import { render, screen } from '@testing-library/react';
import { AgentMetrics } from '../AgentMetrics';

vi.mock('@/components/layout', () => ({
  HStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  VStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('AgentMetrics', () => {
  it('renders completed and failed counts', () => {
    render(<AgentMetrics completed={10} failed={2} successRate={83} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders success rate as percentage', () => {
    render(<AgentMetrics completed={5} failed={1} successRate={83} />);
    expect(screen.getByText('83%')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders dash when successRate is null', () => {
    render(<AgentMetrics completed={0} failed={0} successRate={null} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders Metrics header', () => {
    render(<AgentMetrics completed={3} failed={0} successRate={100} />);
    expect(screen.getByText('Metrics')).toBeInTheDocument();
  });
});
