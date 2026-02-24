import { fireEvent, render, screen } from '@testing-library/react';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders with placeholder', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<TextInput label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<TextInput label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<TextInput onChange={onChange} placeholder="type" />);
    fireEvent.change(screen.getByPlaceholderText('type'), {
      target: { value: 'hello' },
    });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('shows error message', () => {
    render(<TextInput error="Required field" testID="test-input" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<TextInput helper="Enter your full name" testID="test-input" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(<TextInput disabled placeholder="disabled" />);
    expect(screen.getByPlaceholderText('disabled')).toBeDisabled();
  });

  it('applies focus and blur border classes', () => {
    render(<TextInput placeholder="focus-test" />);
    const input = screen.getByPlaceholderText('focus-test');
    fireEvent.focus(input);
    expect(input.className).toContain('border-teal-500');
    fireEvent.blur(input);
    expect(input.className).toContain('border-neutral-600');
  });

  it('sets aria-invalid when error present', () => {
    render(<TextInput error="Error" placeholder="err" />);
    expect(screen.getByPlaceholderText('err')).toHaveAttribute('aria-invalid', 'true');
  });
});
