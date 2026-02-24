import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge } from '../Badge';

vi.mock('@/components/icons', () => ({
  CloseIcon: () => <span data-testid="close-icon">X</span>,
  InfoIcon: () => <span data-testid="info-icon">i</span>,
  SuccessIcon: () => <span data-testid="success-icon">ok</span>,
  WarningIcon: () => <span data-testid="warning-icon">!</span>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.querySelector('.bg-neutral-600')).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    expect(container.querySelector('.bg-coral-500\\/20')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.querySelector('.bg-teal-600\\/20')).toBeInTheDocument();
  });

  it('renders dot variant', () => {
    const { container } = render(<Badge dot>Dot</Badge>);
    // Dot mode renders a small circle div, not text
    const dot = container.firstChild as HTMLElement;
    expect(dot.style.borderRadius).toBeTruthy();
  });

  it('renders with Icon', () => {
    const MockIcon = () => <span data-testid="custom-icon">IC</span>;
    render(<Badge Icon={MockIcon}>With Icon</Badge>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders with textIcon when no Icon', () => {
    render(<Badge textIcon="*">Star</Badge>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders sm size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    expect(container.querySelector('.px-1\\.5')).toBeInTheDocument();
  });

  it('renders lg size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    expect(container.querySelector('.px-2\\.5')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders inactive status', () => {
    render(<StatusBadge status="inactive" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<StatusBadge status="success" label="All Good" />);
    expect(screen.getByText('All Good')).toBeInTheDocument();
  });
});
