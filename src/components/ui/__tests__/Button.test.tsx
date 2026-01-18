import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button testID="test-button">Test Button</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toBeTruthy();
  });

  it('shows an activity indicator when loading', () => {
    render(
      <Button loading testID="test-button">
        Test Button
      </Button>
    );
    const activityIndicator = screen.getByTestId('activity-indicator');
    expect(activityIndicator).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    render(
      <Button disabled onPress={onPress} testID="test-button">
        Test Button
      </Button>
    );
    const button = screen.getByTestId('test-button');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
