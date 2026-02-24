import { fireEvent, render, screen } from '@testing-library/react';
import type { RepoListItem } from '../RepoSelector';
import { RepoSelector } from '../RepoSelector';

vi.mock('@/components/icons', () => ({
  FolderIcon: () => <span data-testid="folder-icon" />,
  SecurityIcon: () => <span data-testid="security-icon" />,
  StarIcon: () => <span data-testid="star-icon" />,
  SuccessIcon: () => <span data-testid="success-icon" />,
}));

vi.mock('@/components/layout', () => ({
  VStack: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Input: ({ placeholder, value, onChangeText }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e: any) => onChangeText(e.target.value)}
    />
  ),
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

const makeRepo = (overrides: Partial<RepoListItem> = {}): RepoListItem => ({
  key: 'repo-1',
  provider: 'github',
  owner: 'user',
  name: 'my-repo',
  fullName: 'user/my-repo',
  description: 'A test repository',
  cloneUrl: 'https://github.com/user/my-repo.git',
  isPrivate: false,
  defaultBranch: 'main',
  stars: 10,
  ...overrides,
});

describe('RepoSelector', () => {
  const defaultProps = {
    repos: [makeRepo()],
    filteredRepos: [makeRepo()],
    selectedRepo: null as RepoListItem | null,
    searchQuery: '',
    isLoadingRepos: false,
    errorMessage: null as string | null,
    onSelectRepo: vi.fn(),
    onSearchChange: vi.fn(),
    mode: 'select' as const,
    onModeChange: vi.fn(),
    newRepoName: '',
    newRepoDescription: '',
    newRepoPrivate: false,
    isCreatingRepo: false,
    onNewRepoNameChange: vi.fn(),
    onNewRepoDescriptionChange: vi.fn(),
    onNewRepoPrivateChange: vi.fn(),
    onCreateNewRepo: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders search input', () => {
    render(<RepoSelector {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search repositories...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', () => {
    render(<RepoSelector {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search repositories...'), {
      target: { value: 'test' },
    });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('renders repository list', () => {
    render(<RepoSelector {...defaultProps} />);
    expect(screen.getByText('my-repo')).toBeInTheDocument();
    expect(screen.getByText('A test repository')).toBeInTheDocument();
  });

  it('calls onSelectRepo when repo is clicked', () => {
    render(<RepoSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('my-repo'));
    expect(defaultProps.onSelectRepo).toHaveBeenCalledWith(makeRepo());
  });

  it('shows loading spinner', () => {
    const { container } = render(
      <RepoSelector {...defaultProps} isLoadingRepos={true} filteredRepos={[]} />
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText('Loading repositories…')).toBeInTheDocument();
  });

  it('shows empty state when no repos match', () => {
    render(<RepoSelector {...defaultProps} filteredRepos={[]} />);
    expect(screen.getByText('No repositories found.')).toBeInTheDocument();
  });

  it('shows error message in empty state', () => {
    render(<RepoSelector {...defaultProps} filteredRepos={[]} errorMessage="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows private icon for private repos', () => {
    const privateRepo = makeRepo({ isPrivate: true });
    render(<RepoSelector {...defaultProps} filteredRepos={[privateRepo]} />);
    expect(screen.getByTestId('security-icon')).toBeInTheDocument();
  });

  it('shows star count', () => {
    render(<RepoSelector {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows No description for repos without description', () => {
    const noDescRepo = makeRepo({ description: '' });
    render(<RepoSelector {...defaultProps} filteredRepos={[noDescRepo]} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('shows selected repo checkmark', () => {
    const repo = makeRepo();
    render(<RepoSelector {...defaultProps} selectedRepo={repo} />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('shows create new repository button in select mode', () => {
    render(<RepoSelector {...defaultProps} />);
    expect(screen.getByText('+ Create new repository')).toBeInTheDocument();
  });

  it('switches to create mode when create button is clicked', () => {
    render(<RepoSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Create new repository'));
    expect(defaultProps.onModeChange).toHaveBeenCalledWith('create');
  });

  describe('create mode', () => {
    const createProps = {
      ...defaultProps,
      mode: 'create' as const,
      newRepoName: 'new-repo',
      newRepoDescription: 'A new repo',
    };

    it('shows create form', () => {
      render(<RepoSelector {...createProps} />);
      expect(screen.getByText('New Repository')).toBeInTheDocument();
    });

    it('shows cancel button', () => {
      render(<RepoSelector {...createProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(createProps.onModeChange).toHaveBeenCalledWith('select');
    });

    it('calls onCreateNewRepo when create button clicked', () => {
      render(<RepoSelector {...createProps} />);
      fireEvent.click(screen.getByText('Create Repository'));
      expect(createProps.onCreateNewRepo).toHaveBeenCalledOnce();
    });

    it('shows error message in create mode', () => {
      render(<RepoSelector {...createProps} errorMessage="Name already taken" />);
      expect(screen.getByText('Name already taken')).toBeInTheDocument();
    });
  });
});
