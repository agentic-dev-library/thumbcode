import { fireEvent, render, screen } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';

vi.mock('@/components/ui', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/lib/syntax-highlighter', () => ({
  TOKEN_COLORS: {
    keyword: '#FF7059',
    string: '#14B8A6',
    comment: '#888',
    text: '#fff',
  },
  tokenize: (code: string, _lang: string) => {
    return code.split('\n').map((line) => [{ type: 'text', value: line }]);
  },
}));

describe('CodeBlock', () => {
  it('renders language label', () => {
    render(<CodeBlock code="const x = 1;" language="typescript" />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders code content', () => {
    render(<CodeBlock code="hello world" language="text" />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders filename when provided', () => {
    render(<CodeBlock code="code" language="ts" filename="index.ts" />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('does not render filename when not provided', () => {
    render(<CodeBlock code="code" language="ts" />);
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('shows Copy button', () => {
    render(<CodeBlock code="test" language="js" />);
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('shows Copied! after clicking copy', async () => {
    vi.useFakeTimers();
    render(<CodeBlock code="test" language="js" />);
    fireEvent.click(screen.getByLabelText('Copy code'));
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    vi.advanceTimersByTime(2000);
    vi.useRealTimers();
  });

  it('renders multi-line code', () => {
    render(<CodeBlock code={'line1\nline2\nline3'} language="text" />);
    expect(screen.getByText('line1')).toBeInTheDocument();
    expect(screen.getByText('line2')).toBeInTheDocument();
    expect(screen.getByText('line3')).toBeInTheDocument();
  });
});
