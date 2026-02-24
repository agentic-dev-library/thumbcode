import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectFileExplorer, ProjectFileExplorerEmpty } from '../ProjectFileExplorer';

vi.mock('lucide-react', () => ({
  FileText: ({ size }: any) => <span data-testid="file-icon">{size}</span>,
  Folder: ({ size }: any) => <span data-testid="folder-icon">{size}</span>,
  FolderOpen: ({ size }: any) => <span data-testid="folder-open-icon">{size}</span>,
  Loader2: () => <span data-testid="loader" className="animate-spin" />,
}));

const mockContent = (overrides: any = {}) => ({
  name: 'file.ts',
  path: 'src/file.ts',
  sha: 'abc123',
  size: 500,
  type: 'file' as const,
  url: 'https://api.github.com/repos/user/repo/contents/src/file.ts',
  htmlUrl: 'https://github.com/user/repo/blob/main/src/file.ts',
  downloadUrl: 'https://raw.githubusercontent.com/user/repo/main/src/file.ts',
  ...overrides,
});

describe('ProjectFileExplorer', () => {
  const defaultProps = {
    contents: [] as any[],
    currentPath: '',
    parentPath: '',
    isLoading: false,
    error: null as string | null,
    onNavigate: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('shows Root label when at root path', () => {
    render(<ProjectFileExplorer {...defaultProps} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('shows current path', () => {
    render(<ProjectFileExplorer {...defaultProps} currentPath="src/components" />);
    expect(screen.getByText('src/components')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    render(<ProjectFileExplorer {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<ProjectFileExplorer {...defaultProps} error="Failed to load files" />);
    expect(screen.getByText('Failed to load files')).toBeInTheDocument();
  });

  it('shows empty directory message', () => {
    render(<ProjectFileExplorer {...defaultProps} />);
    expect(screen.getByText('Empty directory')).toBeInTheDocument();
  });

  it('renders file items', () => {
    const contents = [mockContent({ name: 'index.ts', size: 1200 })];
    render(<ProjectFileExplorer {...defaultProps} contents={contents} />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('1.2KB')).toBeInTheDocument();
  });

  it('renders small file sizes in bytes', () => {
    const contents = [mockContent({ name: 'small.ts', size: 500 })];
    render(<ProjectFileExplorer {...defaultProps} contents={contents} />);
    expect(screen.getByText('500B')).toBeInTheDocument();
  });

  it('renders directory items', () => {
    const contents = [mockContent({ name: 'src', type: 'dir', path: 'src' })];
    render(<ProjectFileExplorer {...defaultProps} contents={contents} />);
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  it('navigates to directory on click', () => {
    const onNavigate = vi.fn();
    const contents = [mockContent({ name: 'src', type: 'dir', path: 'src' })];
    render(<ProjectFileExplorer {...defaultProps} contents={contents} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('src'));
    expect(onNavigate).toHaveBeenCalledWith('src');
  });

  it('shows parent directory (..) when not at root', () => {
    render(
      <ProjectFileExplorer
        {...defaultProps}
        currentPath="src/components"
        parentPath="src"
      />
    );
    expect(screen.getByText('..')).toBeInTheDocument();
  });

  it('navigates to parent on .. click', () => {
    const onNavigate = vi.fn();
    render(
      <ProjectFileExplorer
        {...defaultProps}
        currentPath="src/components"
        parentPath="src"
        onNavigate={onNavigate}
      />
    );
    fireEvent.click(screen.getByText('..'));
    expect(onNavigate).toHaveBeenCalledWith('src');
  });
});

describe('ProjectFileExplorerEmpty', () => {
  it('renders empty state message', () => {
    render(<ProjectFileExplorerEmpty />);
    expect(screen.getByText('Could not parse repository info from URL.')).toBeInTheDocument();
  });
});
