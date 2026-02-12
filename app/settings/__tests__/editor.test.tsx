import { render } from '@testing-library/react';
import EditorSettingsScreen from '../editor';

// Mock expo-router Stack

describe('EditorSettingsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<EditorSettingsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows appearance section', () => {
    const { toJSON } = render(<EditorSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('APPEARANCE');
    expect(tree).toContain('Theme');
    expect(tree).toContain('Font Size');
    expect(tree).toContain('Line Numbers');
    expect(tree).toContain('Minimap');
  });

  it('shows formatting section', () => {
    const { toJSON } = render(<EditorSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('FORMATTING');
    expect(tree).toContain('Tab Size');
    expect(tree).toContain('Word Wrap');
    expect(tree).toContain('Format on Save');
    expect(tree).toContain('Bracket Pair Colors');
  });

  it('shows behavior section', () => {
    const { toJSON } = render(<EditorSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('BEHAVIOR');
    expect(tree).toContain('Auto Save');
  });

  it('shows code preview section', () => {
    const { toJSON } = render(<EditorSettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('PREVIEW');
    expect(tree).toContain('function');
    expect(tree).toContain('greet');
  });
});
