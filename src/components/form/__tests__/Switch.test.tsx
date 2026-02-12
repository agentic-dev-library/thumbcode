import { fireEvent, render } from '@testing-library/react-native';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<Switch value={false} onValueChange={jest.fn()} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders label text', () => {
    const { toJSON } = render(<Switch value={false} onValueChange={jest.fn()} label="Dark mode" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Dark mode');
  });

  it('renders description text', () => {
    const { toJSON } = render(
      <Switch
        value={false}
        onValueChange={jest.fn()}
        label="Notifications"
        description="Enable push notifications"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Enable push notifications');
  });

  it('calls onValueChange with true when toggled on', () => {
    const onValueChange = jest.fn();
    const { UNSAFE_getByProps } = render(<Switch value={false} onValueChange={onValueChange} />);
    fireEvent.press(UNSAFE_getByProps({ accessibilityRole: 'switch' }));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('calls onValueChange with false when toggled off', () => {
    const onValueChange = jest.fn();
    const { UNSAFE_getByProps } = render(<Switch value={true} onValueChange={onValueChange} />);
    fireEvent.press(UNSAFE_getByProps({ accessibilityRole: 'switch' }));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('does not call onValueChange when disabled', () => {
    const onValueChange = jest.fn();
    const { UNSAFE_getByProps } = render(
      <Switch value={false} onValueChange={onValueChange} disabled />
    );
    fireEvent.press(UNSAFE_getByProps({ accessibilityRole: 'switch' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('sets accessibility state correctly', () => {
    const { toJSON } = render(<Switch value={true} onValueChange={jest.fn()} disabled />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"role":"switch"');
    expect(json).toContain('"aria-disabled":true');
  });
});
