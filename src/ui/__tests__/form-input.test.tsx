import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '../form/Input';

describe('Input (src/ui)', () => {
  it('renders input element', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Name" placeholder="Enter name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<Input placeholder="x" />);
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });

  it('calls onChangeText with value', () => {
    const onChangeText = vi.fn();
    render(<Input onChangeText={onChangeText} placeholder="type" />);
    fireEvent.change(screen.getByPlaceholderText('type'), {
      target: { value: 'hello' },
    });
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('calls native onChange handler', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder="type" />);
    fireEvent.change(screen.getByPlaceholderText('type'), {
      target: { value: 'x' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message and applies error styling', () => {
    render(<Input error="Required field" placeholder="x" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('x');
    expect(input.className).toContain('border-coral-500');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="x" />);
    const input = screen.getByPlaceholderText('x');
    expect(input.className).toContain('custom-class');
  });
});
