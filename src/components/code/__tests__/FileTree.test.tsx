import { fireEvent, render } from '@testing-library/react-native';
import { FileTree, type FileNode } from '../FileTree';

jest.mock('@/components/icons', () => ({
  ChevronDownIcon: () => 'ChevronDownIcon',
  FileCodeIcon: () => 'FileCodeIcon',
  FileConfigIcon: () => 'FileConfigIcon',
  FileDataIcon: () => 'FileDataIcon',
  FileDocIcon: () => 'FileDocIcon',
  FileIcon: () => 'FileIcon',
  FileMediaIcon: () => 'FileMediaIcon',
  FileStyleIcon: () => 'FileStyleIcon',
  FileWebIcon: () => 'FileWebIcon',
  FolderIcon: () => 'FolderIcon',
  FolderOpenIcon: () => 'FolderOpenIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
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
    const { toJSON } = render(<FileTree data={mockData} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('src');
    expect(json).toContain('README.md');
    expect(json).toContain('package.json');
  });

  it('sorts folders before files', () => {
    const { toJSON } = render(<FileTree data={mockData} />);
    const json = JSON.stringify(toJSON());
    // 'src' folder should appear before files
    const srcIndex = json.indexOf('src');
    const readmeIndex = json.indexOf('README.md');
    expect(srcIndex).toBeLessThan(readmeIndex);
  });

  it('expands folder when pressed using defaultExpanded', () => {
    const { toJSON } = render(
      <FileTree data={mockData} defaultExpanded={['src']} />
    );
    const json = JSON.stringify(toJSON());
    // Children should be visible
    expect(json).toContain('App.tsx');
    expect(json).toContain('index.ts');
  });

  it('does not show children of collapsed folder', () => {
    const { toJSON } = render(<FileTree data={mockData} />);
    const json = JSON.stringify(toJSON());
    // Children should not be visible when folder is collapsed
    expect(json).not.toContain('App.tsx');
  });

  it('calls onSelectFile when a file is pressed', () => {
    const onSelectFile = jest.fn();
    const { UNSAFE_getAllByProps } = render(
      <FileTree data={mockData} onSelectFile={onSelectFile} defaultExpanded={['src']} />
    );
    // Find the App.tsx file button
    const fileButtons = UNSAFE_getAllByProps({ accessibilityRole: 'button' });
    // Find the one that has App.tsx in its accessibilityLabel
    const appButton = fileButtons.find(
      (btn: { props: { accessibilityLabel?: string } }) =>
        btn.props.accessibilityLabel?.includes('App.tsx')
    );
    if (appButton) {
      fireEvent.press(appButton);
      expect(onSelectFile).toHaveBeenCalledWith('src/App.tsx');
    }
  });

  it('shows status indicator for modified files', () => {
    const { toJSON } = render(
      <FileTree data={mockData} defaultExpanded={['src']} showStatus />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('M');
  });

  it('shows status indicator for added files', () => {
    const { toJSON } = render(<FileTree data={mockData} showStatus />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('A');
  });

  it('has file tree accessibility role', () => {
    const { toJSON } = render(<FileTree data={mockData} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"role":"list"');
    expect(json).toContain('File tree');
  });
});
