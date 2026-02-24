import { render, screen } from '@testing-library/react';
import { PollingStatus } from '../PollingStatus';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('PollingStatus', () => {
  it('renders nothing when both props are null', () => {
    const { container } = render(
      <PollingStatus pollStatus={null} errorMessage={null} />
    );
    expect(container.textContent).toBe('');
  });

  it('shows poll status with attempt count', () => {
    render(
      <PollingStatus pollStatus={{ attempt: 3, max: 10 }} errorMessage={null} />
    );
    expect(screen.getByText('Checking authorization… 3/10')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <PollingStatus pollStatus={null} errorMessage="Authentication failed" />
    );
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });

  it('shows both poll status and error message', () => {
    render(
      <PollingStatus
        pollStatus={{ attempt: 5, max: 10 }}
        errorMessage="Timeout"
      />
    );
    expect(screen.getByText('Checking authorization… 5/10')).toBeInTheDocument();
    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });
});
