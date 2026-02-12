import { fireEvent, render } from '@testing-library/react-native';
import { Toast } from '../Toast';

jest.mock('@/components/icons', () => ({
  CloseIcon: () => 'CloseIcon',
  InfoIcon: () => 'InfoIcon',
  SuccessIcon: () => 'SuccessIcon',
  WarningIcon: () => 'WarningIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { toast: {} },
}));

jest.mock('@/utils/design-tokens', () => ({
  getColor: jest.fn(() => '#000000'),
}));

describe('Toast', () => {
  it('renders message when visible', () => {
    const { toJSON } = render(
      <Toast visible message="Operation successful" onDismiss={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Operation successful');
  });

  it('returns null when not visible', () => {
    const { toJSON } = render(
      <Toast visible={false} message="Hidden" onDismiss={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders title when provided', () => {
    const { toJSON } = render(
      <Toast
        visible
        message="Details here"
        title="Success!"
        onDismiss={jest.fn()}
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Success!');
    expect(json).toContain('Details here');
  });

  it('renders dismiss button with accessibility', () => {
    const { toJSON } = render(
      <Toast visible message="Test" onDismiss={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Dismiss notification');
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { UNSAFE_getByProps } = render(
      <Toast visible message="Test" onDismiss={onDismiss} />
    );
    fireEvent.press(UNSAFE_getByProps({ accessibilityLabel: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    const onAction = jest.fn();
    const { toJSON } = render(
      <Toast
        visible
        message="File deleted"
        onDismiss={jest.fn()}
        action={{ label: 'Undo', onPress: onAction }}
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Undo');
  });

  it('renders success variant icon', () => {
    const { toJSON } = render(
      <Toast visible message="Done" variant="success" onDismiss={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('SuccessIcon');
  });

  it('renders warning variant icon', () => {
    const { toJSON } = render(
      <Toast visible message="Careful" variant="warning" onDismiss={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('WarningIcon');
  });

  it('renders info variant icon', () => {
    const { toJSON } = render(
      <Toast visible message="FYI" variant="info" onDismiss={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('InfoIcon');
  });
});
