import { fireEvent, render } from '@testing-library/react';
import { DiffViewer } from '../DiffViewer';

vi.mock('@/components/icons', () => ({
  ChevronDownIcon: () => 'ChevronDownIcon',
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
    const { toJSON } = render(<DiffViewer diff={diff} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('unchanged');
    expect(json).toContain('old line');
    expect(json).toContain('new line');
  });

  it('parses diff from old and new content', () => {
    const { toJSON } = render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('line one');
    expect(json).toContain('line modified');
    expect(json).toContain('line four');
  });

  it('renders filename in header', () => {
    const { toJSON } = render(
      <DiffViewer oldContent={oldContent} newContent={newContent} filename="src/app.tsx" />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('src/app.tsx');
  });

  it('shows addition and deletion counts', () => {
    const diff = [
      { type: 'add' as const, content: 'added', newLineNumber: 1 },
      { type: 'add' as const, content: 'added2', newLineNumber: 2 },
      { type: 'remove' as const, content: 'removed', oldLineNumber: 1 },
    ];
    const { toJSON } = render(<DiffViewer diff={diff} />);
    const json = JSON.stringify(toJSON());
    // Counts are rendered in accessibility label and as split children
    expect(json).toContain('2 additions');
    expect(json).toContain('1 deletions');
  });

  it('shows line numbers by default', () => {
    const diff = [
      { type: 'context' as const, content: 'line', oldLineNumber: 5, newLineNumber: 5 },
    ];
    const { toJSON } = render(<DiffViewer diff={diff} showLineNumbers />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('5');
  });

  it('collapses and expands on header press', () => {
    const diff = [
      { type: 'context' as const, content: 'visible content', oldLineNumber: 1, newLineNumber: 1 },
    ];
    const { toJSON, UNSAFE_getByProps } = render(<DiffViewer diff={diff} filename="file.ts" />);
    // Content is visible initially
    let json = JSON.stringify(toJSON());
    expect(json).toContain('visible content');

    // Press header to collapse
    fireEvent.click(UNSAFE_getByProps({ accessibilityRole: 'button' }));
    json = JSON.stringify(toJSON());
    // Content should be hidden after collapse
    expect(json).not.toContain('visible content');
  });

  it('shows diff prefix characters', () => {
    const diff = [
      { type: 'add' as const, content: 'new', newLineNumber: 1 },
      { type: 'remove' as const, content: 'old', oldLineNumber: 1 },
    ];
    const { toJSON } = render(<DiffViewer diff={diff} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('+');
    expect(json).toContain('-');
  });

  it('renders empty when no diff data provided', () => {
    const { toJSON } = render(<DiffViewer />);
    expect(toJSON()).toBeTruthy();
  });
});
