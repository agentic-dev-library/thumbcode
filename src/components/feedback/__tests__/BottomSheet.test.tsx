import { render, screen } from '@testing-library/react';
import { ActionSheet, BottomSheet } from '../BottomSheet';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

describe('BottomSheet', () => {
  it('renders children when visible', () => {
    render(
      <BottomSheet visible onClose={vi.fn()}>
        <span>Sheet content</span>
      </BottomSheet>
    );
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('renders title when provided', () => {
    render(
      <BottomSheet visible onClose={vi.fn()} title="Settings">
        <span>Content</span>
      </BottomSheet>
    );
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders close button when title is present', () => {
    render(
      <BottomSheet visible onClose={vi.fn()} title="Settings">
        <span>Content</span>
      </BottomSheet>
    );
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    render(
      <BottomSheet visible={false} onClose={vi.fn()}>
        <span>Hidden</span>
      </BottomSheet>
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});

describe('ActionSheet', () => {
  const mockOptions = [
    { label: 'Edit', onPress: vi.fn() },
    { label: 'Delete', onPress: vi.fn(), destructive: true },
    { label: 'Archive', onPress: vi.fn(), disabled: true },
  ];

  it('renders action options', () => {
    render(<ActionSheet visible onClose={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Archive')).toBeTruthy();
  });

  it('renders title and message', () => {
    render(
      <ActionSheet
        visible
        onClose={vi.fn()}
        options={mockOptions}
        title="Choose action"
        message="What would you like to do?"
      />
    );
    expect(screen.getByText('Choose action')).toBeTruthy();
    expect(screen.getByText('What would you like to do?')).toBeTruthy();
  });

  it('renders cancel button by default', () => {
    render(<ActionSheet visible onClose={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('uses custom cancel text', () => {
    render(<ActionSheet visible onClose={vi.fn()} options={mockOptions} cancelText="Dismiss" />);
    expect(screen.getByText('Dismiss')).toBeTruthy();
  });

  it('hides cancel when showCancel is false', () => {
    render(<ActionSheet visible onClose={vi.fn()} options={mockOptions} showCancel={false} />);
    expect(screen.queryByText('Cancel')).toBeNull();
  });
});
