import { fireEvent, render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, NoResults } from '../EmptyState';

vi.mock('@/components/icons', () => ({
  InboxIcon: () => <span data-testid="inbox-icon">InboxIcon</span>,
  ErrorIcon: () => <span data-testid="error-icon">ErrorIcon</span>,
  SearchIcon: () => <span data-testid="search-icon">SearchIcon</span>,
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { button: {} },
}));

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No projects yet" />);
    expect(screen.getByText('No projects yet')).toBeTruthy();
  });

  it('renders description', () => {
    render(<EmptyState title="No data" description="Create a project to get started" />);
    expect(screen.getByText('Create a project to get started')).toBeTruthy();
  });

  it('renders action button', () => {
    const onPress = vi.fn();
    render(<EmptyState title="No projects" action={{ label: 'Create Project', onPress }} />);
    expect(screen.getByText('Create Project')).toBeTruthy();
  });

  it('calls action onPress when pressed', () => {
    const onPress = vi.fn();
    render(<EmptyState title="No projects" action={{ label: 'Create Project', onPress }} />);
    fireEvent.click(screen.getByLabelText('Create Project'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders secondary action', () => {
    render(
      <EmptyState title="No results" secondaryAction={{ label: 'Learn More', onPress: vi.fn() }} />
    );
    expect(screen.getByText('Learn More')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <EmptyState title="Custom content">
        <span>Extra content</span>
      </EmptyState>
    );
    expect(screen.getByText('Extra content')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { unmount } = render(<EmptyState title="Small" size="sm" />);
    expect(screen.getByText('Small')).toBeTruthy();
    unmount();

    render(<EmptyState title="Large" size="lg" />);
    expect(screen.getByText('Large')).toBeTruthy();
  });
});

describe('ErrorState', () => {
  it('renders default title and message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Oops!')).toBeTruthy();
    expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
  });

  it('renders custom message', () => {
    render(<ErrorState message="Network error" />);
    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByText('Try Again')).toBeTruthy();
  });
});

describe('NoResults', () => {
  it('renders default title', () => {
    render(<NoResults />);
    expect(screen.getByText('No Results')).toBeTruthy();
  });

  it('renders query in description', () => {
    render(<NoResults query="react native" />);
    expect(screen.getByText(/react native/)).toBeTruthy();
  });

  it('renders clear action when onClear is provided', () => {
    render(<NoResults onClear={vi.fn()} />);
    expect(screen.getByText('Clear Search')).toBeTruthy();
  });

  it('renders custom message', () => {
    render(<NoResults message="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });
});
