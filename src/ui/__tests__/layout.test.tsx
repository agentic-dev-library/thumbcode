import { fireEvent, render, screen } from '@testing-library/react';
import { Container } from '../layout/Container';
import { Header } from '../layout/Header';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Hello</Container>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('flex-1', 'bg-charcoal');
  });

  it('applies padded variant', () => {
    const { container } = render(<Container variant="padded">Content</Container>);
    expect(container.firstChild).toHaveClass('p-4');
  });

  it('applies centered variant', () => {
    const { container } = render(<Container variant="centered">Content</Container>);
    expect(container.firstChild).toHaveClass('items-center', 'justify-center');
  });

  it('applies custom className', () => {
    const { container } = render(<Container className="my-class">Content</Container>);
    expect(container.firstChild).toHaveClass('my-class');
  });
});

describe('Header', () => {
  it('renders title', () => {
    render(<Header title="Settings" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows back button when onBack provided', () => {
    const onBack = vi.fn();
    render(<Header title="Details" onBack={onBack} />);
    const backBtn = screen.getByLabelText('Back');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('does not show back button without onBack', () => {
    render(<Header title="Home" />);
    expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
  });

  it('renders right element', () => {
    render(<Header title="Page" rightElement={<span data-testid="right">X</span>} />);
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
