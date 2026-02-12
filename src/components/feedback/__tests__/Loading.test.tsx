import { render, screen } from '@testing-library/react';
import { LoadingOverlay, Skeleton, Spinner } from '../Loading';

describe('Spinner', () => {
  it('renders with default props', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders with label', () => {
    render(<Spinner label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });

  it('renders different sizes', () => {
    const { unmount } = render(<Spinner size="sm" />);
    expect(document.querySelector('.w-4')).toBeTruthy();
    unmount();

    render(<Spinner size="lg" />);
    expect(document.querySelector('.w-8')).toBeTruthy();
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders as circle', () => {
    const { container } = render(<Skeleton circle height={40} />);
    const el = container.querySelector('.animate-pulse');
    expect(el).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<Skeleton width={200} height={24} />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });
});

describe('LoadingOverlay', () => {
  it('returns null when not visible', () => {
    const { container } = render(<LoadingOverlay visible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders overlay with spinner when visible', () => {
    const { container } = render(<LoadingOverlay visible />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders message when provided', () => {
    render(<LoadingOverlay visible message="Processing your request..." />);
    expect(screen.getByText('Processing your request...')).toBeTruthy();
  });
});
