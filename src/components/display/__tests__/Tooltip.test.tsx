import { create } from 'react-test-renderer';
import { Text } from 'react-native';
import { InfoTip, Tooltip } from '../Tooltip';

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { badge: {} },
}));

describe('Tooltip', () => {
  it('renders children', () => {
    const tree = create(
      <Tooltip content="Help text">
        <Text>Hover me</Text>
      </Tooltip>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Hover me');
  });

  it('does not show tooltip content by default', () => {
    const tree = create(
      <Tooltip content="Help text">
        <Text>Hover me</Text>
      </Tooltip>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('Help text');
  });

  it('has pressable trigger with accessibility hint', () => {
    const tree = create(
      <Tooltip content="Help text">
        <Text>Hover me</Text>
      </Tooltip>
    );
    // The Pressable trigger has accessibilityHint set in the component
    const pressables = tree.root.findAll(
      (node) => node.props.accessibilityHint === 'Long press for more info'
    );
    expect(pressables.length).toBeGreaterThan(0);
  });

  it('accepts custom position prop', () => {
    const tree = create(
      <Tooltip content="Help text" position="bottom">
        <Text>Hover me</Text>
      </Tooltip>
    );
    expect(tree.toJSON()).toBeTruthy();
  });
});

describe('InfoTip', () => {
  it('renders question mark icon', () => {
    const tree = create(<InfoTip content="More info" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('?');
  });

  it('renders with Information accessibility label', () => {
    const tree = create(<InfoTip content="More info" />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('"role":"button"');
    expect(json).toContain('Information');
  });

  it('renders small size by default', () => {
    const tree = create(<InfoTip content="Tip" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders medium size', () => {
    const tree = create(<InfoTip content="Tip" size="md" />);
    expect(tree.toJSON()).toBeTruthy();
  });
});
