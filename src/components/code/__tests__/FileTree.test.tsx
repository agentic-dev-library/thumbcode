import { fireEvent, render, screen } from '@testing-library/react';
import { type FileNode, FileTree } from '../FileTree';

vi.mock('@/components/icons', () => ({
  ChevronDownIcon: () => <span>ChevronDown</span>,
  FileCodeIcon: () => <span>FileCode</span>,
  FileConfigIcon: () => <span>FileConfig</span>,
  FileDataIcon: () => <span>FileData</span>,
  FileDocIcon: () => <span>FileDoc</span>,
  FileIcon: () => <span>FileGeneric</span>,
  FileMediaIcon: () => <span>FileMedia</span>,
  FileStyleIcon: () => <span>FileStyle</span>,
  FileWebIcon: () => <span>FileWeb</span>,
  FolderIcon: () => <span>Folder</span>,
  FolderOpenIcon: () => <span>FolderOpen</span>,
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {} },
}));

const mockData: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: 'src',
    children: [
      { name: 'App.tsx', type: 'file', path: 'src/App.tsx', modified: true },
      { name: 'index.ts', type: 'file', path: 'src/index.ts' },
    ],
  },
  { name: 'README.md', type: 'file', path: 'README.md', added: true },
  { name: 'package.json', type: 'file', path: 'package.json' },
];

describe('FileTree', () => {
  it('renders root level files and folders', () => {
    render(<FileTree data={mockData} />);
    expect(screen.getByText('src')).toBeTruthy();
    expect(screen.getByText('README.md')).toBeTruthy();
    expect(screen.getByText('package.json')).toBeTruthy();
  });

  it('sorts folders before files', () => {
    const { container } = render(<FileTree data={mockData} />);
    const html = container.innerHTML;
    const srcIndex = html.indexOf('src');
    const readmeIndex = html.indexOf('README.md');
    expect(srcIndex).toBeLessThan(readmeIndex);
  });

  it('expands folder when pressed using defaultExpanded', () => {
    render(<FileTree data={mockData} defaultExpanded={['src']} />);
    expect(screen.getByText('App.tsx')).toBeTruthy();
    expect(screen.getByText('index.ts')).toBeTruthy();
  });

  it('does not show children of collapsed folder', () => {
    render(<FileTree data={mockData} />);
    expect(screen.queryByText('App.tsx')).toBeNull();
  });

  it('calls onSelectFile when a file is pressed', () => {
    const onSelectFile = vi.fn();
    render(<FileTree data={mockData} onSelectFile={onSelectFile} defaultExpanded={['src']} />);
    // Find the button with aria-label containing App.tsx
    const appButton = screen.getByLabelText(/App\.tsx/);
    fireEvent.click(appButton);
    expect(onSelectFile).toHaveBeenCalledWith('src/App.tsx');
  });

  it('shows status indicator for modified files', () => {
    render(<FileTree data={mockData} defaultExpanded={['src']} showStatus />);
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('shows status indicator for added files', () => {
    render(<FileTree data={mockData} showStatus />);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('has file tree accessibility role', () => {
    render(<FileTree data={mockData} />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getByLabelText('File tree')).toBeTruthy();
  });

  it('selects file path when updated via props', () => {
    const { rerender } = render(
      <FileTree data={mockData} selectedPath="src/App.tsx" defaultExpanded={['src']} />
    );

    // Check if App.tsx is selected (has text-teal-300 class applied to text)
    const appNode = screen.getByText('App.tsx');
    expect(appNode.className).toContain('text-teal-300');

    // Update selectedPath
    rerender(<FileTree data={mockData} selectedPath="README.md" defaultExpanded={['src']} />);

    const readmeNode = screen.getByText('README.md');
    expect(readmeNode.className).toContain('text-teal-300');
    expect(appNode.className).not.toContain('text-teal-300');
  });

  it('toggles folder expansion on click', () => {
    render(<FileTree data={mockData} />);

    // Initially hidden
    expect(screen.queryByText('App.tsx')).toBeNull();

    // Click src folder
    const srcFolder = screen.getByText('src');
    fireEvent.click(srcFolder);

    // Should show children
    expect(screen.getByText('App.tsx')).toBeTruthy();

    // Click src folder again
    fireEvent.click(srcFolder);

    // Should hide children
    expect(screen.queryByText('App.tsx')).toBeNull();
  });
});
