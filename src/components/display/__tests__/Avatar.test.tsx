import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders correct initials for full name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('renders correct initials for single name', () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders correct initials for three names', () => {
    render(<Avatar name="John Robert Doe" />);
    expect(screen.getByText('JR')).toBeTruthy();
  });

  it('handles empty name', () => {
    const { container } = render(<Avatar name="" />);
    // With empty name, the avatar renders but initials are empty string
    expect(container.querySelector('[role="image"]')).toBeTruthy();
  });

  it('updates initials when name changes', () => {
    const { rerender } = render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();

    rerender(<Avatar name="Jane Smith" />);
    expect(screen.getByText('JS')).toBeTruthy();
  });
});
