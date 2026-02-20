import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('shows an activity indicator when loading', () => {
    const { container } = render(<Button loading>Test Button</Button>);
    // Loading state should show spinner, not label
    expect(container.querySelector('[data-testid="activity-indicator"]')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Test Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
