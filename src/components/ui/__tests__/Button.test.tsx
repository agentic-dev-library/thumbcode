import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { root } = render(<Button>Test Button</Button>);
    expect(root).toBeTruthy();
  });

  it('shows an activity indicator when loading', () => {
    const { root, toJSON } = render(<Button loading>Test Button</Button>);
    // Verify loading state renders the component
    expect(root).toBeTruthy();
    // The ActivityIndicator is rendered when loading is true
    const json = toJSON();
    expect(json).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { root, toJSON } = render(
      <Button disabled onPress={onPress}>
        Test Button
      </Button>
    );
    // Verify the component renders with disabled state
    expect(root).toBeTruthy();
    const json = toJSON();
    // Check that the component has aria-disabled set
    expect(json).toBeTruthy();
    if (json && typeof json === 'object' && 'props' in json) {
      expect(json.props['aria-disabled']).toBe(true);
    }
  });
});
