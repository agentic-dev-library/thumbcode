import { fireEvent, render, screen } from '@testing-library/react';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders with default props', () => {
    const { container } = render(<TextArea />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('renders label text', () => {
    render(<TextArea label="Description" />);
    expect(screen.getByText('Description')).toBeTruthy();
  });

  it('renders helper text', () => {
    render(<TextArea helper="Max 500 characters" />);
    expect(screen.getByText('Max 500 characters')).toBeTruthy();
  });

  it('renders error text instead of helper when error is set', () => {
    render(<TextArea helper="Max 500 characters" error="Field is required" />);
    expect(screen.getByText('Field is required')).toBeTruthy();
  });

  it('shows character count when showCount is true', () => {
    render(<TextArea value="Hello" showCount maxLength={100} />);
    expect(screen.getByText('5/100')).toBeTruthy();
  });

  it('shows character count without max when maxLength is not set', () => {
    render(<TextArea value="Hello" showCount />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onChange when text changes', () => {
    const onChange = vi.fn();
    render(<TextArea value="initial" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'updated' } });
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('renders required indicator', () => {
    render(<TextArea label="Description" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });
});
