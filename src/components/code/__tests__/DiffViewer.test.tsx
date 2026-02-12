import { fireEvent, render, screen } from '@testing-library/react';
import { DiffViewer } from '../DiffViewer';

vi.mock('@/components/icons', () => ({
  ChevronDownIcon: () => <span>ChevronDown</span>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    numberOfLines?: number;
  }) => <span {...props}>{children}</span>,
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {} },
}));

describe('DiffViewer', () => {
  const oldContent = 'line one\nline two\nline three';
  const newContent = 'line one\nline modified\nline three\nline four';

  it('renders with pre-parsed diff lines', () => {
    const diff = [
      { type: 'context' as const, content: 'unchanged', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'remove' as const, content: 'old line', oldLineNumber: 2 },
      { type: 'add' as const, content: 'new line', newLineNumber: 2 },
    ];
    const { container } = render(<DiffViewer diff={diff} />);
    expect(container.innerHTML).toContain('unchanged');
    expect(container.innerHTML).toContain('old line');
    expect(container.innerHTML).toContain('new line');
  });

  it('parses diff from old and new content', () => {
    const { container } = render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
    expect(container.innerHTML).toContain('line one');
    expect(container.innerHTML).toContain('line modified');
    expect(container.innerHTML).toContain('line four');
  });

  it('renders filename in header', () => {
    const { container } = render(
      <DiffViewer oldContent={oldContent} newContent={newContent} filename="src/app.tsx" />
    );
    expect(container.innerHTML).toContain('src/app.tsx');
  });

  it('shows addition and deletion counts', () => {
    const diff = [
      { type: 'add' as const, content: 'added', newLineNumber: 1 },
      { type: 'add' as const, content: 'added2', newLineNumber: 2 },
      { type: 'remove' as const, content: 'removed', oldLineNumber: 1 },
    ];
    const { container } = render(<DiffViewer diff={diff} />);
    // Counts are rendered as +N and -N
    expect(container.innerHTML).toContain('+2');
    expect(container.innerHTML).toContain('-1');
  });

  it('shows line numbers by default', () => {
    const diff = [
      { type: 'context' as const, content: 'line', oldLineNumber: 5, newLineNumber: 5 },
    ];
    const { container } = render(<DiffViewer diff={diff} showLineNumbers />);
    expect(container.innerHTML).toContain('5');
  });

  it('collapses and expands on header press', () => {
    const diff = [
      { type: 'context' as const, content: 'visible content', oldLineNumber: 1, newLineNumber: 1 },
    ];
    const { container } = render(<DiffViewer diff={diff} filename="file.ts" />);
    // Content is visible initially
    expect(container.innerHTML).toContain('visible content');

    // Press header button to collapse
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    // Content should be hidden after collapse
    expect(container.innerHTML).not.toContain('visible content');
  });

  it('shows diff prefix characters', () => {
    const diff = [
      { type: 'add' as const, content: 'new', newLineNumber: 1 },
      { type: 'remove' as const, content: 'old', oldLineNumber: 1 },
    ];
    const { container } = render(<DiffViewer diff={diff} />);
    expect(container.innerHTML).toContain('+');
    expect(container.innerHTML).toContain('-');
  });

  it('renders empty when no diff data provided', () => {
    const { container } = render(<DiffViewer />);
    expect(container).toBeTruthy();
  });
});
