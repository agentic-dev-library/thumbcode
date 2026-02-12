import { act, create } from '@testing-library/react';
import { EmptyState, ErrorState, NoResults } from '../EmptyState';

vi.mock('@/components/icons', () => ({
  InboxIcon: () => 'InboxIcon',
  ErrorIcon: () => 'ErrorIcon',
  SearchIcon: () => 'SearchIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { button: {} },
}));

describe('EmptyState', () => {
  it('renders title', () => {
    const tree = create(<EmptyState title="No projects yet" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('No projects yet');
  });

  it('renders description', () => {
    const tree = create(
      <EmptyState title="No data" description="Create a project to get started" />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Create a project to get started');
  });

  it('renders action button', () => {
    const onPress = vi.fn();
    const tree = create(
      <EmptyState title="No projects" action={{ label: 'Create Project', onPress }} />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Create Project');
  });

  it('calls action onPress when pressed', () => {
    const onPress = vi.fn();
    const tree = create(
      <EmptyState title="No projects" action={{ label: 'Create Project', onPress }} />
    );
    const buttons = tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === 'Create Project' &&
        node.props.accessibilityRole === 'button'
    );
    expect(buttons.length).toBeGreaterThan(0);
    act(() => buttons[0].props.onPress());
    expect(onPress).toHaveBeenCalled();
  });

  it('renders secondary action', () => {
    const tree = create(
      <EmptyState
        title="No results"
        secondaryAction={{ label: 'Learn More', onPress: vi.fn() }}
      />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Learn More');
  });

  it('renders children', () => {
    const tree = create(
      <EmptyState title="Custom content">
        <Text>Extra content</Text>
      </EmptyState>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Extra content');
  });

  it('renders with different sizes', () => {
    const sm = create(<EmptyState title="Small" size="sm" />);
    const lg = create(<EmptyState title="Large" size="lg" />);
    expect(sm.toJSON()).toBeTruthy();
    expect(lg.toJSON()).toBeTruthy();
  });
});

describe('ErrorState', () => {
  it('renders default title and message', () => {
    const tree = create(<ErrorState />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Oops!');
    expect(json).toContain('Something went wrong');
  });

  it('renders custom message', () => {
    const tree = create(<ErrorState message="Network error" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Network error');
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    const tree = create(<ErrorState onRetry={onRetry} />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Try Again');
  });
});

describe('NoResults', () => {
  it('renders default title', () => {
    const tree = create(<NoResults />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('No Results');
  });

  it('renders query in description', () => {
    const tree = create(<NoResults query="react native" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('react native');
  });

  it('renders clear action when onClear is provided', () => {
    const tree = create(<NoResults onClear={vi.fn()} />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Clear Search');
  });

  it('renders custom message', () => {
    const tree = create(<NoResults message="Nothing here" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Nothing here');
  });
});
