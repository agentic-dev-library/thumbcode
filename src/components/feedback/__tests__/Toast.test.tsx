import { fireEvent, render, screen } from '@testing-library/react';
import { Toast } from '../Toast';

vi.mock('lucide-react', () => ({
  CircleCheck: ({ className }: { className?: string }) => (
    <span data-testid="circle-check" className={className}>
      SuccessIcon
    </span>
  ),
  CircleAlert: ({ className }: { className?: string }) => (
    <span data-testid="circle-alert" className={className}>
      ErrorIcon
    </span>
  ),
  TriangleAlert: ({ className }: { className?: string }) => (
    <span data-testid="triangle-alert" className={className}>
      WarningIcon
    </span>
  ),
  Info: ({ className }: { className?: string }) => (
    <span data-testid="info-icon" className={className}>
      InfoIcon
    </span>
  ),
  X: () => <span data-testid="x-icon">X</span>,
}));

describe('Toast', () => {
  it('renders message when visible', () => {
    render(<Toast visible message="Operation successful" onDismiss={vi.fn()} />);
    expect(screen.getByText('Operation successful')).toBeTruthy();
  });

  it('returns null when not visible', () => {
    const { container } = render(<Toast visible={false} message="Hidden" onDismiss={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders title when provided', () => {
    render(<Toast visible message="Details here" title="Success!" onDismiss={vi.fn()} />);
    expect(screen.getByText('Success!')).toBeTruthy();
    expect(screen.getByText('Details here')).toBeTruthy();
  });

  it('renders dismiss button with accessibility', () => {
    render(<Toast visible message="Test" onDismiss={vi.fn()} />);
    expect(screen.getByLabelText('Dismiss notification')).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismiss = vi.fn();
    render(<Toast visible message="Test" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    const onAction = vi.fn();
    render(
      <Toast
        visible
        message="File deleted"
        onDismiss={vi.fn()}
        action={{ label: 'Undo', onPress: onAction }}
      />
    );
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('renders success variant icon', () => {
    render(<Toast visible message="Done" variant="success" onDismiss={vi.fn()} />);
    expect(screen.getByText('SuccessIcon')).toBeTruthy();
  });

  it('renders warning variant icon', () => {
    render(<Toast visible message="Careful" variant="warning" onDismiss={vi.fn()} />);
    expect(screen.getByText('WarningIcon')).toBeTruthy();
  });

  it('renders info variant icon', () => {
    render(<Toast visible message="FYI" variant="info" onDismiss={vi.fn()} />);
    expect(screen.getByText('InfoIcon')).toBeTruthy();
  });
});
