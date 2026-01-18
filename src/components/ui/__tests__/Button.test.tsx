import { render, screen } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    const buttonText = screen.getByText('Test Button');
    expect(buttonText).toBeDefined();
  });
});
